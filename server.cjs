// 環境変数の読み込み
require('dotenv').config();

// アプリケーションの設定
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS設定
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ミドルウェア
app.use(cors(corsOptions));

// 大きなペイロードを処理するための設定
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb',
  parameterLimit: 1000000
}));

app.use(express.static(path.join(__dirname, 'public')));

// CORSプリフライトリクエスト対応
app.options('*', cors(corsOptions));

// ルートハンドラー
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CORSプロキシエンドポイント
app.use('/api/cors-proxy', require('./api/cors-proxy'));

// テスト用エンドポイント
app.get('/api/health', (req, res) => {
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    message: 'API is running successfully'
  };
  
  console.log('Health check requested:', response);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(response);
});

// シンプルなテスト用エンドポイント
app.get('/api/test', (req, res) => {
  const response = {
    success: true,
    message: 'テストエンドポイントが正常に動作しています',
    data: {
      time: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };
  
  console.log('Test endpoint accessed:', response);
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(response);
});

// CORSプロキシのルートを追加
const corsProxy = require('./api/cors-proxy.js');
app.use('/api/cors-proxy', corsProxy);
console.log('CORS Proxy が正常に読み込まれました');

// Gemini API endpoint - Using Gemini 2.5 Flash model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// Helper function to extract content from HTML string
async function extractContentFromHtml(html, sourceUrl = '') {
  try {
    console.log('Extracting content from HTML string');
    const { JSDOM } = require('jsdom');
    const { Readability } = require('@mozilla/readability');
    
    const dom = new JSDOM(html, {
      url: sourceUrl,
      runScripts: 'dangerously',
      resources: 'usable'
    });
    
    // Wait for dynamic content to load
    await new Promise(resolve => {
      if (dom.window.document.readyState === 'complete') {
        resolve();
      } else {
        dom.window.document.addEventListener('DOMContentLoaded', resolve);
        dom.window.addEventListener('load', resolve);
      }
    });
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'header', 'footer', 'nav', 'aside', 'iframe', 'script', 'style',
      '.header', '.footer', '.nav', '.sidebar', '.ad', '.ads', '.banner',
      '.cookie-banner', '.privacy-banner', '.newsletter', '.social-share'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = dom.window.document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      console.log('No article content found, falling back to body text');
      return dom.window.document.body.textContent || '';
    }
    
    console.log(`Extracted article content: ${article.textContent.length} characters`);
    return article.textContent;
  } catch (error) {
    console.error('Error extracting content from HTML:', error);
    throw new Error(`Failed to extract content from HTML: ${error.message}`);
  }
}

