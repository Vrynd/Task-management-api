const authService = require('./auth.service');
const { successResponse } = require('../../utils/response');

/**
 * Controller Layer: Pengendali Alur Autentikasi
 * Menerima request HTTP Express, mengekstrak data payload dari req.body,
 * memanggil Service Layer, dan mengembalikan respon standardisasi JSON.
 */
class AuthController {
  /**
   * Pendaftaran Akun Baru
   * Menerima input data user baru, mendelegasikan ke service, dan merespon dengan status 201.
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, 'Registrasi pengguna berhasil', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Masuk Aplikasi (Login)
   * Memvalidasi email/password pengguna dan mengembalikan access token JWT.
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, 'Login berhasil', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Keluar Aplikasi (Logout)
   * Menghancurkan token pengguna saat ini (client-side handles token disposal).
   */
  async logout(req, res, next) {
    try {
      await authService.logout(req.token, req.tokenExpiry);
      return successResponse(res, 'Logout berhasil', null, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

