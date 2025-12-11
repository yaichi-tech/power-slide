# Power Slide

HTMLを16:9のPDFスライドに変換するツール。LLMによるプレゼン生成に最適。

## 特徴

- HTML/CSSからPDFへ変換
- 16:9アスペクト比（1920x1080）
- 複数スライド対応
- スクリーンショットモードで完全なCSS互換性

## インストール

```bash
npm install
npx playwright install chromium
```

## 使い方

### 基本

```bash
npx tsx src/index.ts input.html -o output.pdf
```

### オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `-o, --output <file>` | 出力PDFファイル | `output.pdf` |
| `--width <px>` | スライド幅 | `1920` |
| `--height <px>` | スライド高さ | `1080` |
| `-s, --screenshot` | スクリーンショットモード（CSS完全対応） | `false` |

### スクリーンショットモード

一部のCSSプロパティはPDF印刷モードで正しくレンダリングされません。`-s`フラグで完全なCSS対応が可能です：

```bash
npx tsx src/index.ts input.html -o output.pdf -s
```

**注意:** スクリーンショットモードはラスタライズ出力（画像埋め込みPDF）になります。

## HTML構造

各スライドは`<section class="slide">`で記述します：

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
    <h1>スライド1</h1>
  </section>
  <section class="slide">
    <h1>スライド2</h1>
  </section>
</body>
</html>
```

## テンプレート

`templates/`ディレクトリにスターターテンプレートがあります：

- `basic.html` - タイトル、コンテンツ、終了スライドの標準構成
- `minimal.html` - シンプルで清潔なデザイン
- `dark.html` - モダンなダークテーマ（コードブロック付き）

## LLMでスライドを生成する

LLM（Claude、GPTなど）を使ってプレゼンHTMLを生成できます。プロンプト例は[PROMPTS.ja.md](./PROMPTS.ja.md)を参照。

### 簡単な例

プロンプト：
```
「Git入門」について5枚のHTMLプレゼンを作成してください。
各スライド: <section class="slide">、サイズは1920x1080px。
CSSはすべてインラインで。ダークテーマでグラデーション背景。
```

変換：
```bash
npx tsx src/index.ts git-intro.html -o git-intro.pdf
```

## 既知の問題

### macOSプレビューアプリ

一部のCSSエフェクト（例: `text-shadow`）がmacOSのプレビュー.appで正しく表示されないことがあります。これはプレビューのレンダリングの問題であり、PDF生成の問題ではありません。

**回避策:** Chromeや他のPDFビューアでPDFを開くと正しく表示されます。

## ライセンス

MIT
