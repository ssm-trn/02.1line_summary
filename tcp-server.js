// TCPサーバーのテスト
const net = require('net');

console.log('=== TCPサーバーテスト開始 ===');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform, process.arch);
console.log('現在時刻:', new Date().toISOString());

// TCPサーバーを作成
const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`✅ クライアントが接続しました: ${clientAddress}`);
  
  // データ受信時の処理
  socket.on('data', (data) => {
    console.log(`受信: ${data.toString()}`);
    
    // 応答を返す
    const response = `Server received: ${data.toString()}`;
    console.log(`送信: ${response}`);
    socket.write(response);
    
    // 接続を閉じる
    socket.end();
  });
  
  // 接続終了時の処理
  socket.on('end', () => {
    console.log(`✅ クライアントが切断しました: ${clientAddress}`);
  });
  
  // エラー処理
  socket.on('error', (err) => {
    console.error('❌ ソケットエラー:', err);
  });
});

// エラーハンドリング
server.on('error', (err) => {
  console.error('❌ サーバーエラー:', err);
});

// サーバーを起動
const PORT = 3007;
server.listen(PORT, '127.0.0.1', () => {
  const address = server.address();
  console.log(`\n✅ TCPサーバーが起動しました`);
  console.log(`アドレス: ${address.address}:${address.port}`);
  console.log('このウィンドウを閉じるには Ctrl+C を押してください\n');
  
  // クライアントを起動
  console.log('テスト用クライアントを起動します...');
  const { exec } = require('child_process');
  exec('node tcp-client.js', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ クライアントの起動に失敗しました:', error);
      return;
    }
    console.log('✅ クライアントのテストが完了しました');
    console.log('=== テスト完了 ===');
    process.exit(0);
  });
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  console.log('\nSIGINTを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    console.log('✅ サーバーが正常にシャットダウンしました');
    process.exit(0);
  });
});
