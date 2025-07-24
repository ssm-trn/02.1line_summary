const fetch = require('node-fetch');

async function testCors() {
  const url = 'https://02-1line-summary-5mvqf5hn5-ssm-trns-projects.vercel.app/api/vercel-cors';
  
  try {
    // Test OPTIONS request (preflight)
    console.log('Testing OPTIONS request...');
    const optionsResponse = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
        'Origin': 'https://ssm-trn.github.io'
      }
    });
    
    console.log('OPTIONS Status:', optionsResponse.status);
    console.log('CORS Headers:');
    console.log('- Access-Control-Allow-Origin:', optionsResponse.headers.get('access-control-allow-origin'));
    console.log('- Access-Control-Allow-Methods:', optionsResponse.headers.get('access-control-allow-methods'));
    console.log('- Access-Control-Allow-Headers:', optionsResponse.headers.get('access-control-allow-headers'));
    
    // Test POST request
    console.log('\nTesting POST request...');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://ssm-trn.github.io'
      },
      body: JSON.stringify({
        url: 'https://example.com'
      })
    });
    
    console.log('POST Status:', postResponse.status);
    console.log('Response Headers:');
    console.log('- Content-Type:', postResponse.headers.get('content-type'));
    console.log('- Access-Control-Allow-Origin:', postResponse.headers.get('access-control-allow-origin'));
    
    const data = await postResponse.json();
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testCors();
