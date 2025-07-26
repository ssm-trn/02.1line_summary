const fetch = require('node-fetch');

// Simple CORS proxy for Vercel Serverless Functions
module.exports = async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // CORSプリフライトリクエスト（OPTIONS）に対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GETリクエストの場合はクエリパラメータから、POSTの場合はボディからURLを取得
    const url = req.method === 'GET' ? req.query.url : req.body?.url;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URL parameter is required' 
      });
    }

    console.log(`[CORS Proxy] Fetching URL: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });

    const data = await response.text();
    console.log(`[CORS Proxy] Response status: ${response.status}`);
    
    // JSON形式でレスポンスを返す
    res.status(200).json({
      success: true,
      status: response.status,
      data: data,
      headers: {
        'content-type': response.headers.get('content-type')
      }
    });
  } catch (error) {
    console.error('[CORS Proxy] Error:', error);
    
    // エラーレスポンスを適切に処理
    const status = error.response?.status || 500;
    const message = error.response?.statusText || error.message || 'Unknown error occurred';
    
    res.status(status).json({
      success: false,
      error: message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
