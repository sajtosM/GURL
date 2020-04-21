var query = 'boe';

const https = require('https');
https.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=3X6NMLT8N0XLQJGB`, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });
  resp.on('end', () => {
    console.table(JSON.parse(data).bestMatches);
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});