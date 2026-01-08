import { chromium, type Browser, type Page } from "playwright";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { PDFDocument } from "pdf-lib";

export interface ConvertOptions {
  inputPath: string;
  outputPath: string;
  width?: number;
  height?: number;
  screenshot?: boolean;
}

export interface Dependencies {
  launchBrowser?: () => Promise<Browser>;
  readFile?: (path: string, encoding: BufferEncoding) => Promise<string>;
  readFileBuffer?: (path: string) => Promise<Buffer>;
  writeFile?: (path: string, data: Uint8Array | string) => Promise<void>;
  unlink?: (path: string) => Promise<void>;
  log?: (message: string) => void;
}

const defaultDeps: Required<Dependencies> = {
  launchBrowser: () => chromium.launch(),
  readFile: (path, encoding) => readFile(path, encoding),
  readFileBuffer: (path) => readFile(path),
  writeFile: (path, data) => writeFile(path, data),
  unlink: (path) => unlink(path),
  log: console.log,
};

export async function convertHtmlToPdf(
  options: ConvertOptions,
  deps: Dependencies = {}
): Promise<void> {
  const {
    launchBrowser,
    readFile: readFileImpl,
    writeFile: writeFileImpl,
    log,
  } = { ...defaultDeps, ...deps };

  const {
    inputPath,
    outputPath,
    width = 1920,
    height = 1080,
    screenshot = false,
  } = options;

  const absoluteInputPath = resolve(inputPath);
  const html = await readFileImpl(absoluteInputPath, "utf-8");

  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: "networkidle" });

  const slideCount = await page.locator(".slide").count();
  const pageCount = slideCount > 1 ? slideCount : 1;

  if (screenshot) {
    await convertWithScreenshot(page, outputPath, width, height, slideCount, { writeFile: writeFileImpl });
  } else if (slideCount > 1) {
    await convertMultipleSlides(page, outputPath, width, height, slideCount, deps);
  } else {
    await page.pdf({
      path: outputPath,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  }

  await browser.close();
  log(`PDF generated: ${outputPath} (${pageCount} page(s))${screenshot ? " [screenshot mode]" : ""}`);
}

interface WriteFileDep {
  writeFile: (path: string, data: Uint8Array | string) => Promise<void>;
}

async function convertWithScreenshot(
  page: Page,
  outputPath: string,
  width: number,
  height: number,
  slideCount: number,
  deps: WriteFileDep
): Promise<void> {
  const pdf = await PDFDocument.create();

  if (slideCount > 1) {
    await page.addStyleTag({
      content: `.slide { display: none !important; }`
    });

    for (let i = 0; i < slideCount; i++) {
      await page.addStyleTag({
        content: `.slide:nth-child(${i + 1}) { display: flex !important; }`
      });

      const screenshot = await page.screenshot({ type: "png" });
      const image = await pdf.embedPng(screenshot);
      const pdfPage = pdf.addPage([width, height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width, height });

      await page.addStyleTag({
        content: `.slide:nth-child(${i + 1}) { display: none !important; }`
      });
    }
  } else {
    const screenshot = await page.screenshot({ type: "png" });
    const image = await pdf.embedPng(screenshot);
    const pdfPage = pdf.addPage([width, height]);
    pdfPage.drawImage(image, { x: 0, y: 0, width, height });
  }

  const pdfBytes = await pdf.save();
  await deps.writeFile(outputPath, pdfBytes);
}

async function convertMultipleSlides(
  page: Page,
  outputPath: string,
  width: number,
  height: number,
  slideCount: number,
  deps: Dependencies
): Promise<void> {
  const {
    readFileBuffer = defaultDeps.readFileBuffer,
    writeFile: writeFileImpl = defaultDeps.writeFile,
    unlink: unlinkImpl = defaultDeps.unlink,
  } = deps;

  const tempPdfs: string[] = [];
  const outputDir = dirname(resolve(outputPath));

  await page.addStyleTag({
    content: `.slide { display: none !important; }`
  });

  for (let i = 0; i < slideCount; i++) {
    await page.addStyleTag({
      content: `.slide:nth-child(${i + 1}) { display: flex !important; }`
    });

    const tempPath = resolve(outputDir, `.temp-slide-${i}.pdf`);
    tempPdfs.push(tempPath);

    await page.pdf({
      path: tempPath,
      width: `${width}px`,
      height: `${height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    await page.addStyleTag({
      content: `.slide:nth-child(${i + 1}) { display: none !important; }`
    });
  }

  const mergedPdf = await PDFDocument.create();

  for (const tempPath of tempPdfs) {
    const pdfBytes = await readFileBuffer(tempPath);
    const pdf = await PDFDocument.load(pdfBytes);
    const [copiedPage] = await mergedPdf.copyPages(pdf, [0]);
    mergedPdf.addPage(copiedPage);
  }

  const mergedPdfBytes = await mergedPdf.save();
  await writeFileImpl(outputPath, mergedPdfBytes);

  for (const tempPath of tempPdfs) {
    await unlinkImpl(tempPath);
  }
}
