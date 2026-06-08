const express = require('express');
const router = express.Router();
const taskController = require('./tasks.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema
} = require('./tasks.validation');

/**
 * Keamanan Tingkat Modul (Global Guard)
 * Mengunci seluruh rute Tasks dengan middleware JWT Auth. Klien wajib terautentikasi.
 */
router.use(authMiddleware);

/**
 * Endpoint Utama CRUD Tugas (Task)
 * - POST /: Membuat tugas baru dengan validasi skema input.
 * - GET /: Menampilkan seluruh tugas milik pengguna aktif.
 * - GET /:id: Mengambil satu rincian tugas.
 * - PUT /:id: Memperbarui isi informasi tugas.
 * - DELETE /:id: Menghapus tugas dari sistem.
 */
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

/**
 * Endpoint Khusus Status Tugas
 * - PUT /:id/status: Mengubah status tugas secara cepat (TODO, IN_PROGRESS, DONE)
 *   dan otomatis mendokumentasikan perubahannya ke tabel audit status (TaskLog).
 */
router.put('/:id/status', validate(updateStatusSchema), taskController.updateStatus);

module.exports = router;

