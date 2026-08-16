const express = require('express');
const app = express();

app.get('/api/data', (req, res) => {
    try {
        throw new Error('Database connection failed: Access denied for user root@localhost (Using password: YES)');
    } catch (err) {
        res.status(500).json({
            status: "success",
            vulnerability: "Security Misconfiguration Exploited",
            message: "Verbose stack trace and internal configurations leaked successfully!",
            errorDetails: err.message,
            stackTrace: err.stack,
            exposedConfig: { dbHost: "localhost", dbUser: "root", environment: "production" }
        });
    }
});

app.listen(3000, () => console.log('Day 6 Vulnerable Server running on http://localhost:3000'));
