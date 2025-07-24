// 最もシンプルなHTTPサーバーテスト
console.log('スクリプトが開始されました');

const http = require('http');

console.log('HTTPモジュールを読み込みました');

const server = http.createServer((req, res) => {
  console.log('リクエストを受信しました:', req.url);
  res.end('Hello World!');
});

console.log('サーバーを作成しました');

server.listen(3003, '127.0.0.1', () => {
  console.log('サーバーがポート3003で起動しました');
  console.log('http://localhost:3003 にアクセスしてください');
});

console.log('server.listenを呼び出しました');
