const { z } = require('zod');

/**
 * Skema Validasi Pendaftaran Akun (Register)
 * - name: Wajib string, 2 sampai 50 karakter.
 * - email: Format alamat email internet harus valid.
 * - password: Kata sandi minimal harus 6 karakter.
 * - avatar_url: Opsional, URL eksternal gambar profil.
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

/**
 * Skema Validasi Masuk Aplikasi (Login)
 * - email: Valid email.
 * - password: Wajib diisi.
 * - remember_me: Boolean opsional untuk memperpanjang usia token JWT.
 */
const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required'),
  remember_me: z.boolean().optional()
});

module.exports = {
  registerSchema,
  loginSchema
};

