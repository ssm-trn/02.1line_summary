// 最小限のHTTPサーバー
const http = require('http');

const PORT = 3001; // 別のポート番号を試す
const HOST = '127.0.0.1';

// サーバーを作成
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // レスポンスヘッダー
  res.writeHead(200, { 
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  
  // リクエストメソッドがOPTIONSの場合はプリフライトリクエストとして処理
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  // ルートパスへのリクエスト
  if (req.url === '/') {
    res.end('テストサーバーが動作しています！\n');
    return;
  }
  
  // テストAPIエンドポイント
  if (req.url === '/api/test') {
    const response = {
      success: true,
      message: 'テストAPIが正常に動作しています',
      timestamp: new Date().toISOString()
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  // その他のパス
  res.statusCode = 404;
  res.end('404 - ページが見つかりません\n');
});

// サーバーを起動
server.listen(PORT, HOST, () => {
  console.log(`\n✅ テストサーバーが起動しました！`);
  console.log(`ローカル: http://${HOST}:${PORT}`);
  console.log(`テストAPI: http://${HOST}:${PORT}/api/test`);
  console.log('\nこのウィンドウを閉じるには Ctrl+C を押してください。');
});

// エラーハンドリング
server.on('error', (error) => {
  console.error('\n❌ サーバーエラー:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`ポート ${PORT} は既に使用中です。`);
  }
  process.exit(1);
});
