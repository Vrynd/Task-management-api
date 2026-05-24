const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');

// Membatasi maksimal 100 permintaan per 15 menit per IP
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

// Membatasi maksimal 5 percobaan per 15 menit per IP
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
