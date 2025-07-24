// 最も基本的なテスト
console.log('=== 基本テスト開始 ===');

// 変数と関数のテスト
const message = 'こんにちは、Node.js！';
console.log('メッセージ:', message);

// 配列のテスト
const numbers = [1, 2, 3, 4, 5];
console.log('配列の合計:', numbers.reduce((a, b) => a + b, 0));

// 非同期処理のテスト
console.log('3秒後にメッセージを表示します...');
setTimeout(() => {
  console.log('3秒が経過しました！');
  console.log('=== 基本テスト完了 ===');
}, 3000);
