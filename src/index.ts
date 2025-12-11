#!/usr/bin/env npx tsx
import { program } from "commander";
import { readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { convertHtmlToPdf } from "./html-to-pdf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");

program
  .name("power-slide")
  .description("HTML to 16:9 PDF slide generator")
  .version("0.1.0");

// Generate PDF command
program
  .command("generate")
  .alias("g")
  .description("Convert HTML to PDF")
  .argument("<input>", "Input HTML file")
  .option("-o, --output <file>", "Output PDF file", "output.pdf")
  .option("--width <px>", "Width in pixels", "1920")
  .option("--height <px>", "Height in pixels", "1080")
  .option("-s, --screenshot", "Use screenshot mode (better CSS support)")
  .action(async (input: string, options: { output: string; width: string; height: string; screenshot?: boolean }) => {
    try {
      await convertHtmlToPdf({
        inputPath: input,
        outputPath: options.output,
        width: parseInt(options.width, 10),
        height: parseInt(options.height, 10),
        screenshot: options.screenshot,
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

program.parse();
