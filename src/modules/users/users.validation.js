const { z } = require('zod');

/**
 * Skema Validasi Pembaruan Profil Pengguna
 * Menjamin integritas data yang dikirim oleh klien (aplikasi Flutter):
 * - name: Opsional, panjang teks dibatasi 2 sampai 50 karakter.
 * - avatar_url: Opsional, wajib dalam bentuk format URL yang valid atau bernilai null.
 * - password: Opsional, panjang kata sandi minimal harus 6 karakter.
 */
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

