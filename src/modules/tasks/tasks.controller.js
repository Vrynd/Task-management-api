const taskService = require('./tasks.service');
const { successResponse } = require('../../utils/response');

// Controller untuk menangani permintaan CRUD Tugas (Task) dan Sub-tugas (Subtask)
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

  // Membuat tugas baru beserta opsional sub-tugas sekaligus
  async createTask(req, res, next) {
    try {
      const result = await taskService.createTask(req.user.id, req.body);
      return successResponse(res, 'Tugas berhasil dibuat', result, 201);
    } catch (error) {
      next(error);
    }
  }

  // Mengambil detail satu tugas beserta sub-tugasnya
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

  // Menambahkan sub-tugas baru ke dalam tugas tertentu
  async createSubtask(req, res, next) {
    try {
      const result = await taskService.createSubtask(req.params.taskId, req.user.id, req.body);
      return successResponse(res, 'Subtugas berhasil ditambahkan', result, 201);
    } catch (error) {
      next(error);
    }
  }

  // Memperbarui detail informasi sub-tugas
  async updateSubtask(req, res, next) {
    try {
      const result = await taskService.updateSubtask(req.params.id, req.user.id, req.body);
      return successResponse(res, 'Subtugas berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Menghapus sub-tugas dari tugas tertentu
  async deleteSubtask(req, res, next) {
    try {
      await taskService.deleteSubtask(req.params.id, req.user.id);
      return successResponse(res, 'Subtugas berhasil dihapus', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
