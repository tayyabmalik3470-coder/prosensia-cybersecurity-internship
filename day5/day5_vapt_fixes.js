const express = require('express');
const app = express();
app.use(express.json());

let users = [];
let baskets = {
  1: { id: 1, userId: 1, items: [{ name: 'Apple Juice', qty: 1 }] },
  2: { id: 2, userId: 2, items: [{ name: 'Orange Juice', qty: 10 }] }
};
let basketItems = { 101: { id: 101, name: 'Apple Juice', quantity: 1, price: 1.99 } };

const authenticate = (req, res, next) => {
  req.user = { id: 1, email: 'user1@test.com' };
  next();
};

app.post('/api/Users', (req, res) => {
  const { email, password, securityQuestion, securityAnswer } = req.body;
  const newUser = {
    id: users.length + 1,
    email,
    password,
    securityQuestion,
    securityAnswer,
    role: 'customer'
  };
  users.push(newUser);
  res.status(201).json({ status: 'success', data: newUser });
});

app.get('/rest/basket/:id', authenticate, (req, res) => {
  const basket = baskets[req.params.id];
  if (!basket || basket.userId !== req.user.id) {
    return res.status(403).json({ status: 'error', message: 'Forbidden' });
  }
  res.json({ status: 'success', data: basket });
});

app.put('/api/BasketItems/:id', authenticate, (req, res) => {
  const quantity = Number(req.body.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ status: 'error', message: 'Quantity must be a positive integer' });
  }
  const item = basketItems[req.params.id];
  if (item) {
    item.quantity = quantity;
  }
  res.json({ status: 'success', data: item });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));