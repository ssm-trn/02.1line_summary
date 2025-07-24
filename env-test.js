// 環境変数のテスト
console.log('=== 環境変数テスト開始 ===');

// 重要な環境変数を表示
const envVars = [
  'NODE_ENV',
  'USERPROFILE',
  'PATH',
  'TEMP',
  'SystemRoot',
  'COMSPEC',
  'NODE_PATH'
];

console.log('\n[環境変数]');
envVars.forEach(envVar => {
  console.log(`${envVar}: ${process.env[envVar] || '設定されていません'}`);
});

// Node.jsの設定情報
console.log('\n[Node.jsの設定]');
console.log('バージョン:', process.version);
console.log('プラットフォーム:', process.platform);
console.log('アーキテクチャ:', process.arch);
console.log('実行ファイル:', process.execPath);
console.log('カレントディレクトリ:', process.cwd());
console.log('メモリ使用量:', JSON.stringify(process.memoryUsage(), null, 2));

// モジュールパスの表示
console.log('\n[モジュール検索パス]');
if (require.main && require.main.paths) {
  require.main.paths.forEach((p, i) => {
    console.log(`${i + 1}. ${p}`);
  });
} else {
  console.log('モジュールパスを取得できませんでした');
}

console.log('\n=== テスト完了 ===');
