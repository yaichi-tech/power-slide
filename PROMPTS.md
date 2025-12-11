# LLM Prompts for Slide Generation

## Basic Prompt

```
Create an HTML presentation about [TOPIC].

Requirements:
- Use this HTML structure for slides:
  <section class="slide">content</section>
- Each slide must be exactly 1920x1080px (16:9 aspect ratio)
- Include inline CSS styles in the <head>
- Create [N] slides covering: [LIST OF TOPICS]

CSS Guidelines:
- Set .slide { width: 1920px; height: 1080px; display: flex; }
- Use large fonts (h1: 72-96px, body: 36-48px)
- Keep text minimal per slide
- Use gradients for backgrounds
```

## Detailed Prompt (Recommended)

```
Create a professional HTML presentation about [TOPIC].

Structure:
1. Title slide with main heading and subtitle
2. [N] content slides
3. Closing/Thank you slide

Technical Requirements:
- HTML structure: each slide is a <section class="slide">
- Slide dimensions: exactly 1920px × 1080px
- All styles must be inline in <style> tag
- Font sizes: titles 72-96px, body text 36-48px
- Use flexbox for centering content

Design Guidelines:
- Color scheme: [describe colors or "modern dark theme"]
- Background: gradient or solid color
- Font: system fonts (-apple-system, sans-serif)
- Keep each slide focused on ONE key point
- Use bullet points (max 4-5 per slide)
- Leave plenty of whitespace

Content to cover:
1. [First topic]
2. [Second topic]
3. [Third topic]
...
```

## Quick Prompt for Simple Presentations

```
Generate an HTML presentation with [N] slides about [TOPIC].
Each slide: <section class="slide"> with width:1920px, height:1080px.
Include all CSS inline. Use large fonts and gradient backgrounds.
Topics: [LIST]
```

## Example: Tech Presentation

```
Create an HTML presentation about "Introduction to TypeScript".

Slides needed:
1. Title: "TypeScript 101"
2. What is TypeScript?
3. Key Benefits (type safety, IDE support, etc.)
4. Basic Syntax Examples
5. Getting Started
6. Thank you slide

Design: Modern dark theme with blue/purple accents.
Use code examples where appropriate (style them with monospace font).
Each slide is <section class="slide"> at 1920x1080px.
All CSS inline in <head>.
```

## Example: Business Presentation

```
Create an HTML presentation for a quarterly business review.

Slides:
1. Title: "Q4 2024 Results"
2. Revenue Highlights
3. Key Achievements
4. Challenges Faced
5. Q1 2025 Goals
6. Thank You

Design: Clean, professional. White background with blue accents.
Use large, bold numbers for metrics.
Each slide is <section class="slide"> at 1920x1080px.
```

## Tips for Better Results

1. **Be specific about content** - List exact topics for each slide
2. **Specify the design style** - "minimal", "dark tech", "corporate", etc.
3. **Mention the audience** - Helps LLM adjust complexity
4. **Include examples** - "similar to Apple keynote style"
5. **Limit slides** - 5-10 slides works best

## After Generation

Convert the HTML to PDF:
```bash
npx tsx src/index.ts slides.html -o presentation.pdf

# If CSS effects don't render correctly, use screenshot mode:
npx tsx src/index.ts slides.html -o presentation.pdf --screenshot
```
