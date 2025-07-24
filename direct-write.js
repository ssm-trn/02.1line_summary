// 直接ファイルに書き込むテスト
const fs = require('fs');
const path = require('path');

// 出力先のファイル
const outputFile = path.join(process.env.USERPROFILE, 'node-test-output.txt');
const message = `テストメッセージ\n実行時刻: ${new Date().toISOString()}\nNode.js バージョン: ${process.version}\n`;

try {
  // ファイルに書き込む
  fs.writeFileSync(outputFile, message, 'utf8');
  console.log(`テストが完了しました。出力ファイル: ${outputFile}`);
} catch (err) {
  console.error('エラーが発生しました:', err);
}
