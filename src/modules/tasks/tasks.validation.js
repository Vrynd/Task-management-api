const { z } = require('zod');

/**
 * Sub-Skema Kategori (Category Schema)
 * - name: Wajib string, 1 sampai 50 karakter.
 * - color: Hex Code warna CSS (contoh: #FF5733) dengan format regex.
 */
const categorySchema = z.object({
  name: z.string()
    .min(1, 'Nama kategori tidak boleh kosong')
    .max(50, 'Nama kategori tidak boleh melebihi 50 karakter'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus berupa Hex Code valid (contoh: #FF5733)')
    .optional()
}).optional().nullable();

/**
 * Skema Pembuatan Tugas Baru (Create Task)
 * - title: Minimal 2 karakter, maksimal 100 karakter.
 * - description: Opsional, maksimal 500 karakter.
 * - priority: Enum wajb LOW, MEDIUM, atau HIGH (default: MEDIUM).
 * - deadline: Konversi otomatis string ke objek Date JavaScript.
 * - category: Objek kategori opsional/nullable.
 */
const createTaskSchema = z.object({
  title: z.string()
    .min(2, 'Judul tugas minimal harus terdiri dari 2 karakter')
    .max(100, 'Judul tugas tidak boleh melebihi 100 karakter'),
  description: z.string()
    .max(500, 'Deskripsi tidak boleh melebihi 500 karakter')
    .optional()
    .nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], {
    errorMap: () => ({ message: 'Prioritas harus bernilai LOW, MEDIUM, atau HIGH' })
  }).default('MEDIUM'),
  deadline: z.coerce.date({
    required_error: 'Tanggal tenggat waktu (deadline) wajib diisi',
    invalid_type_error: 'Format tanggal tenggat waktu tidak valid'
  }),
  category: categorySchema
});

/**
 * Skema Pembaruan Tugas (Update Task)
 * Semua properti bersifat opsional untuk pembaruan sebagian kolom (partial update).
 */
const updateTaskSchema = z.object({
  title: z.string()
    .min(2, 'Judul tugas minimal harus terdiri dari 2 karakter')
    .max(100, 'Judul tugas tidak boleh melebihi 100 karakter')
    .optional(),
  description: z.string()
    .max(500, 'Deskripsi tidak boleh melebihi 500 karakter')
    .optional()
    .nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  deadline: z.coerce.date().optional(),
  category: categorySchema
});

/**
 * Skema Khusus Perubahan Status Tugas
 * - status: Hanya menerima enum TODO, IN_PROGRESS, atau DONE.
 */
const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    errorMap: () => ({ message: 'Status harus bernilai TODO, IN_PROGRESS, atau DONE' })
  })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema
};

