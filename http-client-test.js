// HTTPクライアントのテスト
const http = require('http');

console.log('=== HTTPクライアントテスト開始 ===');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform, process.arch);
console.log('現在時刻:', new Date().toISOString());

// テスト用のHTTPリクエストを送信
const options = {
  hostname: 'httpbin.org',
  port: 80,
  path: '/get',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js HTTP Client Test',
    'Accept': 'application/json'
  }
};

console.log('\nHTTPリクエストを送信しています...');
console.log(`URL: http://${options.hostname}${options.path}`);

const req = http.request(options, (res) => {
  console.log(`\n✅ レスポンスを受信しました`);
  console.log(`ステータスコード: ${res.statusCode}`);
  console.log('ヘッダー:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      console.log('\nレスポンスボディ:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
      console.log('\n✅ テストが正常に完了しました');
    } catch (err) {
      console.error('❌ レスポンスの解析に失敗しました:', err);
    }
  });
});

// エラーハンドリング
req.on('error', (err) => {
  console.error('❌ リクエスト中にエラーが発生しました:');
  console.error(err);
  
  // ネットワーク関連のエラーの詳細を表示
  if (err.code) {
    console.log(`\nエラーコード: ${err.code}`);
    console.log('エラーメッセージ:', err.message);
    
    // 一般的なエラーコードの説明
    const errorMessages = {
      'ENOTFOUND': 'ホスト名を解決できませんでした。インターネット接続を確認してください。',
      'ECONNREFUSED': '接続が拒否されました。ホストがリッスンしていないか、ファイアウォールでブロックされている可能性があります。',
      'ETIMEDOUT': '接続がタイムアウトしました。ネットワーク接続を確認してください。',
      'EAI_AGAIN': '一時的なDNS解決エラーが発生しました。後でもう一度お試しください。'
    };
    
    if (errorMessages[err.code]) {
      console.log('\n考えられる解決策:');
      console.log(`- ${errorMessages[err.code]}`);
    }
  }
  
  console.log('\n❌ テストが失敗しました');
});

// リクエストを送信
req.end();

// タイムアウト設定 (10秒)
setTimeout(() => {
  if (!req.destroyed) {
    console.log('\n⏱️  リクエストがタイムアウトしました');
    req.destroy();
  }
}, 10000);
