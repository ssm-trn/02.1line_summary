<<<<<<< HEAD
# URL要約アプリ

Google Gemini APIを使用して、Webページの内容を1文で要約するWebアプリケーションです。

## 機能

- URLを入力するだけで、Webページの内容を1文で要約
- シンプルで直感的なユーザーインターフェース
- レスポンシブデザインでスマートフォンにも対応

## セットアップ手順

1. リポジトリをクローンします：
   ```bash
   git clone [リポジトリのURL]
   cd url-summarizer
   ```

2. 依存関係をインストールします：
   ```bash
   npm install
   ```

3. 環境変数を設定します：
   - `.env` ファイルを作成し、以下のように設定します：
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     PORT=3000
     ```
   - `your_gemini_api_key_here` をGoogle Gemini APIのAPIキーに置き換えてください。

## アプリケーションの実行

開発モードで起動する場合：
```bash
npm run dev
```

本番モードで起動する場合：
```bash
npm start
```

アプリケーションは `http://localhost:3000` で起動します。

## 使用技術

- フロントエンド: HTML5, CSS3, JavaScript (Vanilla JS)
- バックエンド: Node.js, Express
- その他: 
  - Google Gemini API (要約生成)
  - JSDOM & Readability (コンテンツ抽出)
  - Axios (HTTPリクエスト)

## ライセンス

MIT License
=======
# 02.1line_summary
02.1line_summary
>>>>>>> 9f3b5eb68749480ca6430289c9cea4c49d70db0e
