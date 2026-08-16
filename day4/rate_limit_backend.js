const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(express.json());
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,                   // Limit each IP to 5 requests per windowMs
    message: { error: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.post('/rest/user/login', loginLimiter, (req, res) => {
    const { email, password } = req.body;
    if (email === "admin@juice-sh.op" && password === "admin123") {
        return res.status(200).json({
            status: "success",
            data: {
                token: "mock-jwt-token-admin123",
                user: { id: 1, email: "admin@juice-sh.op", role: "admin" }
            }
        });
    }

    return res.status(401).json({
        status: "fail",
        error: "Invalid email or password."
    });
});

app.listen(3000, () => {
    console.log('Juice Shop Rate Limiting Backend running on http://localhost:3000');
});