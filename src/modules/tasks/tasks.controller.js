const taskService = require('./tasks.service');
const { successResponse } = require('../../utils/response');

// Controller untuk menangani permintaan CRUD Tugas (Task)
class TaskController {
  // Mengambil semua daftar tugas milik pengguna yang sedang login
  async getAllTasks(req, res, next) {
    try {
      const result = await taskService.getAllTasks(req.user.id);
      return successResponse(res, 'Daftar semua tugas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Membuat tugas baru
  async createTask(req, res, next) {
    try {
      const result = await taskService.createTask(req.user.id, req.body);
      return successResponse(res, 'Tugas berhasil dibuat', result, 201);
    } catch (error) {
      next(error);
    }
  }

  // Mengambil detail satu tugas
  async getTaskById(req, res, next) {
    try {
      const result = await taskService.getTaskById(req.params.id, req.user.id);
      return successResponse(res, 'Detail tugas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Memperbarui detail informasi tugas
  async updateTask(req, res, next) {
    try {
      const result = await taskService.updateTask(req.params.id, req.user.id, req.body);
      return successResponse(res, 'Tugas berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Menghapus tugas dari sistem
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);
      return successResponse(res, 'Tugas berhasil dihapus', null, 200);
    } catch (error) {
      next(error);
    }
  }

  // Mengubah status penyelesaian tugas (Todo, In Progress, Done)
  async updateStatus(req, res, next) {
    try {
      const result = await taskService.updateStatus(req.params.id, req.user.id, req.body.status);
      return successResponse(res, 'Status tugas berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
