const axios = require('axios');

const handler = async (req, res) => {
  try {
    // GETリクエストの場合はクエリパラメータから、POSTの場合はボディからURLを取得
    const url = req.method === 'GET' ? req.query.url : req.body?.url;
    
    if (!url) {
      return res.status(400).json({ 
        success: false,
        error: 'URLパラメータが必要です' 
      });
    }

    console.log(`[CORS Proxy] Fetching URL: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000,
      responseType: 'text',
      validateStatus: null // すべてのステータスコードを有効にする
    });

    console.log(`[CORS Proxy] Response status: ${response.status}`);
    
    // 常にJSON形式でレスポンスを返す
    res.status(response.status).json({
      success: true,
      data: response.data,
      status: response.status,
      statusText: response.statusText
    });
    
  } catch (error) {
    console.error('プロキシエラー:', error);
    
    let statusCode = 500;
    let errorMessage = 'URLの取得に失敗しました';
    
    if (error.response) {
      // レスポンスはあるがエラーステータスコードの場合
      statusCode = error.response.status;
      if (statusCode === 404) {
        errorMessage = '指定されたURLのページが見つかりませんでした';
      } else if (statusCode === 403) {
        errorMessage = 'アクセスが拒否されました';
      } else if (statusCode === 429) {
        errorMessage = 'リクエストが多すぎます。しばらく待ってからお試しください';
      } else if (statusCode >= 500) {
        errorMessage = 'サーバーエラーが発生しました';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'リクエストがタイムアウトしました';
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
      errorMessage = 'ホスト名を解決できませんでした';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = '接続が拒否されました';
    }
    
    res.status(statusCode).json({ 
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// CORSプリフライトリクエスト（OPTIONS）に対応
module.exports = (req, res) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // リクエストをハンドラーに転送
  return handler(req, res).catch(error => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
};
