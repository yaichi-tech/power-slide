# LLMプロンプト例：スライド生成用

## 基本プロンプト

```
[トピック]についてHTMLプレゼンテーションを作成してください。

要件：
- スライドの構造: <section class="slide">コンテンツ</section>
- 各スライドは1920x1080px（16:9アスペクト比）
- CSSは<head>内にインラインで記述
- [N]枚のスライドで以下をカバー: [トピックリスト]

CSSガイドライン：
- :root { --base-width: 1920; } を設定
- .slide { width: calc(var(--base-width) * 1px); height: calc(var(--base-width) * 1px * 9 / 16); transform-origin: top left; transform: scale(calc(100vw / (var(--base-width) * 1px))); margin-bottom: calc((100vw - var(--base-width) * 1px) * 9 / 16); display: flex; }
- 大きなフォントを使用（h1: 72-96px、本文: 36-48px）
- 1スライドあたりのテキストは最小限に
- 背景にはグラデーションを使用
```

## 詳細プロンプト（推奨）

```
[トピック]についてプロフェッショナルなHTMLプレゼンテーションを作成してください。

構成：
1. タイトルスライド（メインタイトルとサブタイトル）
2. コンテンツスライド [N]枚
3. 締め/Thank youスライド

技術要件：
- HTML構造: 各スライドは<section class="slide">
- CSS変数: :root { --base-width: 1920; }
- スライドサイズ: width: calc(var(--base-width) * 1px), height: calc(var(--base-width) * 1px * 9 / 16)
- レスポンシブ対応: transform-origin: top left; transform: scale(calc(100vw / (var(--base-width) * 1px)));
- スライド間の余白除去: margin-bottom: calc((100vw - var(--base-width) * 1px) * 9 / 16);
- スタイルはすべて<style>タグ内にインラインで
- フォントサイズ: タイトル72-96px、本文36-48px
- コンテンツの中央揃えにはflexboxを使用

デザインガイドライン：
- 配色: [色を指定、または「モダンなダークテーマ」など]
- 背景: グラデーションまたは単色
- フォント: システムフォント（-apple-system, sans-serif）
- 各スライドは1つのポイントに集中
- 箇条書きは最大4-5項目
- 余白を十分に取る

カバーする内容：
1. [トピック1]
2. [トピック2]
3. [トピック3]
...
```

## クイックプロンプト（シンプルなプレゼン用）

```
[トピック]について[N]枚のHTMLプレゼンを作成。
各スライド: <section class="slide">、CSS transformでレスポンシブ対応。
:root { --base-width: 1920; } と transform: scale(calc(100vw / (var(--base-width) * 1px))) を使用。
CSSはインラインで。大きなフォントとグラデーション背景。
内容: [リスト]
```

## 具体例：技術プレゼン

```
「TypeScript入門」についてHTMLプレゼンテーションを作成してください。

スライド構成：
1. タイトル: 「TypeScript 101」
2. TypeScriptとは？
3. 主なメリット（型安全性、IDE対応など）
4. 基本的な構文例
5. 始め方
6. Thank youスライド

デザイン: モダンなダークテーマ、青/紫のアクセント。
適切な箇所にコード例を含める（monospaceフォントでスタイリング）。
各スライドは<section class="slide">、transform scaleでレスポンシブ対応。
CSSは<head>内にインライン。
```

## 具体例：ビジネスプレゼン

```
四半期ビジネスレビュー用のHTMLプレゼンテーションを作成してください。

スライド構成：
1. タイトル: 「2024年Q4 業績報告」
2. 売上ハイライト
3. 主な成果
4. 直面した課題
5. 2025年Q1の目標
6. Thank you

デザイン: クリーンでプロフェッショナル。白背景に青のアクセント。
指標には大きく太い数字を使用。
各スライドは<section class="slide">、transform scaleでレスポンシブ対応。
```

## より良い結果を得るコツ

1. **内容を具体的に指定** - 各スライドのトピックを明示
2. **デザインスタイルを明記** - 「ミニマル」「ダークテック」「コーポレート」など
3. **対象者を伝える** - LLMが複雑さを調整してくれる
4. **参考例を挙げる** - 「Appleのキーノート風」など
5. **スライド数を絞る** - 5-10枚が最適

## 生成後の変換

HTMLをPDFに変換：
```bash
power-slide g slides.html -o presentation.pdf

# CSSエフェクトが正しくレンダリングされない場合はスクリーンショットモード：
power-slide g slides.html -o presentation.pdf -s
```
