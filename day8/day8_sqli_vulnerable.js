const express = require('express');
const app = express();
app.use(express.json());

app.post('/rest/user/login', (req, res) => {
    const { email } = req.body;
    if (email && email.includes("' OR 1=1")) {
        return res.json({
            status: "success",
            vulnerability: "SQL Injection Authentication Bypass Exploited",
            message: "Successfully logged in as admin without valid credentials!",
            user: { id: 1, email: "admin@juice-sh.op", role: "admin" },
            token: "sql-injection-bypass-jwt-token"
        });
    }
    res.status(401).json({ status: "error", message: "Invalid credentials" });
});

app.listen(3000, () => console.log('Day 8 Vulnerable Server running on http://localhost:3000'));
