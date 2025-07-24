// デバッグ用HTTPサーバー
const http = require('http');
const fs = require('fs');
const path = require('path');

// ログディレクトリの設定
const logDir = path.join(process.env.USERPROFILE, 'node-debug-logs');
const logFile = path.join(logDir, 'debug-server.log');

// ログディレクトリが存在しない場合は作成
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`ログディレクトリを作成しました: ${logDir}`);
  }
} catch (err) {
  console.error('ログディレクトリの作成に失敗しました:', err);
  process.exit(1);
}

// ログをファイルに記録する関数
function log(...args) {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  
  const logEntry = `[${timestamp}] ${message}\n`;
  
  // コンソールに出力
  process.stdout.write(logEntry);
  
  // ファイルに追記
  try {
    fs.appendFileSync(logFile, logEntry, 'utf8');
  } catch (err) {
    console.error('ログの書き込みに失敗しました:', err);
  }
}

// サーバーの設定
const PORT = 3006; // 新しいポート番号
const HOST = '127.0.0.1';

log('=== デバッグHTTPサーバー起動 ===');
log(`Node.js バージョン: ${process.version}`);
log(`プラットフォーム: ${process.platform} ${process.arch}`);
log(`作業ディレクトリ: ${process.cwd()}`);
log(`ログファイル: ${logFile}`);

// シンプルなリクエストハンドラー
const requestHandler = (req, res) => {
  const clientIP = req.socket.remoteAddress;
  const requestId = Date.now();
  
  log(`[${requestId}] リクエスト受信: ${req.method} ${req.url} from ${clientIP}`);
  
  // レスポンスの作成
  const responseData = {
    success: true,
    message: 'デバッグサーバーが動作しています',
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      clientIP: clientIP,
      requestId: requestId
    }
  };
  
  const responseBody = JSON.stringify(responseData, null, 2);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONSリクエストの処理
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // レスポンスを送信
  res.statusCode = 200;
  res.end(responseBody);
  
  log(`[${requestId}] レスポンスを送信:`, responseBody);
};

// サーバーを作成
const server = http.createServer(requestHandler);

// サーバーイベントのリスナー
server.on('error', (error) => {
  log('サーバーエラー:', error);
  if (error.code === 'EADDRINUSE') {
    log(`ポート ${PORT} は既に使用中です。別のポートを指定してください。`);
  }
  process.exit(1);
});

server.on('listening', () => {
  const address = server.address();
  log(`\n✅ サーバーが起動しました`);
  log(`アドレス: http://${HOST}:${address.port}`);
  log(`ログファイル: ${logFile}`);
  log('このウィンドウを閉じるには Ctrl+C を押してください\n');
  
  // 起動メッセージをコンソールに表示
  console.log('\n✅ デバッグHTTPサーバーが起動しました');
  console.log(`アドレス: http://${HOST}:${address.port}`);
  console.log(`ログファイル: ${logFile}`);
  console.log('このウィンドウを閉じるには Ctrl+C を押してください\n');
});

// グレースフルシャットダウン
process.on('SIGINT', () => {
  log('\nSIGINTを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    log('サーバーが正常にシャットダウンしました');
    process.exit(0);
  });
  
  // 5秒経過しても終了しない場合は強制終了
  setTimeout(() => {
    log('タイムアウトのため強制終了します');
    process.exit(1);
  }, 5000);
});

// サーバーを起動
try {
  log(`\nポート ${PORT} でサーバーを起動します...`);
  server.listen(PORT, HOST);
} catch (error) {
  log('サーバーの起動に失敗しました:', error);
  process.exit(1);
}
