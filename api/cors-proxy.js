const axios = require('axios');

const handler = async (req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONSリクエスト（プリフライト対応）
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GETリクエストの場合はクエリパラメータから、POSTの場合はボディからURLを取得
    const url = req.method === 'GET' 
      ? req.query.url 
      : (req.body?.url || '');

    if (!url) {
      res.status(400).json({ error: 'Missing "url" parameter' });
      return;
    }

    // ターゲットURLからデータを取得
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000,
      responseType: 'text' // レスポンスをテキストとして取得
    });

    // コンテンツタイプを取得
    const contentType = response.headers['content-type'] || 'text/plain';
    
    // レスポンスヘッダーを設定
    res.setHeader('Content-Type', contentType);
    
    // レスポンスをそのまま返す
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch URL',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Export the handler with CORS support
exports = module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Call the handler
  return handler(req, res).catch(error => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
};
