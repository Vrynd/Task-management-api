const categoryService = require('./categories.service');
const { successResponse } = require('../../utils/response');

/**
 * Controller untuk menangani permintaan CRUD Kategori
 */
class CategoryController {
  //  Mengambil semua kategori milik pengguna tertentu
  async getCategories(req, res, next) {
    try {
      const result = await categoryService.getCategories(req.user.id);
      return successResponse(res, 'Daftar kategori berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Membuat kategori baru untuk pengguna tertentu
  async createCategory(req, res, next) {
    try {
      const result = await categoryService.createCategory(req.user.id, req.body);
      return successResponse(res, 'Kategori berhasil dibuat', result, 201);
    } catch (error) {
      next(error);
    }
  }

  // Memperbarui detail informasi kategori tugas
  async updateCategory(req, res, next) {
    try {
      const result = await categoryService.updateCategory(req.params.id, req.user.id, req.body);
      return successResponse(res, 'Kategori berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Menghapus kategori tugas pengguna
  async deleteCategory(req, res, next) {
    try {
      await categoryService.deleteCategory(req.params.id, req.user.id);
      return successResponse(res, 'Kategori berhasil dihapus', null, 200);
    } catch (error) {
      next(error);
    }
  }

  // Mengambil seluruh daftar tugas di bawah kategori tertentu
  async getTasks(req, res, next) {
    try {
      const result = await categoryService.getTasks(req.params.id, req.user.id);
      return successResponse(res, 'Daftar tugas dalam kategori berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Mengambil persentase progres penyelesaian tugas dalam kategori tertentu
  async getProgress(req, res, next) {
    try {
      const result = await categoryService.getProgress(req.params.id, req.user.id);
      return successResponse(res, 'Progres kategori berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CategoryController();
