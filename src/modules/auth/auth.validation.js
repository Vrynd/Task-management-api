const { z } = require('zod');

/**
 * Zod validation schemas for Authentication
 */

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  avatar_url: z.string()
    .url('Invalid avatar URL format')
    .optional()
    .nullable()
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
});

module.exports = {
  registerSchema,
  loginSchema
};
