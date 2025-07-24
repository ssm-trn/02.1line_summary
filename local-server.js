const http = require('http');

const PORT = 3000;
const HOST = '127.0.0.1'; // localhostにバインド

// シンプルなHTTPサーバーを作成
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] リクエストを受信: ${req.method} ${req.url}`);
  
  // レスポンスヘッダー
  res.writeHead(200, { 
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });

  // ルートパスへのリクエスト
  if (req.url === '/' && req.method === 'GET') {
    return res.end('ローカルサーバーが動作しています！\n');
  }

  // テストAPIエンドポイント
  if (req.url === '/api/test' && req.method === 'GET') {
    const response = {
      success: true,
      message: 'テストAPIが正常に動作しています',
      timestamp: new Date().toISOString()
    };
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify(response, null, 2));
  }

  // その他のパスへのリクエスト
  res.statusCode = 404;
  res.end('404 - ページが見つかりません\n');
});

// サーバーを起動
server.listen(PORT, HOST, () => {
  console.log(`\nサーバーが起動しました！`);
  console.log(`ローカル: http://${HOST}:${PORT}`);
  console.log(`テストAPI: http://${HOST}:${PORT}/api/test`);
  console.log('\nこのウィンドウを閉じるには Ctrl+C を押してください。');
});

// エラーハンドリング
server.on('error', (error) => {
  console.error('サーバーエラー:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`ポート ${PORT} は既に使用中です。別のポートを指定するか、使用中のプロセスを終了してください。`);
  }
  process.exit(1);
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  console.log('\nサーバーをシャットダウンしています...');
  server.close(() => {
    console.log('サーバーが正常にシャットダウンしました。');
    process.exit(0);
  });
});
