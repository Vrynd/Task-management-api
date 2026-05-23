const express = require('express');
const router = express.Router();
const userController = require('./users.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const { updateProfileSchema } = require('./users.validation');

// Memproteksi seluruh rute di modul ini secara global 
router.use(authMiddleware);

//  Rute untuk profil pengguna
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

// Rute untuk statistik dan riwayat aktivitas tugas
router.get('/statistics', userController.getStatistics);
router.get('/activities', userController.getActivities);

module.exports = router;
