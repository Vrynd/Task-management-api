const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

/**
 * Global Rate Limiter
 * - Membatasi maksimal 100 permintaan per 15 menit untuk setiap IP.
 * - Mengembalikan status 429 Too Many Requests jika terlampaui.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  statusCode: 429,
  message: 'Terlalu banyak permintaan, silakan coba lagi setelah 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return errorResponse(res, options.message, options.statusCode);
  }
});

/**
 * Auth Rate Limiter
 * - Membatasi maksimal 5 percobaan login/register per 15 menit per IP.
 * - Mengamankan endpoint otentikasi dari serangan brute-force.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  statusCode: 429,
  message: 'Terlalu banyak percobaan, silakan coba lagi setelah 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    return errorResponse(res, options.message, options.statusCode);
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};

