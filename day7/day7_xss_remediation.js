const express = require('express');
const app = express();

function encodeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.get('/', (req, res) => {
  res.send('Day 7 XSS Remediation Server. Test link: http://localhost:3000/search?q=%3Cimg%20src=x%20onerror=alert(%27XSS%27)%3E');
});

app.get('/search', (req, res) => {
  const query = req.query.q || '';
  const sanitizedQuery = encodeHTML(query);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Search Results</title></head>
    <body>
      <h2>Search Results</h2>
      <p>You searched for: <strong>${sanitizedQuery}</strong></p>
      <p>Status: Cleaned & Escaped (XSS Blocked)</p>
    </body>
    </html>
  `);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));