const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());

const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run("CREATE TABLE Users (id INTEGER PRIMARY KEY, email TEXT, password TEXT)");
    db.run("INSERT INTO Users (email, password) VALUES ('admin@juice-sh.op', 'Admin123Secret!')");
});

app.post('/rest/user/login', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT * FROM Users WHERE email = ? AND password = ?`;

    db.get(query, [email, password], (err, row) => {
        if (row) {
            return res.status(200).json({ status: "success", data: row });
        } else {
            return res.status(401).json({ status: "error", message: "Invalid credentials." });
        }
    });
});

app.listen(3001, () => console.log("Remediated App on port 3001"));