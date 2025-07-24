// 最もシンプルなテスト
console.log('=== シンプルテスト開始 ===');
console.log('Node.js バージョン:', process.version);
console.log('プラットフォーム:', process.platform, process.arch);
console.log('現在時刻:', new Date().toISOString());

// 簡単な計算
const a = 5, b = 3;
console.log(`計算テスト: ${a} + ${b} = ${a + b}`);

// 配列操作
const numbers = [1, 2, 3, 4, 5];
console.log('配列の合計:', numbers.reduce((sum, num) => sum + num, 0));

// 非同期処理
console.log('3秒後にメッセージを表示します...');
setTimeout(() => {
  console.log('3秒が経過しました！');
  console.log('=== テスト完了 ===');
}, 3000);
