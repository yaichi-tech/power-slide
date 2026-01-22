#!/usr/bin/env node
import { program } from "commander";
import { existsSync } from "node:fs";
import { readFile, mkdir, copyFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { convertHtmlToPdf } from "./html-to-pdf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

program
  .name("power-slide")
  .description("HTML to 16:9 PDF slide generator")
  .version("0.1.1");

// Generate PDF command
program
  .command("generate")
  .alias("g")
  .description("Convert HTML to PDF")
  .argument("<input>", "Input HTML file")
  .option("-o, --output <file>", "Output PDF file", "output.pdf")
  .option("-s, --screenshot", "Use screenshot mode (better CSS support)")
  .option("--scale <number>", "PDF scale factor (0.1-2, default: 1)")
  .action(async (input: string, options: {
    output: string;
    screenshot?: boolean;
    scale?: string;
  }) => {
    try {
      // Validate scale option
      const scale = options.scale ? parseFloat(options.scale) : undefined;
      if (scale !== undefined && (isNaN(scale) || scale < 0.1 || scale > 2)) {
        console.error(`Invalid scale: ${options.scale}. Must be a number between 0.1 and 2.`);
        process.exit(1);
      }

      await convertHtmlToPdf({
        inputPath: input,
        outputPath: options.output,
        screenshot: options.screenshot,
        scale,
      });
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Template command
program
  .command("template")
  .alias("t")
  .description("Output a starter template")
  .argument("[name]", "Template name: basic, minimal, dark", "basic")
  .option("-l, --list", "List available templates")
  .action(async (name: string, options: { list?: boolean }) => {
    const templates = ["basic", "minimal", "dark"];

    if (options.list) {
      console.log("Available templates:");
      templates.forEach(t => console.log(`  - ${t}`));
      return;
    }

    if (!templates.includes(name)) {
      console.error(`Unknown template: ${name}`);
      console.error(`Available: ${templates.join(", ")}`);
      process.exit(1);
    }

    try {
      const templatePath = resolve(rootDir, "templates", `${name}.html`);
      const content = await readFile(templatePath, "utf-8");
      console.log(content);
    } catch (error) {
      console.error("Error reading template:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Prompt command
program
  .command("prompt")
  .alias("p")
  .description("Output example prompts for LLM")
  .option("-j, --ja", "Output Japanese version")
  .action(async (options: { ja?: boolean }) => {
    try {
      const filename = options.ja ? "PROMPTS.ja.md" : "PROMPTS.md";
      const promptPath = resolve(rootDir, filename);
      const content = await readFile(promptPath, "utf-8");
      console.log(content);
    } catch (error) {
      console.error("Error reading prompts:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Init command
program
  .command("init")
  .alias("i")
  .description("Initialize a new slides project")
  .argument("[dir]", "Directory name", "slides")
  .action(async (dir: string) => {
    const targetDir = resolve(process.cwd(), dir);

    if (existsSync(targetDir)) {
      console.error(`Error: Directory "${dir}" already exists`);
      process.exit(1);
    }

    try {
      // Create directories
      await mkdir(targetDir, { recursive: true });
      await mkdir(resolve(targetDir, "templates"), { recursive: true });
      await mkdir(resolve(targetDir, "prompts"), { recursive: true });

      // Copy templates
      const templates = ["basic", "minimal", "dark"];
      for (const name of templates) {
        await copyFile(
          resolve(rootDir, "templates", `${name}.html`),
          resolve(targetDir, "templates", `${name}.html`)
        );
      }

      // Copy prompts
      await copyFile(
        resolve(rootDir, "PROMPTS.md"),
        resolve(targetDir, "prompts", "PROMPTS.md")
      );
      await copyFile(
        resolve(rootDir, "PROMPTS.ja.md"),
        resolve(targetDir, "prompts", "PROMPTS.ja.md")
      );

      // Create sample.html
      const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sample Slides</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .slide {
      width: 1920px;
      height: 1080px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: system-ui, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 80px;
    }
    h1 { font-size: 120px; margin-bottom: 40px; }
    h2 { font-size: 80px; margin-bottom: 40px; }
    p { font-size: 48px; color: #a0a0a0; }
    ul { font-size: 48px; line-height: 1.8; }
  </style>
</head>
<body>
  <section class="slide">
    <h1>Your Presentation</h1>
    <p>Created with Power Slide</p>
  </section>
  <section class="slide">
    <h2>Getting Started</h2>
    <ul>
      <li>Edit this file or use a template</li>
      <li>Run: power-slide g sample.html -o output.pdf</li>
      <li>Check templates/ for more styles</li>
    </ul>
  </section>
</body>
</html>`;
      await writeFile(resolve(targetDir, "sample.html"), sampleHtml);

      // Create .gitignore
      await writeFile(resolve(targetDir, ".gitignore"), "*.pdf\n");

      // Success message
      console.log(`Created slides project in ./${dir}\n`);
      console.log("Next steps:");
      console.log(`  cd ${dir}`);
      console.log("  power-slide g sample.html -o sample.pdf\n");
      console.log("Files:");
      console.log("  sample.html     Sample slide (try it now!)");
      console.log("  templates/      Starter templates");
      console.log("  prompts/        LLM prompt examples");
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
