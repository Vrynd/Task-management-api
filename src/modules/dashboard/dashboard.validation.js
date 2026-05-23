const { z } = require('zod');

// Regex pattern untuk memvalidasi tanggal berformat YYYY-MM-DD
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Skema validasi untuk menyematkan tugas fokus harian (pin)
const pinFocusTaskSchema = z.object({
  body: z.object({
    task_id: z.string({
      required_error: 'ID tugas wajib diisi'
    }).uuid('Format ID tugas harus berupa UUID yang valid'),
    focus_date: z.string().regex(dateRegex, 'Format tanggal harus berupa YYYY-MM-DD').optional()
  })
});

// Skema validasi untuk melepas sematan tugas fokus harian (unpin)
const unpinFocusTaskSchema = z.object({
  params: z.object({
    taskId: z.string({
      required_error: 'ID tugas wajib diisi'
    }).uuid('Format ID tugas harus berupa UUID yang valid')
  }),
  query: z.object({
    focus_date: z.string().regex(dateRegex, 'Format tanggal harus berupa YYYY-MM-DD').optional()
  }).optional()
});

// Skema validasi untuk query parameter detail dashboard
const getDashboardTodaySchema = z.object({
  query: z.object({
    date: z.string().regex(dateRegex, 'Format tanggal harus berupa YYYY-MM-DD').optional()
  }).optional()
});

module.exports = {
  pinFocusTaskSchema,
  unpinFocusTaskSchema,
  getDashboardTodaySchema
};
