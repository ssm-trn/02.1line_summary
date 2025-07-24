// 環境テストスクリプト
console.log('=== 環境テスト開始 ===');

// 基本情報
console.log('\n[基本情報]');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform);
console.log('アーキテクチャ:', process.arch);
console.log('現在のディレクトリ:', process.cwd());

// モジュールの読み込みテスト
try {
  console.log('\n[モジュール読み込みテスト]');
  
  // コアモジュール
  const http = require('http');
  const fs = require('fs');
  const path = require('path');
  
  console.log('✓ コアモジュールの読み込みに成功しました');
  
  // ファイルシステムテスト
  const testFile = path.join(__dirname, 'test-env.txt');
  fs.writeFileSync(testFile, 'テストファイル');
  const content = fs.readFileSync(testFile, 'utf8');
  fs.unlinkSync(testFile);
  
  console.log('✓ ファイルシステムの読み書きに成功しました');
  
  // ネットワークテスト
  const server = http.createServer((req, res) => {
    res.end('テストサーバー');
  });
  
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    console.log(`✓ テストサーバーがポート ${port} で起動しました`);
    
    // サーバーにリクエストを送信
    const req = http.get(`http://127.0.0.1:${port}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`✓ テストサーバーからの応答: ${data.trim()}`);
        server.close();
        console.log('\n✅ すべてのテストが完了しました');
      });
    });
    
    req.on('error', (err) => {
      console.error('テストリクエストでエラーが発生しました:', err);
      server.close();
    });
  });
  
  server.on('error', (err) => {
    console.error('テストサーバーの起動に失敗しました:', err);
  });
  
} catch (err) {
  console.error('エラーが発生しました:', err);
}
