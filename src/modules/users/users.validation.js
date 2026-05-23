const { z } = require('zod');

// Validation schema untuk pembaruan profil pengguna
const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Nama minimal harus terdiri dari 2 karakter')
    .max(50, 'Nama tidak boleh melebihi 50 karakter')
    .optional(),
  avatar_url: z.string()
    .url('Format URL foto profil tidak valid')
    .optional()
    .nullable(),
  password: z.string()
    .min(6, 'Kata sandi minimal harus terdiri dari 6 karakter')
    .optional()
});

module.exports = {
  updateProfileSchema
};
