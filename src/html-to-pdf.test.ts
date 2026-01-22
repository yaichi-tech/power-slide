import { describe, it, expect, vi, beforeEach } from "vitest";
import { convertHtmlToPdf, type Dependencies } from "./html-to-pdf.js";
import { PDFDocument } from "pdf-lib";

const SINGLE_SLIDE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    .slide { width: 1920px; height: 1080px; display: flex; }
  </style>
</head>
<body>
  <section class="slide"><h1>Test Slide</h1></section>
</body>
</html>`;

const MULTI_SLIDE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    .slide { width: 1920px; height: 1080px; display: flex; }
  </style>
</head>
<body>
  <section class="slide"><h1>Slide 1</h1></section>
  <section class="slide"><h1>Slide 2</h1></section>
  <section class="slide"><h1>Slide 3</h1></section>
</body>
</html>`;

function createMockPage(slideCount: number, writtenFiles: Map<string, Uint8Array | string>) {
  const pdfCalls: Array<{ path: string; width: string; height: string; scale?: number }> = [];
  const screenshotCalls: Array<{ type: string }> = [];

  return {
    pdfCalls,
    screenshotCalls,
    page: {
      setViewportSize: vi.fn(),
      setContent: vi.fn(),
      locator: vi.fn(() => ({
        count: vi.fn().mockResolvedValue(slideCount),
      })),
      addStyleTag: vi.fn(),
      pdf: vi.fn(async (options: { path: string; width: string; height: string; scale?: number }) => {
        pdfCalls.push({ path: options.path, width: options.width, height: options.height, scale: options.scale });
        const pdf = await PDFDocument.create();
        pdf.addPage([1920, 1080]);
        const pdfBytes = await pdf.save();
        writtenFiles.set(options.path, pdfBytes);
        return pdfBytes;
      }),
      screenshot: vi.fn(async (options: { type: string }) => {
        screenshotCalls.push({ type: options.type });
        return Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          "base64"
        );
      }),
    },
  };
}

function createMockBrowser(mockPage: ReturnType<typeof createMockPage>["page"]) {
  return {
    newPage: vi.fn().mockResolvedValue(mockPage),
    close: vi.fn(),
  };
}

describe("convertHtmlToPdf", () => {
  let logMessages: string[];
  let writtenFiles: Map<string, Uint8Array | string>;
  let deletedFiles: string[];

  beforeEach(() => {
    logMessages = [];
    writtenFiles = new Map();
    deletedFiles = [];
  });

  function createDeps(mockPage: ReturnType<typeof createMockPage>["page"], html: string): Dependencies {
    const mockBrowser = createMockBrowser(mockPage);

    return {
      launchBrowser: vi.fn().mockResolvedValue(mockBrowser),
      readFile: vi.fn().mockResolvedValue(html),
      readFileBuffer: vi.fn(async (path: string) => {
        const data = writtenFiles.get(path);
        if (data instanceof Uint8Array) {
          return Buffer.from(data);
        }
        throw new Error(`File not found: ${path}`);
      }),
      writeFile: vi.fn(async (path: string, data: Uint8Array | string) => {
        writtenFiles.set(path, data);
      }),
      unlink: vi.fn(async (path: string) => {
        deletedFiles.push(path);
      }),
      log: vi.fn((message: string) => {
        logMessages.push(message);
      }),
    };
  }

  it("should read HTML file and launch browser", async () => {
    const { page } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(deps.readFile).toHaveBeenCalledWith(expect.stringContaining("input.html"), "utf-8");
    expect(deps.launchBrowser).toHaveBeenCalled();
  });

  it("should set viewport size with default dimensions", async () => {
    const { page } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(page.setViewportSize).toHaveBeenCalledWith({ width: 1920, height: 1080 });
  });

  it("should generate single page PDF for single slide", async () => {
    const { page, pdfCalls } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(pdfCalls).toHaveLength(1);
    expect(pdfCalls[0]).toEqual({
      path: "output.pdf",
      width: "1920px",
      height: "1080px",
      scale: 1,
    });
  });

  it("should generate multi-page PDF for multiple slides", async () => {
    const { page, pdfCalls } = createMockPage(3, writtenFiles);
    const deps = createDeps(page, MULTI_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(pdfCalls).toHaveLength(3);
    expect(pdfCalls[0].path).toContain(".temp-slide-0.pdf");
    expect(pdfCalls[1].path).toContain(".temp-slide-1.pdf");
    expect(pdfCalls[2].path).toContain(".temp-slide-2.pdf");

    expect(writtenFiles.has("output.pdf")).toBe(true);
    expect(deletedFiles).toHaveLength(3);
  });

  it("should use screenshot mode when specified", async () => {
    const { page, screenshotCalls, pdfCalls } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf", screenshot: true },
      deps
    );

    expect(screenshotCalls).toHaveLength(1);
    expect(screenshotCalls[0].type).toBe("png");
    expect(pdfCalls).toHaveLength(0);
    expect(writtenFiles.has("output.pdf")).toBe(true);
  });

  it("should take multiple screenshots for multiple slides in screenshot mode", async () => {
    const { page, screenshotCalls } = createMockPage(3, writtenFiles);
    const deps = createDeps(page, MULTI_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf", screenshot: true },
      deps
    );

    expect(screenshotCalls).toHaveLength(3);
    expect(writtenFiles.has("output.pdf")).toBe(true);

    const pdfData = writtenFiles.get("output.pdf");
    expect(pdfData).toBeInstanceOf(Uint8Array);
    const pdf = await PDFDocument.load(pdfData as Uint8Array);
    expect(pdf.getPageCount()).toBe(3);
  });

  it("should log success message with page count", async () => {
    const { page } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(logMessages).toHaveLength(1);
    expect(logMessages[0]).toContain("PDF generated");
    expect(logMessages[0]).toContain("output.pdf");
    expect(logMessages[0]).toContain("1 page(s)");
  });

  it("should log success message with screenshot mode indicator", async () => {
    const { page } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf", screenshot: true },
      deps
    );

    expect(logMessages[0]).toContain("[screenshot mode]");
  });

  it("should add style tags to hide/show slides for multiple slides", async () => {
    const { page } = createMockPage(3, writtenFiles);
    const deps = createDeps(page, MULTI_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(page.addStyleTag).toHaveBeenCalled();
  });

  it("should use default scale of 1", async () => {
    const { page, pdfCalls } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf" },
      deps
    );

    expect(pdfCalls[0].scale).toBe(1);
  });

  it("should use custom scale when specified", async () => {
    const { page, pdfCalls } = createMockPage(1, writtenFiles);
    const deps = createDeps(page, SINGLE_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf", scale: 0.8 },
      deps
    );

    expect(pdfCalls[0].scale).toBe(0.8);
  });

  it("should apply scale to multiple slides", async () => {
    const { page, pdfCalls } = createMockPage(3, writtenFiles);
    const deps = createDeps(page, MULTI_SLIDE_HTML);

    await convertHtmlToPdf(
      { inputPath: "input.html", outputPath: "output.pdf", scale: 0.8 },
      deps
    );

    expect(pdfCalls).toHaveLength(3);
    expect(pdfCalls[0].scale).toBe(0.8);
    expect(pdfCalls[1].scale).toBe(0.8);
    expect(pdfCalls[2].scale).toBe(0.8);
  });
});
