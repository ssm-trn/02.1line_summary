// ファイルの存在確認と内容表示
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.env.USERPROFILE, 'node-test-output.txt');

console.log(`Checking file: ${filePath}`);

try {
  if (fs.existsSync(filePath)) {
    console.log('✅ ファイルが存在します');
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('\nファイルの内容:');
    console.log('---');
    console.log(content);
    console.log('---');
  } else {
    console.log('❌ ファイルが見つかりませんでした');
  }
} catch (err) {
  console.error('エラーが発生しました:');
  console.error(err);
}
