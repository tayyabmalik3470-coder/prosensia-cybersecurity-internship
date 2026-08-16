const express = require('express');
const app = express();

let basketItems = {
  101: { id: 101, name: 'Apple Juice (1000ml)', unitPrice: 1.99 }
};

app.get('/', (req, res) => {
  res.send('Server is running. Test link: http://localhost:3000/update-basket?quantity=-5');
});

app.get('/update-basket', (req, res) => {
  const quantity = Number(req.query.quantity);

  if (!req.query.quantity || isNaN(quantity) || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({
      status: 'rejected',
      vulnerability: 'Parameter Tampering Blocked',
      message: 'Invalid quantity! Quantity must be a positive integer greater than 0.'
    });
  }

  const item = basketItems[101];
  const totalPrice = quantity * item.unitPrice;

  res.json({
    status: 'success',
    vulnerability: 'Passed',
    data: {
      item: item.name,
      quantity: quantity,
      unitPrice: item.unitPrice,
      totalPrice: Number(totalPrice.toFixed(2))
    }
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));