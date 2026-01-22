# Power Slide

HTMLを16:9のPDFスライドに変換するツール。LLMによるプレゼン生成に最適。

## 特徴

- HTML/CSSからPDFへ変換
- 16:9アスペクト比（1920x1080）
- 複数スライド対応
- スクリーンショットモードで完全なCSS互換性

## インストール

```bash
npm install -g @yaichi/power-slide
npx playwright install chromium
```

## 使い方

### コマンド

```bash
# PDF生成
power-slide generate <input.html> -o output.pdf
power-slide g <input.html> -o output.pdf  # 短縮形

# テンプレート出力
power-slide template [name]    # basic（デフォルト）, minimal, dark
power-slide t --list           # 利用可能なテンプレート一覧
power-slide t dark > slides.html

# LLMプロンプト出力
power-slide prompt             # 英語
power-slide p --ja             # 日本語
```

### 生成オプション

| オプション | 説明 | デフォルト |
|-----------|------|-----------|
| `-o, --output <file>` | 出力PDFファイル | `output.pdf` |
| `--width <px>` | スライド幅 | `1920` |
| `--height <px>` | スライド高さ | `1080` |
| `-s, --screenshot` | スクリーンショットモード（CSS完全対応） | `false` |
| `-r, --resolution <preset>` | 解像度プリセット: `high`, `medium`, `low` | `high` |
| `--scale <number>` | PDFスケール（0.1〜2） | `1` |
| `-q, --quality <preset>` | 品質プリセット: `high`, `standard`, `draft` | `high` |

### ファイルサイズ削減

解像度と品質プリセットでPDFファイルサイズを削減できます：

```bash
# ドラフト品質（960x540、scale 0.9）- 最小ファイルサイズ
power-slide g input.html -o output.pdf -q draft

# 標準品質（1280x720）- プレゼン用途に十分
power-slide g input.html -o output.pdf -q standard

# 解像度とスケールを個別指定
power-slide g input.html -o output.pdf -r medium --scale 0.8
```

| プリセット | 解像度 | スケール | 用途 |
|-----------|--------|---------|------|
| `high` | 1920x1080 | 1 | 高品質印刷 |
| `standard` | 1280x720 | 1 | プレゼン・共有 |
| `draft` | 960x540 | 0.9 | レビュー・ドラフト |

**注意:** `--width`/`--height`を指定するとプリセットより優先されます。

### スクリーンショットモード

一部のCSSプロパティはPDF印刷モードで正しくレンダリングされません。`-s`フラグで完全なCSS対応が可能です：

```bash
power-slide g input.html -o output.pdf -s
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

`template`コマンドでスターターテンプレートを取得：

```bash
power-slide t --list           # テンプレート一覧
power-slide t basic > slides.html
power-slide t dark > slides.html
```

利用可能なテンプレート：
- `basic` - タイトル、コンテンツ、終了スライドの標準構成
- `minimal` - シンプルで清潔なデザイン
- `dark` - モダンなダークテーマ（コードブロック付き）

## LLMでスライドを生成する

LLM（Claude、GPTなど）を使ってプレゼンHTMLを生成できます。

```bash
# プロンプト例を取得
power-slide p         # 英語
power-slide p --ja    # 日本語
```

### 簡単な例

プロンプト：
```
「Git入門」について5枚のHTMLプレゼンを作成してください。
各スライド: <section class="slide">、サイズは1920x1080px。
CSSはすべてインラインで。ダークテーマでグラデーション背景。
```

変換：
```bash
power-slide g git-intro.html -o git-intro.pdf
```

## 既知の問題

### macOSプレビューアプリ

一部のCSSエフェクト（例: `text-shadow`）がmacOSのプレビュー.appで正しく表示されないことがあります。これはプレビューのレンダリングの問題であり、PDF生成の問題ではありません。

**回避策:** Chromeや他のPDFビューアでPDFを開くと正しく表示されます。

## 開発

```bash
git clone https://github.com/yaichi/power-slide
cd power-slide
npm install
npm link
```

### ローカル変更のテスト

`npm link`を実行後、`power-slide`コマンドはローカルの開発版を使用します：

```bash
# ローカルの変更をテスト
power-slide g test.html -o test.pdf

# 使用中のバージョンを確認
power-slide --version
```

リンクを解除して公開版に戻すには：

```bash
npm unlink -g @yaichi/power-slide
npm install -g @yaichi/power-slide
```

## ライセンス

Apache-2.0
