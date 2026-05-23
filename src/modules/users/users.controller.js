const userService = require('./users.service');
const { successResponse } = require('../../utils/response');

// Controller untuk menangani permintaan profil, statistik, dan aktivitas pengguna
class UserController {
  // Mengambil detail profil pengguna yang sedang login
  async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req.user.id);
      return successResponse(res, 'Detail profil berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Memperbarui informasi profil pengguna yang sedang login
  async updateProfile(req, res, next) {
    try {
      const result = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, 'Profil berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Mengambil data statistik penyelesaian tugas pengguna
  async getStatistics(req, res, next) {
    try {
      const result = await userService.getStatistics(req.user.id);
      return successResponse(res, 'Statistik tugas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  // Mengambil daftar riwayat aktivitas akun terbaru pengguna
  async getActivities(req, res, next) {
    try {
      const result = await userService.getActivities(req.user.id);
      return successResponse(res, 'Riwayat aktivitas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
