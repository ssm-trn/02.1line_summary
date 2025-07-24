console.log('Starting server initialization...');

const express = require('express');
const app = express();
const PORT = 3000;

console.log('Express app created');

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// テスト用エンドポイント
app.get('/api/test', (req, res) => {
  const response = {
    success: true,
    message: 'シンプルなテストエンドポイントが動作しています',
    timestamp: new Date().toISOString()
  };
  console.log('Test endpoint hit:', response);
  res.json(response);
});

// ルートハンドラー
app.get('/', (req, res) => {
  res.send('シンプルサーバーが動作しています');
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('エラーが発生しました:', err);
  res.status(500).json({
    success: false,
    message: '内部サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404ハンドラー
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'リクエストされたリソースが見つかりません',
    path: req.path
  });
});

// サーバー起動
try {
  console.log(`Attempting to start server on port ${PORT}...`);
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`シンプルサーバーがポート ${PORT} で起動しました`);  
    console.log(`http://localhost:${PORT}`);
    console.log(`テストエンドポイント: http://localhost:${PORT}/api/test`);
    
    // サーバーが実際にリッスンしているか確認
    const address = server.address();
    console.log('Server address info:', address);
    
    // サーバーがリッスンしているポートを確認
    console.log('Server is actually listening on port:', address.port);
  });
  
  // エラーハンドリング
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`ポート ${PORT} は既に使用中です。別のポート番号を指定してください。`);
    }
  });
  
  // 接続イベントのログ
  server.on('connection', (socket) => {
    console.log('New connection from:', socket.remoteAddress);
  });
  
  // サーバーが閉じたときの処理
  server.on('close', () => {
    console.log('Server has been closed');
  });
  
  return server;
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERMを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    console.log('サーバーがシャットダウンしました');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINTを受信しました。サーバーをシャットダウンします...');
  server.close(() => {
    console.log('サーバーがシャットダウンしました');
    process.exit(0);
  });
});
