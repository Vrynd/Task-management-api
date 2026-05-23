const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Task Management API' });
});

// Module Routes
app.use('/api/auth', authRoutes);

// Global Error Handler (Must be registered last)
app.use(errorHandler);

module.exports = app;
