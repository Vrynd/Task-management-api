const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const { registerSchema, loginSchema } = require('./auth.validation');
const { authLimiter } = require('../../middlewares/rateLimiter');

/**
 * Endpoint Publik
 * - /register: Untuk mendaftarkan akun baru, dilengkapi rate limiter dan validasi skema register.
 * - /login: Untuk memvalidasi kredensial email/password dan menghasilkan token JWT.
 */
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * Endpoint Terproteksi
 * - /logout: Menghancurkan sesi pengguna aktif (membutuhkan otentikasi middleware JWT).
 */
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;

