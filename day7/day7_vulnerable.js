const express = require('express');
const app = express();

app.get('/search', (req, res) => {
    const query = req.query.q || '';
    res.send(`
        <html>
            <body>
                <h2>Search Results</h2>
                <p>Query executed: <b>${query}</b></p>
                <p style="color:red;">[VULNERABILITY PROOF: Reflected XSS Payload Triggered Successfully]</p>
            </body>
        </html>
    `);
});

app.listen(3000, () => console.log('Day 7 Vulnerable Server running on http://localhost:3000'));
