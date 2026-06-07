const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const tasksRoutes = require('./modules/tasks/tasks.routes');
const errorHandler = require('./middlewares/errorHandler');
const { globalLimiter } = require('./middlewares/rateLimiter');
const corsOptions = require('./config/cors');
const xssSanitizer = require('./middlewares/xssSanitizer');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(globalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xssSanitizer);

// Root Route - Serve Interactive API Developer Portal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'docs.html'));
});

// Module Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);

// Global Error Handler (Must be registered last)
app.use(errorHandler);

module.exports = app;
