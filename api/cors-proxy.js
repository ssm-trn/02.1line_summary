const { GoogleGenerativeAI } = require('@google/generative-ai');
const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const axios = require('axios');

// Initialize Google Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const handler = async (req, res) => {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Fetch the webpage content
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000
    });

    // Parse the content
    const dom = new JSDOM(html, { url });
    const article = new Readability(dom.window.document).parse();

    if (!article || !article.textContent) {
      throw new Error('Could not extract article content');
    }

    // Generate summary using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `以下の記事を1文で簡潔に要約してください。日本語でお願いします。\n\n${article.textContent.substring(0, 30000)}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Return the summary with CORS headers
    return res.status(200).json({ 
      summary,
      title: article.title || 'No title',
      url: url
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate summary',
      message: error.message
    });
  }
};

// Export the handler with CORS support
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  return handler(req, res);
};
