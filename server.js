require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
// Using axios instead of node-fetch for better compatibility

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Gemini API endpoint - Using Gemini 2.5 Flash model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// Helper function to extract main content from URL
async function extractContent(url) {
  try {
    console.log(`Fetching content from URL: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 10000 // 10秒のタイムアウトを設定
    });
    
    const html = response.data;
    console.log(`Successfully fetched ${html.length} bytes of HTML`);
    
    const dom = new JSDOM(html, { 
      url,
      runScripts: 'dangerously',
      resources: 'usable'
    });
    
    // Wait for dynamic content to load
    await new Promise(resolve => {
      if (dom.window.document.readyState === 'complete') {
        resolve();
      } else {
        dom.window.document.addEventListener('DOMContentLoaded', resolve);
        dom.window.addEventListener('load', resolve);
      }
    });
    
    // Remove unwanted elements
    const unwantedSelectors = [
      'header', 'footer', 'nav', 'aside', 'iframe', 'script', 'style',
      '.header', '.footer', '.nav', '.sidebar', '.ad', '.ads', '.banner',
      '.cookie-banner', '.privacy-banner', '.newsletter', '.social-share'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = dom.window.document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    if (!article) {
      console.log('No article content found, falling back to body text');
      return dom.window.document.body.textContent || '';
    }
    
    console.log(`Extracted article content: ${article.textContent.length} characters`);
    return article.textContent;
  } catch (error) {
    console.error('Error extracting content:', error);
    throw new Error(`Failed to extract content from the URL: ${error.message}`);
  }
}

// API endpoint to summarize URL
app.post('/api/summarize', async (req, res) => {
  console.log('Received request:', req.body);
  
  try {
    const { url } = req.body;
    
    // Validate URL
    if (!url) {
      console.log('No URL provided');
      return res.status(400).json({ error: 'URLを入力してください' });
    }
    
    if (!isValidUrl(url)) {
      console.log('Invalid URL format:', url);
      return res.status(400).json({ error: '有効なURL形式を入力してください' });
    }
    
    console.log('Extracting content from:', url);
    
    // Extract content
    let content;
    try {
      content = await extractContent(url);
      if (!content) {
        throw new Error('No content extracted');
      }
      console.log('Content extracted successfully');
    } catch (extractError) {
      console.error('Content extraction failed:', extractError);
      console.error('Content extraction error stack:', extractError.stack);
      return res.status(400).json({ 
        error: 'コンテンツの抽出に失敗しました',
        details: extractError.message 
      });
    }
    
    console.log('Generating summary with Gemini API...');
    
    try {
      // Clean up the content by removing extra whitespace and newlines
      const cleanContent = content
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100000);
      
      console.log('First 500 chars of extracted content:', cleanContent.substring(0, 500) + '...');
      
      const prompt = `以下のウェブページの本文を注意深く読み、1文で簡潔に要約してください。
- タイトルや見出しではなく、実際の本文の内容を要約してください
- 重要なキーワードや具体的な情報を含めてください
- ナビゲーションやメニュー、フッターの内容は無視してください
- 「このページは...についてのページです」のような一般的な説明は避け、具体的な内容を要約してください

【ウェブページの本文】
${cleanContent}

【要約】`;

      console.log('Sending request to Gemini API...');
      console.log('Gemini API Key:', API_KEY ? '*** (hidden for security)' : 'Not found');
      console.log('Sending request to Gemini API:', GEMINI_API_URL);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };
      
      console.log('Sending request to Gemini API with body:', JSON.stringify(requestBody, null, 2));
      
      let response;
      try {
        response = await axios.post(
          `${GEMINI_API_URL}?key=${API_KEY}`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            validateStatus: status => true // To handle all status codes as resolved
          }
        );
        
        console.log('Gemini API response status:', response.status);
        console.log('Gemini API response body:', JSON.stringify(response.data, null, 2));
        
        if (response.status >= 400) {
          console.error('API request failed with status:', response.status);
          console.error('Response headers:', response.headers);
          throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(response.data)}`);
        }
        
        responseData = response.data;
        
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('API Error - Status:', error.response.status);
          console.error('API Error - Data:', error.response.data);
          console.error('API Error - Headers:', error.response.headers);
          throw new Error(`Gemini APIエラー: ステータス ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          throw new Error('Gemini APIから応答がありませんでした。ネットワーク接続を確認してください。');
        } else {
          // Something happened in setting up the request
          console.error('Request setup error:', error.message);
          throw new Error(`リクエストの設定中にエラーが発生しました: ${error.message}`);
        }
      }

      const summary = responseData.candidates?.[0]?.content?.parts?.[0]?.text || '要約を生成できませんでした。';
      console.log('Summary generated successfully');
      
      res.json({ summary });
      
    } catch (apiError) {
      console.error('Gemini API error:', apiError);
      console.error('Gemini API error stack:', apiError.stack);
      throw apiError;
    }
    
  } catch (error) {
    console.error('Error in /api/summarize:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: '要約の生成中にエラーが発生しました',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper function to validate URL
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
