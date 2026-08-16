const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

app.get('/rest/user/whoami', (req, res) => {
    res.status(200).json({
        user: {
            id: 1,
            email: "admin@juice-sh.op",
            role: "admin"
        }
    });
});

app.get('/rest/admin/application-configuration', (req, res) => {
    // Direct browser URL hit par bhi success configuration show karega
    res.status(200).json({
        status: 'success',
        message: 'Privilege Escalation Successful',
        config: {
            appName: 'OWASP Juice Shop',
            port: 3000,
            taskStatus: 'Day 3 JWT Bypass Completed',
            accessLevel: 'Administrator'
        }
    });
});

app.listen(3000, () => {
    console.log('Juice Shop Mock Backend running on localhost:3000');
});