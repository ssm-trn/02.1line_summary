// 出力テストスクリプト
const fs = require('fs');
const path = require('path');

// 出力先のファイル
const outputFile = path.join(__dirname, 'test-output.txt');

// コンソール出力をファイルにリダイレクトする関数
function logToFile(...args) {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ') + '\n';
  
  // コンソールにも出力（確認用）
  process.stdout.write(message);
  
  // ファイルにも出力
  fs.appendFileSync(outputFile, message, 'utf8');
}

// テスト開始
logToFile('=== 出力テスト開始 ===');
logToFile('現在時刻:', new Date().toISOString());

// 基本情報
logToFile('\n[基本情報]');
logToFile('Node.js バージョン:', process.version);
logToFile('プラットフォーム:', process.platform);
logToFile('アーキテクチャ:', process.arch);
logToFile('現在のディレクトリ:', process.cwd());

// ファイルシステムテスト
logToFile('\n[ファイルシステムテスト]');
try {
  const testFile = path.join(__dirname, 'test-file.txt');
  const testContent = 'これはテストファイルです\n' + new Date().toISOString();
  
  // ファイルに書き込み
  fs.writeFileSync(testFile, testContent, 'utf8');
  logToFile('✓ ファイルに書き込みました');
  
  // ファイルを読み込み
  const content = fs.readFileSync(testFile, 'utf8');
  logToFile('✓ ファイルを読み込みました');
  logToFile('ファイルの内容:', content.trim());
  
  // ファイルを削除
  fs.unlinkSync(testFile);
  logToFile('✓ ファイルを削除しました');
  
} catch (error) {
  logToFile('✗ ファイルシステムエラー:', error.message);
}

// 非同期処理のテスト
logToFile('\n[非同期処理テスト]');
let asyncTestComplete = false;

setTimeout(() => {
  logToFile('✓ 非同期処理が実行されました');
  asyncTestComplete = true;
  completeTests();
}, 1000);

// テスト完了処理
function completeTests() {
  if (!asyncTestComplete) return;
  
  logToFile('\n[テスト結果]');
  logToFile('✓ すべてのテストが完了しました');
  logToFile('出力ファイル:', outputFile);
  logToFile('=== テスト終了 ===\n');
  
  // 結果をコンソールに表示
  console.log('\nテストが完了しました。結果を確認してください:');
  console.log('ファイル:', outputFile);
  
  try {
    const result = fs.readFileSync(outputFile, 'utf8');
    console.log('\n出力内容:');
    console.log('---');
    console.log(result);
    console.log('---');
  } catch (err) {
    console.error('結果ファイルの読み込みに失敗しました:', err);
  }
}

// 非同期テストの完了を待つ
setTimeout(completeTests, 2000);
