// TCP接続テスト
const net = require('net');

// シンプルなTCPサーバー
const server = net.createServer((socket) => {
  console.log('クライアントが接続しました');
  
  socket.on('data', (data) => {
    console.log('受信データ:', data.toString());
    socket.write('こんにちは！\r\n');
  });
  
  socket.on('end', () => {
    console.log('クライアントが切断しました');
  });
});

const PORT = 3004;

server.on('error', (err) => {
  console.error('サーバーエラー:', err);
  process.exit(1);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`TCPサーバーがポート ${PORT} で起動しました`);
  console.log('テストするには、別のターミナルで以下を実行してください:');
  console.log('  telnet 127.0.0.1 3004');
  console.log('または');
  console.log('  nc 127.0.0.1 3004');
});

// 5分後に自動終了
setTimeout(() => {
  console.log('5分が経過したためサーバーを終了します');
  server.close();
}, 5 * 60 * 1000);
