require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use(express.static('public'));

// Gemini APIの設定
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// ルートへのアクセス時にindex.htmlを返す
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// テスト用のエンドポイント
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// コンテンツ抽出用のヘルパー関数
async function extractContent(url) {
    try {
        console.log(`Fetching content from: ${url}`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const html = await response.text();
        console.log('Successfully fetched HTML content');
        
        const dom = new JSDOM(html, { 
            url: url,
            runScripts: 'dangerously',
            resources: 'usable'
        });
        
        // ページの読み込みを待つ
        await new Promise(resolve => {
            if (dom.window.document.readyState === 'complete') {
                resolve();
            } else {
                dom.window.addEventListener('load', resolve);
                // タイムアウトを設定
                setTimeout(resolve, 5000);
            }
        });
        
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        
        if (!article || !article.textContent) {
            console.log('No content extracted, using fallback');
            // フォールバックとしてbodyのテキストを使用
            return dom.window.document.body ? 
                dom.window.document.body.textContent.trim() : 
                'コンテンツを抽出できませんでした';
        }
        
        return article.textContent.trim();
    } catch (error) {
        console.error('Error in extractContent:', error);
        throw new Error(`コンテンツの抽出に失敗しました: ${error.message}`);
    }
}

// URLのバリデーション
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// 要約用のエンドポイント
app.post('/api/summarize', async (req, res) => {
    console.log('Received summarize request:', req.body);
    
    try {
        // リクエストボディの検証
        if (!req.body || typeof req.body !== 'object') {
            console.error('Invalid request body:', req.body);
            return res.status(400).json({ 
                error: '無効なリクエストです',
                details: 'リクエストボディが正しくありません'
            });
        }
        
        const { url } = req.body;
        
        // URLのバリデーション
        if (!url) {
            console.error('URL is required');
            return res.status(400).json({ 
                error: 'URLを入力してください',
                details: 'URLが指定されていません'
            });
        }
        
        if (!isValidUrl(url)) {
            console.error('Invalid URL format:', url);
            return res.status(400).json({ 
                error: '無効なURL形式です',
                details: `「${url}」は正しいURL形式ではありません`
            });
        }
        
        console.log('Extracting content from:', url);
        
        try {
            // コンテンツの抽出
            const content = await extractContent(url);
            
            if (!content) {
                console.error('No content extracted from URL:', url);
                return res.status(400).json({ 
                    error: 'コンテンツを抽出できませんでした',
                    details: '指定されたURLからテキストコンテンツを抽出できませんでした'
                });
            }
            
            console.log('Content extracted successfully, length:', content.length);
            
            // テスト用の応答（実際のAPI呼び出しの代わり）
            res.json({ 
                summary: `「${url}」の要約結果：これはテスト用の要約です。実際のAPIキーが設定されると、Gemini APIを使用して要約が生成されます。`,
                debug: {
                    contentLength: content.length,
                    preview: content.substring(0, 200) + (content.length > 200 ? '...' : '')
                }
            });
            
        } catch (extractError) {
            console.error('Content extraction failed:', extractError);
            return res.status(400).json({ 
                error: 'コンテンツの抽出に失敗しました',
                details: extractError.message,
                stack: process.env.NODE_ENV === 'development' ? extractError.stack : undefined
            });
        }
        
    } catch (error) {
        console.error('Unexpected error in /api/summarize:', error);
        res.status(500).json({ 
            error: '予期せぬエラーが発生しました',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Test API endpoint: http://localhost:${PORT}/api/test`);
});
