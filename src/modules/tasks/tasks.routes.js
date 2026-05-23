const express = require('express');
const router = express.Router();
const taskController = require('./tasks.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  createSubtaskSchema,
  updateSubtaskSchema
} = require('./tasks.validation');

// Memproteksi seluruh rute di modul ini secara global menggunakan JWT Auth
router.use(authMiddleware);

// Rute utama CRUD Tugas (Task)
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Rute spesifik untuk memperbarui status tugas
router.put('/:id/status', validate(updateStatusSchema), taskController.updateStatus);

// Rute untuk mengelola Sub-tugas (Subtask) yang terkait dengan Tugas (Task)
router.post('/:taskId/subtasks', validate(createSubtaskSchema), taskController.createSubtask);
router.put('/subtasks/:id', validate(updateSubtaskSchema), taskController.updateSubtask);
router.delete('/subtasks/:id', taskController.deleteSubtask);

module.exports = router;
