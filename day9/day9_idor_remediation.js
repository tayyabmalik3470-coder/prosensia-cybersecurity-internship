const express = require('express');
const app = express();

const orders = {
  'aa58-c02c900903b4929a': { orderId: 'aa58-c02c900903b4929a', userId: 101, email: 'tayyab43@test.com', item: 'Apple Juice (1000ml)', total: 1.99 },
  'bb99-d11e800803c4930b': { orderId: 'bb99-d11e800803c4930b', userId: 102, email: 'admin@juice-sh.op', item: 'Orange Juice (500ml)', total: 2.99 }
};

app.get('/', (req, res) => {
  res.send('Day 9 IDOR Remediation Server Running.');
});

app.get('/rest/track-order/:id', (req, res) => {
  const orderId = req.params.id;
  const requesterId = Number(req.query.requesterId) || 102;

  const order = orders[orderId];

  if (!order) {
    return res.status(404).json({ status: 'error', message: 'Order not found' });
  }

  if (order.userId !== requesterId) {
    return res.status(403).json({
      status: 'rejected',
      vulnerability: 'IDOR Blocked',
      message: 'Access Denied: You are not authorized to view this order.'
    });
  }

  res.json({
    status: 'success',
    vulnerability: 'Passed',
    data: order
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));