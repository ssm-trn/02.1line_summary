// 環境チェックスクリプト
console.log('=== 環境情報 ===');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform);
console.log('アーキテクチャ:', process.arch);
console.log('現在のディレクトリ:', process.cwd());
console.log('環境変数 NODE_ENV:', process.env.NODE_ENV || '設定なし');
console.log('利用可能なメモリ:', Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB');

// ネットワークインターフェースの確認
const os = require('os');
const ifaces = os.networkInterfaces();
console.log('\n=== ネットワークインターフェース ===');
Object.keys(ifaces).forEach(ifname => {
  ifaces[ifname].forEach(iface => {
    if ('IPv4' === iface.family && iface.internal === false) {
      console.log(`${ifname}: ${iface.address}`);
    }
  });
});

// ポートスキャン
console.log('\n=== ポートスキャン (3000-3005) ===');
const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => {
        console.log(`ポート ${port}: 使用中`);
        resolve(false);
      })
      .once('listening', () => {
        server.close(() => {
          console.log(`ポート ${port}: 空いています`);
          resolve(true);
        });
      })
      .listen(port, '0.0.0.0');
  });
}

async function scanPorts() {
  for (let port = 3000; port <= 3005; port++) {
    await checkPort(port);
  }
  console.log('\nチェックが完了しました。');
}

scanPorts().catch(console.error);
