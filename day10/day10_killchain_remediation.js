const express = require('express');
const app = express();
app.use(express.json());

const orders = {
  'aa58-c02c900903b4929a': { orderId: 'aa58-c02c900903b4929a', userId: 101, item: 'Apple Juice', total: 1.99 }
};

// Stage 1 Secure: Parameterized Auth Check
app.post('/rest/user/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@juice-sh.op' && password === 'admin123') {
    return res.json({ status: 'success', token: 'valid-secure-token' });
  }
  res.status(401).json({ status: 'error', message: 'SQLi Blocked: Invalid Credentials' });
});

// Stage 2 Secure: Server-Side Authorization Check
app.get('/rest/track-order/:id', (req, res) => {
  const orderId = req.params.id;
  const requesterId = Number(req.query.requesterId) || 102; // Simulating session user
  const order = orders[orderId];

  if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

  if (order.userId !== requesterId) {
    return res.status(403).json({
      status: 'rejected',
      vulnerability: 'IDOR Blocked',
      message: 'Access Denied: You are not authorized to view this order.'
    });
  }

  res.json({ status: 'success', data: order });
});

app.listen(3000, () => console.log('Day 10 Remediation Server running at http://localhost:3000'));
