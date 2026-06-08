const { errorResponse } = require('../utils/response');

/**
 * Global Error Handler Middleware
 * Penjaring terakhir untuk menangkap semua error program dan memformat respon error JSON.
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error caught by handler:', err);

  // 1. Menangani Kesalahan Validasi Zod (ZodError)
  // Memetakan detail kolom yang salah untuk dibaca oleh validasi form Flutter.
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));
    return errorResponse(res, 'Validation error', 400, formattedErrors);
  }

  // 2. Menangani Kesalahan Database Prisma (Prisma Error)
  // Menangkap error khusus Prisma (misal P2002: Duplikasi nilai unik seperti Email).
  if (err.code && err.code.startsWith('P')) {
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') || 'field';
      return errorResponse(res, `A record with this ${field} already exists.`, 409);
    }
  }

  // 3. Respon Error Default (Internal Server Error)
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;

