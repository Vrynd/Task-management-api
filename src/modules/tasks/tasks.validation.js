const { z } = require('zod');

const categorySchema = z.object({
  name: z.string()
    .min(1, 'Nama kategori tidak boleh kosong')
    .max(50, 'Nama kategori tidak boleh melebihi 50 karakter'),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Format warna harus berupa Hex Code valid (contoh: #FF5733)')
    .optional()
}).optional().nullable();

// Skema validasi Zod untuk pembuatan tugas (task) baru
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

// Skema validasi Zod untuk pembaruan tugas (task) yang sudah ada
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

// Skema validasi Zod untuk pembaruan status tugas secara spesifik
const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    errorMap: () => ({ message: 'Status harus bernilai TODO, IN_PROGRESS, atau DONE' })
  })
});

// Skema validasi untuk menyematkan tugas fokus harian (pin)
const pinFocusTaskSchema = z.object({
  task_id: z.string({
    required_error: 'ID tugas wajib diisi'
  }).uuid('Format ID tugas harus berupa UUID yang valid'),
  focus_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus berupa YYYY-MM-DD').optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  pinFocusTaskSchema
};
