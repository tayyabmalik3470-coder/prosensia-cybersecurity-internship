const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const users = [
  { id: 1, email: 'admin@juice-sh.op', password: 'adminPassword123!', role: 'admin' },
  { id: 2, email: 'user@juice-sh.op', password: 'userPassword123!', role: 'user' }
];

app.get('/', (req, res) => {
  res.send('Day 8 SQLi Remediation Server. Test URL: http://localhost:3000/login?email=%27%20OR%201=1--');
});

app.get('/login', (req, res) => {
  const email = req.query.email || '';
  const password = req.query.password || '';

  if (email.includes("'") && !email.includes("OR")) {
    return res.status(500).json({
      status: 'error',
      vulnerability: 'SQLi Detected (Query Syntax Error)',
      message: '[object Object] - Internal SQL Syntax Error near quote'
    });
  }

  const matchedUser = users.find(u => u.email === email && u.password === password);

  if (matchedUser) {
    return res.json({
      status: 'success',
      vulnerability: 'Passed (SQL Injection Blocked)',
      message: 'Authenticated successfully via Parameterized Check',
      user: matchedUser.email
    });
  }

  return res.status(401).json({
    status: 'rejected',
    vulnerability: 'SQL Injection Blocked',
    message: 'Invalid email or password! Input payload treated as literal string.'
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));