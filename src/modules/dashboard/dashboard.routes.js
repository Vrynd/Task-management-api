const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const {
  pinFocusTaskSchema,
  unpinFocusTaskSchema,
  getDashboardTodaySchema
} = require('./dashboard.validation');

// Proteksi keamanan global JWT Auth untuk seluruh rute dashboard
router.use(authMiddleware);

// Rute utama untuk menampilkan data halaman dashboard hari ini
router.get('/today', validate(getDashboardTodaySchema), dashboardController.getDashboardToday);

// Rute untuk manajemen tugas fokus harian (Pin & Unpin)
router.post('/focus', validate(pinFocusTaskSchema), dashboardController.pinFocusTask);
router.delete('/focus/:taskId', validate(unpinFocusTaskSchema), dashboardController.unpinFocusTask);

module.exports = router;
