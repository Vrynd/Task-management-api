const dashboardService = require('./dashboard.service');
const { successResponse } = require('../../utils/response');

/**
 * Controller untuk menangani permintaan halaman Dashboard utama dan penyematan tugas fokus harian
 */
class DashboardController {
  /**
   * Menghapus tugas dari daftar fokus harian (unpin)
   */
  async unpinFocusTask(req, res, next) {
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const focusDate = req.query.focus_date || todayStr;
      const result = await dashboardService.unpinFocusTask(req.user.id, req.params.taskId, focusDate);

      return successResponse(res, 'Tugas berhasil dihapus dari fokus harian', result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menyematkan tugas ke dalam daftar fokus harian (pin)
   */
  async pinFocusTask(req, res, next) {
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const focusDate = req.body.focus_date || todayStr;
      const result = await dashboardService.pinFocusTask(req.user.id, req.body.task_id, focusDate);

      return successResponse(res, 'Tugas berhasil disematkan ke fokus harian', result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mengambil agregasi data halaman dashboard utama hari ini
   */
  async getDashboardToday(req, res, next) {
    try {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const dateParam = req.query.date || todayStr;
      const result = await dashboardService.getDashboardToday(req.user.id, dateParam);

      return successResponse(res, 'Data dashboard hari ini berhasil diambil', result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
