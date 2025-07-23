const { GoogleGenerativeAI } = require('@google/generative-ai');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const axios = require('axios');

// Initialize Google Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

module.exports = async (req, res) => {
  // CORS headers - 参考実装に完全に合わせる
  res.setHeader('Access-Control-Allow-Origin', 'https://ssm-trn.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Preflight request (OPTIONS) に対応
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // リクエストからURLを取得 (GETパラメータ or POSTボディ)
    let url = '';
    if (req.method === 'GET') {
      // GETリクエストの場合はクエリパラメータから取得
      url = req.query.url || '';
    } else if (req.method === 'POST') {
      // POSTリクエストの場合はボディから取得
      if (req.headers['content-type'] === 'application/json') {
        // JSON形式のボディをパース
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        url = body.url || '';
      } else if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
        // フォームデータの場合はそのまま取得
        url = req.body.url || '';
      }
    }

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    console.log('Fetching URL:', url);
    
    // ウェブページのコンテンツを取得
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });

    // コンテンツをパース
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    if (!article || !article.textContent) {
      throw new Error('記事の内容を抽出できませんでした');
    }

    // Geminiで要約を生成
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `以下の記事を1文で簡潔に要約してください。日本語でお願いします。\n\n${article.textContent.substring(0, 30000)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // 結果を返す
    res.status(200).json({ 
      summary,
      title: article.title || 'タイトルなし',
      url: url
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: '要約の生成に失敗しました',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
