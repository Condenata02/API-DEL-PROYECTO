const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',        // permite todos los orígenes
  methods: '*',       // permite todos los métodos HTTP (GET, POST, PUT, DELETE, etc.)
  allowedHeaders: '*' // permite todos los encabezados
}));
app.use(morgan('dev'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/api_proyecto', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Simple route
app.get('/hola', (req, res) => {
  res.send('Hola');
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});