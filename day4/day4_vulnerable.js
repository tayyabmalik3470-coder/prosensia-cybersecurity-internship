const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        return res.json({
            status: "success",
            vulnerability: "Broken Authentication Bypassed",
            message: "Login successful using hardcoded credentials!",
            token: "eyJWidXNlckFkbWluSldUIiwiZXhwIjoxNzk4NzU5MjAwfQ.admin_proof_token"
        });
    }
    res.status(401).json({ status: "error", message: "Invalid credentials" });
});

app.listen(3000, () => console.log('Day 4 Vulnerable Server running on http://localhost:3000'));
