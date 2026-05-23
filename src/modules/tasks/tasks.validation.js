const { z } = require('zod');

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
  start_time: z.coerce.date().optional().nullable(),
  end_time: z.coerce.date().optional().nullable(),
  category_id: z.string().uuid('Format ID kategori tidak valid').optional().nullable(),
  // Subtasks opsional yang bisa dibuat langsung bersamaan dengan tugas utama
  subtasks: z.array(
    z.object({
      title: z.string().min(2, 'Judul subtask minimal 2 karakter')
    })
  ).optional()
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
  start_time: z.coerce.date().optional().nullable(),
  end_time: z.coerce.date().optional().nullable(),
  category_id: z.string().uuid('Format ID kategori tidak valid').optional().nullable()
});

// Skema validasi Zod untuk pembaruan status tugas secara spesifik
const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], {
    errorMap: () => ({ message: 'Status harus bernilai TODO, IN_PROGRESS, atau DONE' })
  })
});

// Skema validasi Zod untuk pembuatan subtask baru
const createSubtaskSchema = z.object({
  title: z.string().min(2, 'Judul subtask minimal harus terdiri dari 2 karakter')
});

// Skema validasi Zod untuk pembaruan subtask yang sudah ada
const updateSubtaskSchema = z.object({
  title: z.string().min(2, 'Judul subtask minimal harus terdiri dari 2 karakter').optional(),
  is_done: z.boolean().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  createSubtaskSchema,
  updateSubtaskSchema
};
