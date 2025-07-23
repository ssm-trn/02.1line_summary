document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const loadingElement = document.getElementById('loading');
    const summaryElement = document.getElementById('summary');
    const errorElement = document.getElementById('error');

    // フォームの送信を処理
    async function handleSubmit(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        // バリデーション
        if (!url) {
            showError('URLを入力してください');
            return;
        }
        
        try {
            // URLの形式をチェック
            new URL(url);
        } catch (e) {
            showError(`有効なURLを入力してください: ${e.message}`);
            return;
        }
        
        // ローディング状態を表示
        setLoading(true);
        
        try {
            // バックエンドAPIを呼び出し
            const apiUrl = 'https://02-1line-summary-5mvqf5hn5-ssm-trns-projects.vercel.app/api/next-cors';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url })
            });
            
            const data = await response.json().catch(e => {
                console.error('Failed to parse JSON response:', e);
                throw new Error('サーバーからの応答が不正です');
            });
            
            if (!response.ok) {
                const errorMessage = data.error || data.message || '要約の生成中にエラーが発生しました';
                const errorDetails = data.details || data.stack || '';
                console.error('Server error response:', { status: response.status, data });
                throw new Error(`${errorMessage}${errorDetails ? `\n\n詳細: ${errorDetails}` : ''}`);
            }
            
            // 結果を表示
            showSummary(data.summary);
            
        } catch (error) {
            console.error('Error:', error);
            showError(error.message || 'エラーが発生しました。しばらくしてからもう一度お試しください。');
        } finally {
            setLoading(false);
        }
    }
    
    // ローディング状態を設定
    function setLoading(isLoading) {
        if (isLoading) {
            loadingElement.style.display = 'flex';
            summaryElement.style.display = 'none';
            errorElement.style.display = 'none';
            summarizeBtn.disabled = true;
        } else {
            loadingElement.style.display = 'none';
            summarizeBtn.disabled = false;
        }
    }
    
    // 要約を表示
    function showSummary(summary) {
        summaryElement.textContent = summary;
        summaryElement.style.display = 'block';
        errorElement.style.display = 'none';
    }
    
    // エラーを表示
    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        summaryElement.style.display = 'none';
    }
    
    // イベントリスナーを設定
    document.querySelector('form')?.addEventListener('submit', handleSubmit);
    summarizeBtn.addEventListener('click', handleSubmit);
    
    // URL入力フィールドでEnterキーを検知
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    });
});
