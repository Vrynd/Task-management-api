const taskService = require('./tasks.service');
const { successResponse } = require('../../utils/response');

/**
 * Controller Layer: Pengendali Permintaan HTTP Tugas (Task)
 * Menerima request HTTP Express, memilah parameter URL & Body, memicu Service Layer,
 * dan mengembalikan respon standardisasi JSON.
 */
class TaskController {
  /**
   * Mengambil Semua Tugas Pengguna Aktif
   * Memasukkan req.user.id ke service dan merespon dengan daftar tugas diurutkan.
   */
  async getAllTasks(req, res, next) {
    try {
      const result = await taskService.getAllTasks(req.user.id);
      return successResponse(res, 'Daftar semua tugas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Membuat Tugas Baru
   * Menerima payload body tugas dan merespon dengan status 201 Created.
   */
  async createTask(req, res, next) {
    try {
      const result = await taskService.createTask(req.user.id, req.body);
      return successResponse(res, 'Tugas berhasil dibuat', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil Detail Satu Tugas
   * Menggunakan parameter ID tugas dari URL (req.params.id) dan mencocokkan hak milik user.
   */
  async getTaskById(req, res, next) {
    try {
      const result = await taskService.getTaskById(req.params.id, req.user.id);
      return successResponse(res, 'Detail tugas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Memperbarui Informasi Tugas
   * Mengirim parameter ID tugas, ID user, beserta payload update data ke service.
   */
  async updateTask(req, res, next) {
    try {
      const result = await taskService.updateTask(req.params.id, req.user.id, req.body);
      return successResponse(res, 'Tugas berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menghapus Tugas Dari Sistem
   * Mendelegasikan penghapusan tugas berdasarkan ID ke service layer.
   */
  async deleteTask(req, res, next) {
    try {
      await taskService.deleteTask(req.params.id, req.user.id);
      return successResponse(res, 'Tugas berhasil dihapus', null, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Memperbarui Status Tugas Secara Spesifik
   * Menerima nilai status baru (TODO, IN_PROGRESS, DONE) dari req.body.status.
   */
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

