// TCPクライアントのテスト
const net = require('net');

console.log('=== TCPクライアントテスト開始 ===');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform, process.arch);
console.log('現在時刻:', new Date().toISOString());

// テスト用のTCPサーバーに接続
const client = net.createConnection({ port: 3007, host: '127.0.0.1' }, () => {
  console.log('✅ TCPサーバーに接続しました');
  
  // テストメッセージを送信
  const message = 'Hello, TCP Server!';
  console.log(`送信: ${message}`);
  client.write(message);
});

// データ受信時の処理
client.on('data', (data) => {
  console.log(`受信: ${data.toString()}`);
  
  // 接続を閉じる
  client.end();
});

// 接続終了時の処理
client.on('end', () => {
  console.log('✅ TCPサーバーとの接続を終了しました');
  console.log('=== テスト完了 ===');
});

// エラー処理
client.on('error', (err) => {
  console.error('❌ エラーが発生しました:');
  console.error(err);
  console.log('=== テスト失敗 ===');
});

// 10秒後にタイムアウト
setTimeout(() => {
  if (!client.destroyed) {
    console.log('\n⏱️  タイムアウトしました');
    client.destroy();
  }
}, 10000);
