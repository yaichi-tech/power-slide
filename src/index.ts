#!/usr/bin/env npx tsx
import { program } from "commander";
import { convertHtmlToPdf } from "./html-to-pdf.js";

program
  .name("power-slide")
  .description("Convert HTML to 16:9 PDF slides")
  .version("0.1.0")
  .argument("<input>", "Input HTML file")
  .option("-o, --output <file>", "Output PDF file", "output.pdf")
  .option("--width <px>", "Width in pixels", "1920")
  .option("--height <px>", "Height in pixels", "1080")
  .option("-s, --screenshot", "Use screenshot mode (better CSS support, but rasterized)")
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

program.parse();
