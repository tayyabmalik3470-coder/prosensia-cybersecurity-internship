const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/user/profile', (req, res) => {
    const { username, bio } = req.body;
    res.json({
        status: "success",
        vulnerability: "XSS / Unvalidated Input Exploited",
        message: `Profile payload executed successfully for user: ${username}`,
        injectedBio: bio
    });
});

app.listen(3000, () => console.log('Day 3 Vulnerable Server running on http://localhost:3000'));