const express = require('express');
const app = express();

const userProfiles = {
    '1': { id: 1, name: 'Alice', email: 'alice@test.com', role: 'Standard User' },
    '2': { id: 2, name: 'Bob', email: 'bob@test.com', role: 'Premium User' }
};

app.get('/api/users/:id', (req, res) => {
    const profile = userProfiles[req.params.id];
    if (profile) {
        return res.json({
            status: "success",
            vulnerability: "BOLA / IDOR Exploited",
            message: "Successfully accessed foreign user profile without ownership check!",
            data: profile
        });
    }
    res.status(404).json({ status: "error", message: "User not found" });
});

app.listen(3000, () => console.log('Day 5 Vulnerable Server running on http://localhost:3000'));
