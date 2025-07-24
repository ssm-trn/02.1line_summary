const net = require('net');
const http = require('http');

const PORT = 3000;

// ポートが使用中かチェック
const server = net.createServer();
server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`ポート ${PORT} は既に使用中です。`);
  } else {
    console.error('ポートチェック中にエラーが発生しました:', err);
  }
  process.exit(1);
});

server.once('listening', () => {
  console.log(`ポート ${PORT} は使用可能です。`);
  server.close(() => {
    // ポートが空いていることを確認したら、シンプルなHTTPサーバーを起動
    startHttpServer();
  });
});

server.listen(PORT, '0.0.0.0');

function startHttpServer() {
  const server = http.createServer((req, res) => {
    console.log(`リクエストを受信: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('シンプルなHTTPサーバーが動作しています！\n');
  });

  server.on('error', (err) => {
    console.error('HTTPサーバーエラー:', err);
    process.exit(1);
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\nシンプルなHTTPサーバーが起動しました！`);
    console.log(`以下のURLでアクセスできます:`);
    console.log(`http://localhost:${PORT}`);
    console.log(`\nこのウィンドウを閉じるには Ctrl+C を押してください。`);
  });
}
