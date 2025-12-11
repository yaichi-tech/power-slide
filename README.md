# Power Slide

[日本語版 README](./README.ja.md)

Convert HTML to 16:9 PDF slides. Designed for LLM-generated presentations.

## Features

- HTML/CSS to PDF conversion
- 16:9 aspect ratio (1920x1080)
- Multiple slides support
- Screenshot mode for full CSS compatibility

## Installation

```bash
npm install
npx playwright install chromium
```

## Usage

### Basic

```bash
npx tsx src/index.ts input.html -o output.pdf
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <file>` | Output PDF file | `output.pdf` |
| `--width <px>` | Slide width | `1920` |
| `--height <px>` | Slide height | `1080` |
| `-s, --screenshot` | Screenshot mode (better CSS support) | `false` |

### Screenshot Mode

Some CSS properties don't render correctly in PDF print mode. Use `-s` flag for full CSS support:

```bash
npx tsx src/index.ts input.html -o output.pdf -s
```

**Note:** Screenshot mode produces rasterized output (images embedded in PDF).

## HTML Structure

Each slide is a `<section class="slide">`:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .slide {
      width: 1920px;
      height: 1080px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  </style>
</head>
<body>
  <section class="slide">
    <h1>Slide 1</h1>
  </section>
  <section class="slide">
    <h1>Slide 2</h1>
  </section>
</body>
</html>
```

## Templates

See `templates/` directory for starter templates:

- `basic.html` - Standard presentation with title, content, and end slides
- `minimal.html` - Clean, minimal design
- `dark.html` - Modern dark theme with code blocks

## Generating Slides with LLM

Use an LLM (Claude, GPT, etc.) to generate presentation HTML. See [PROMPTS.md](./PROMPTS.md) for example prompts.

### Quick Example

Prompt:
```
Create an HTML presentation about "Introduction to Git" with 5 slides.
Each slide: <section class="slide"> at 1920x1080px.
Include all CSS inline. Dark theme with gradient backgrounds.
```

Then convert:
```bash
npx tsx src/index.ts git-intro.html -o git-intro.pdf
```

## Known Issues

### macOS Preview App

Some CSS effects (e.g., `text-shadow`) may render incorrectly in macOS Preview.app. This is a Preview rendering issue, not a PDF generation issue.

**Workaround:** Open the PDF in Chrome or another PDF viewer for accurate rendering.

## License

MIT
