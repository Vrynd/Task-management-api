const { errorResponse } = require('../utils/response');

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error caught by handler:', err);

  // Handle Zod Validation Error (if validator throws ZodError directly)
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message
    }));
    return errorResponse(res, 'Validation error', 400, formattedErrors);
  }

  // Prisma Error Handling
  if (err.code && err.code.startsWith('P')) {
    // Unique constraint violation (e.g. email already exists)
    if (err.code === 'P2002') {
      const field = err.meta?.target?.join(', ') || 'field';
      return errorResponse(res, `A record with this ${field} already exists.`, 409);
    }
  }

  // Default Error Response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
