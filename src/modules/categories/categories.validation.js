const { z } = require('zod');

// Skema validasi Zod untuk pembuatan kategori baru
const createCategorySchema = z.object({
  name: z.string()
    .min(2, 'Nama kategori minimal harus terdiri dari 2 karakter')
    .max(50, 'Nama kategori tidak boleh melebihi 50 karakter'),
  description: z.string()
    .max(200, 'Deskripsi tidak boleh melebihi 200 karakter')
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Format warna harus kode HEX valid (contoh: #FF5733)')
});

// Skema validasi Zod untuk pembaruan kategori
const updateCategorySchema = z.object({
  name: z.string()
    .min(2, 'Nama kategori minimal harus terdiri dari 2 karakter')
    .max(50, 'Nama kategori tidak boleh melebihi 50 karakter')
    .optional(),
  description: z.string()
    .max(200, 'Deskripsi tidak boleh melebihi 200 karakter')
    .optional()
    .nullable(),
  color: z.string()
    .regex(/^#[0-9A-F]{6}$/i, 'Format warna harus kode HEX valid (contoh: #FF5733)')
    .optional()
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
