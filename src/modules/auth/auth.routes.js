const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const { registerSchema, loginSchema } = require('./auth.validation');
const { authLimiter } = require('../../middlewares/rateLimiter');

// Public routes
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
