const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Simple route
app.get('/hola', (req, res) => {
  res.send('Hola');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});