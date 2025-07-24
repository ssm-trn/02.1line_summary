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
            // 1. CORSプロキシを通じてURLのコンテンツを取得
            const proxyUrl = '/api/cors-proxy';
            const fullUrl = `${proxyUrl}?url=${encodeURIComponent(url)}`;
            console.log('Fetching URL:', fullUrl);
            
            const proxyResponse = await fetch(fullUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            
            console.log('Proxy response status:', proxyResponse.status);
            const proxyData = await proxyResponse.json();
            
            if (!proxyResponse.ok) {
                throw new Error(proxyData.error || 'コンテンツの取得に失敗しました');
            }
            
            // 2. 取得したHTMLを要約APIに送信
            const summarizeUrl = '/api/summarize';
            console.log('Sending to summarize API...');
            
            const summarizeResponse = await fetch(summarizeUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    url: url,
                    content: proxyData.data // CORSプロキシから返されたHTMLコンテンツ
                })
            });
            
            console.log('Summarize response status:', summarizeResponse.status);
            const data = await summarizeResponse.json();
            
            if (!summarizeResponse.ok) {
                const errorMessage = data.error || data.message || '要約の生成に失敗しました';
                const errorDetails = data.details || data.stack || '';
                console.error('Server error response:', { status: summarizeResponse.status, data });
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
