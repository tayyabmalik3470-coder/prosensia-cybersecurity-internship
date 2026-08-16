const express = require('express');
const app = express();
app.use(express.json());

// Mock Users & Orders Database
const users = [{ id: 101, email: 'admin@juice-sh.op', pass: 'admin123', role: 'admin' }];
const orders = {
  'aa58-c02c900903b4929a': { orderId: 'aa58-c02c900903b4929a', userId: 102, item: 'Orange Juice', total: 2.99 }
};

// Stage 1: Vulnerable SQLi Login Bypass Endpoint
app.post('/rest/user/login', (req, res) => {
  const { email } = req.body;
  // Vulnerable simulation: Payload "' OR 1=1--" bypasses login
  if (email && (email.includes("' OR 1=1") || email === 'admin@juice-sh.op')) {
    return res.json({ status: 'success', token: 'stolen-admin-jwt-token', user: users[0] });
  }
  res.status(401).json({ status: 'error', message: 'Invalid credentials' });
});

// Stage 2: Vulnerable IDOR Endpoint (No Ownership Check)
app.get('/rest/track-order/:id', (req, res) => {
  const order = orders[req.params.id];
  if (order) {
    return res.json({ status: 'success', vulnerability: 'IDOR Exploited', data: order });
  }
  res.status(404).json({ status: 'error', message: 'Order not found' });
});

app.listen(3000, () => console.log('Day 10 Vulnerable Kill Chain Server running at http://localhost:3000'));
