// ファイルシステムテスト
const fs = require('fs');
const path = require('path');

console.log('=== ファイルシステムテスト開始 ===');
console.log('現在のディレクトリ:', process.cwd());

// テスト用のディレクトリとファイル
const testDir = path.join(__dirname, 'test-dir');
const testFile = path.join(testDir, 'test.txt');
const testContent = 'これはテストファイルです\n' + new Date().toISOString();

try {
  // ディレクトリが存在しない場合は作成
  if (!fs.existsSync(testDir)) {
    console.log('テストディレクトリを作成します...');
    fs.mkdirSync(testDir);
    console.log('✓ テストディレクトリを作成しました');
  } else {
    console.log('既存のテストディレクトリを使用します');
  }

  // ファイルに書き込み
  console.log('\nファイルに書き込んでいます...');
  fs.writeFileSync(testFile, testContent, 'utf8');
  console.log('✓ ファイルに書き込みました');

  // ファイルの存在確認
  console.log('\nファイルの存在を確認しています...');
  if (fs.existsSync(testFile)) {
    console.log('✓ ファイルが存在します');
  } else {
    console.log('✗ ファイルが見つかりません');
  }

  // ファイルの読み込み
  console.log('\nファイルを読み込んでいます...');
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('✓ ファイルを読み込みました');
  console.log('ファイルの内容:');
  console.log('---');
  console.log(content.trim());
  console.log('---');

  // ファイルの削除
  console.log('\nファイルを削除しています...');
  fs.unlinkSync(testFile);
  console.log('✓ ファイルを削除しました');

  // ディレクトリの削除
  console.log('\nテストディレクトリを削除しています...');
  fs.rmdirSync(testDir);
  console.log('✓ テストディレクトリを削除しました');

  console.log('\n✅ すべてのファイルシステムテストが完了しました');
} catch (error) {
  console.error('\n❌ エラーが発生しました:');
  console.error(error);
  
  // エラーが発生した場合でもクリーンアップを試みる
  try {
    if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
    if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
  } catch (cleanupError) {
    console.error('クリーンアップ中にエラーが発生しました:', cleanupError);
  }
}
