// 診断テストスクリプト
const fs = require('fs');
const path = require('path');

// 出力先のファイル
const outputFile = path.join(process.env.TEMP || '/tmp', 'node-diagnostic-test.txt');

// テスト結果を収集する配列
const results = [];

// テストを実行する関数
function runTest(name, testFn) {
  try {
    const result = testFn();
    results.push({ test: name, status: 'PASS', result });
  } catch (error) {
    results.push({ test: name, status: 'FAIL', error: error.message });
  }
}

// テスト1: 基本的な計算
runTest('Basic Math', () => 2 + 2 === 4);

// テスト2: ファイルシステム書き込み
try {
  const testFile = path.join(process.env.TEMP || '/tmp', 'node-test-file.txt');
  fs.writeFileSync(testFile, 'test content');
  const content = fs.readFileSync(testFile, 'utf8');
  fs.unlinkSync(testFile);
  runTest('File System', () => content === 'test content');
} catch (error) {
  results.push({ test: 'File System', status: 'FAIL', error: error.message });
}

// テスト3: モジュールの読み込み
try {
  const os = require('os');
  runTest('Module Loading', () => typeof os.hostname() === 'string');
} catch (error) {
  results.push({ test: 'Module Loading', status: 'FAIL', error: error.message });
}

// テスト4: 非同期処理
setTimeout(() => {
  runTest('Async Operation', () => true);
  
  // すべてのテストが完了したら結果をファイルに書き出す
  const output = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    cwd: process.cwd(),
    env: {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      USERPROFILE: process.env.USERPROFILE || 'not set',
      TEMP: process.env.TEMP || 'not set'
    },
    results: results
  };
  
  const outputStr = JSON.stringify(output, null, 2);
  
  try {
    fs.writeFileSync(outputFile, outputStr);
    console.log(`診断テストが完了しました。結果を確認してください: ${outputFile}`);
  } catch (error) {
    console.error('結果の書き込みに失敗しました:', error);
    console.log('結果を直接表示します:');
    console.log(outputStr);
  }
}, 1000);
