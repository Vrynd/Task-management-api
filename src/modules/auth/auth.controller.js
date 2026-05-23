const authService = require('./auth.service');
const { successResponse } = require('../../utils/response');

/**
 * Controller to handle Auth requests
 */
class AuthController {
  /**
   * Register a new account
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
   * Login user
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
   * Logout user and blacklist session token
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
