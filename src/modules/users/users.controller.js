const userService = require('./users.service');
const { successResponse } = require('../../utils/response');

/**
 * Controller Layer: Pengendali Permintaan HTTP Pengguna
 * Menjembatani request Express, mengekstrak data identitas user dari JWT,
 * memanggil Service Layer, dan memformat hasil respon HTTP JSON yang seragam.
 */
class UserController {
  /**
   * Detail Profil Pengguna Aktif
   * Mengekstrak req.user.id dari payload token JWT dan meminta data profil bersih ke Service.
   */
  async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req.user.id);
      return successResponse(res, 'Detail profil berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pembaruan Detail Profil Akun
   * Menerima payload body request baru dan merubahnya melalui Service.
   */
  async updateProfile(req, res, next) {
    try {
      const result = await userService.updateProfile(req.user.id, req.body);
      return successResponse(res, 'Profil berhasil diperbarui', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Statistik Produktivitas Tugas
   * Mengambil kalkulasi jumlah tugas berdasarkan status untuk halaman Dashboard Flutter.
   */
  async getStatistics(req, res, next) {
    try {
      const result = await userService.getStatistics(req.user.id);
      return successResponse(res, 'Statistik tugas berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log Riwayat Aktivitas Keamanan
   * Mengambil log audit histori aktivitas akun pengguna (maksimal 20 item).
   */
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