// Helper function to extract main content from URL
async function extractContent(url) {
  try {
    console.log(`Fetching content from URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000 // 10秒のタイムアウトを設定
    });
    
    const html = response.data;
    console.log(`Successfully fetched ${html.length} bytes of HTML`);
    
    const dom = new JSDOM(html, { 
      url,
      runScripts: 'dangerously',
      resources: 'usable'
    });
    
    // Wait for dynamic content to load
    await new Promise(resolve => {
      if (dom.window.document.readyState === 'complete') {
        resolve();
      } else {
        dom.window.document.addEventListener('DOMContentLoaded', resolve);
        dom.window.addEventListener('load', resolve);
      }
    });
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'header', 'footer', 'nav', 'aside', 'iframe', 'script', 'style',
      '.header', '.footer', '.nav', '.sidebar', '.ad', '.ads', '.banner',
      '.cookie-banner', '.privacy-banner', '.newsletter', '.social-share'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = dom.window.document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      console.log('No article content found, falling back to body text');
      return dom.window.document.body.textContent || '';
    }
    
    console.log(`Extracted article content: ${article.textContent.length} characters`);
    return article.textContent;
  } catch (error) {
    console.error('Error extracting content:', error);
    throw new Error(`Failed to extract content from the URL: ${error.message}`);
  }
}

// API endpoint to summarize URL
app.post('/api/summarize', async (req, res) => {
  console.log('Received summarize request:', Object.keys(req.body));
  
  try {
    const { url, content: htmlContent } = req.body;
    
    // Validate request
    if (!url && !htmlContent) {
      console.log('No URL or content provided');
      return res.status(400).json({ error: 'URLまたはコンテンツを入力してください' });
    }
    
    if (url && !isValidUrl(url)) {
      console.log('Invalid URL format:', url);
      return res.status(400).json({ error: '有効なURL形式を入力してください' });
    }
    
    let content;
    
    if (htmlContent) {
      // Use the HTML content provided in the request
      console.log('Using provided HTML content');
      content = await extractContentFromHtml(htmlContent, url || 'provided-content');
    } else {
      // Fall back to fetching the URL
      console.log('Extracting content from URL:', url);
      content = await extractContent(url);
    }
    
    if (!content) {
      throw new Error('コンテンツを抽出できませんでした');
    }
    console.log('Content extracted successfully');
    
    console.log('Generating summary with Gemini API...');
    
    try {
      // Clean up the content by removing extra whitespace and newlines
      const cleanContent = content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100000);
      
      console.log('First 500 chars of extracted content:', cleanContent.substring(0, 500) + '...');
      
      const prompt = `以下のウェブページの本文を注意深く読み、1文で簡潔に要約してください。
- タイトルや見出しではなく、実際の本文の内容を要約してください
- 重要なキーワードや具体的な情報を含めてください
- ナビゲーションやメニュー、フッターの内容は無視してください
- 「このページは...についてのページです」のような一般的な説明は避け、具体的な内容を要約してください

【ウェブページの本文】
${cleanContent}

【要約】`;

      console.log('Sending request to Gemini API...');
      console.log('Gemini API Key:', API_KEY ? '*** (hidden for security)' : 'Not found');
      console.log('Sending request to Gemini API:', GEMINI_API_URL);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };
      
      console.log('Sending request to Gemini API with body:', JSON.stringify(requestBody, null, 2));
      
      let response;
      try {
        response = await axios.post(
          `${GEMINI_API_URL}?key=${API_KEY}`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            validateStatus: status => true // To handle all status codes as resolved
          }
        );
        
        console.log('Gemini API response status:', response.status);
        console.log('Gemini API response body:', JSON.stringify(response.data, null, 2));
        
        if (response.status >= 400) {
          console.error('API request failed with status:', response.status);
          console.error('Response headers:', response.headers);
          throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(response.data)}`);
        }
        
        responseData = response.data;
        
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('API Error - Status:', error.response.status);
          console.error('API Error - Data:', error.response.data);
          console.error('API Error - Headers:', error.response.headers);
          throw new Error(`Gemini APIエラー: ステータス ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          throw new Error('Gemini APIから応答がありませんでした。ネットワーク接続を確認してください。');
        } else {
          // Something happened in setting up the request
          console.error('Request setup error:', error.message);
          throw new Error(`リクエストの設定中にエラーが発生しました: ${error.message}`);
        }
      }

      const summary = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '要約を生成できませんでした。';
      console.log('Summary generated successfully');
      
      // 常に同じ形式でレスポンスを返す
      res.json({
        success: true,
        summary: summary,
        timestamp: new Date().toISOString()
      });
      
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      console.error('Gemini API error stack:', apiError.stack);
      throw apiError;
    }
    
  } catch (error) {
    console.error('Error in /api/summarize:', error);
    console.error('Error stack:', error.stack);
    
    // エラーレスポンスを返す
    res.status(500).json({
      success: false,
      error: '要約の生成中にエラーが発生しました',
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// 404 ハンドラー - 存在しないルートへのアクセスをキャッチ
app.use((req, res) => {
  console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  
  // APIリクエストの場合はJSONでエラーを返す
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: '指定されたエンドポイントは存在しません',
      path: req.originalUrl,
      method: req.method
    });
  }
  
  // それ以外の場合は404ページを表示
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), (err) => {
    if (err) {
      // 404.htmlが存在しない場合はシンプルなエラーメッセージを返す
      res.status(404).json({
        success: false,
        error: 'ページが見つかりません',
        path: req.originalUrl
      });
    }
  });
});

// グローバルエラーハンドラー
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  
  // 既にレスポンスが送信されている場合は何もしない
  if (res.headersSent) {
    return next(err);
  }
  
  // エラーレスポンスを返す
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    error: '内部サーバーエラーが発生しました',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
      name: err.name
    })
  };
  
  res.status(statusCode).json(errorResponse);
});

// ヘルパー関数: URLのバリデーション
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// 未処理のPromise拒否をキャッチ
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 必要に応じてエラーログを記録するなどの処理を追加
});

// 未処理の例外をキャッチ
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 必要に応じてエラーログを記録してからプロセスを終了
  // 通常、予期しないエラーなのでプロセスを再起動するのが望ましい
  process.exit(1);
});

// 非同期初期化関数
const initializeServer = async () => {
  try {
    // CORSプロキシの初期化を待機
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // サーバー起動
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Node.js version: ${process.version}`);
      console.log('All services initialized successfully');
    });

    // グレースフルシャットダウンハンドラー
    const gracefulShutdown = () => {
      console.log('Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      
      // 強制終了前にタイムアウトを設定
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // シグナルハンドラー
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// サーバー初期化を開始
initializeServer().catch(error => {
  console.error('Unhandled error during server initialization:', error);
  process.exit(1);
});
