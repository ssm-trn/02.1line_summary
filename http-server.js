const http = require('http');
const fs = require('fs');
const path = require('path');

// ログファイルの設定
const logFile = path.join(__dirname, 'http-server.log');

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
  fs.appendFileSync(logFile, logEntry, 'utf8');
}

// サーバーの設定
const PORT = 3005; // 新しいポート番号
const HOST = '127.0.0.1';

log('=== HTTPサーバー起動処理を開始します ===');
log(`Node.js バージョン: ${process.version}`);
log(`プラットフォーム: ${process.platform} ${process.arch}`);
log(`作業ディレクトリ: ${process.cwd()}`);
log(`ログファイル: ${logFile}`);

// リクエストハンドラー
const requestHandler = (req, res) => {
  const clientIP = req.socket.remoteAddress;
  const requestId = Date.now();
  
  log(`[${requestId}] リクエスト受信: ${req.method} ${req.url} from ${clientIP}`);
  
  // リクエストヘッダーをログに記録
  log(`[${requestId}] リクエストヘッダー:`, JSON.stringify(req.headers, null, 2));
  
  // リクエストボディの処理
  let body = [];
  req.on('data', chunk => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    if (body) {
      log(`[${requestId}] リクエストボディ:`, body);
    }
    
    // レスポンスの作成
    let responseData;
    
    try {
      if (req.url === '/') {
        responseData = {
          success: true,
          message: 'HTTPサーバーが動作しています',
          timestamp: new Date().toISOString(),
          request: {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: body || null
          }
        };
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
      } else if (req.url === '/api/test') {
        responseData = {
          success: true,
          message: 'テストAPIが正常に動作しています',
          timestamp: new Date().toISOString(),
          requestId: requestId
        };
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
      } else {
        responseData = {
          success: false,
          error: 'Not Found',
          message: 'リクエストされたリソースは見つかりません',
          path: req.url,
          timestamp: new Date().toISOString()
        };
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 404;
      }
      
      const responseBody = JSON.stringify(responseData, null, 2);
      log(`[${requestId}] レスポンスを送信:`, responseBody);
      
      res.end(responseBody);
      
    } catch (error) {
      log(`[${requestId}] エラーが発生しました:`, error);
      
      const errorResponse = {
        success: false,
        error: 'Internal Server Error',
        message: 'サーバーでエラーが発生しました',
        timestamp: new Date().toISOString(),
        requestId: requestId
      };
      
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(errorResponse, null, 2));
    }
  });
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
  log(`テスト用エンドポイント: http://${HOST}:${address.port}/api/test`);
  log('このウィンドウを閉じるには Ctrl+C を押してください\n');
  
  // 起動メッセージをコンソールに表示
  console.log('\n✅ サーバーが起動しました');
  console.log(`アドレス: http://${HOST}:${address.port}`);
  console.log(`テスト用エンドポイント: http://${HOST}:${address.port}/api/test`);
  console.log('ログファイル:', logFile);
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
