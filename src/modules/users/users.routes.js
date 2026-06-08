const express = require('express');
const router = express.Router();
const userController = require('./users.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const { updateProfileSchema } = require('./users.validation');

/**
 * Keamanan Tingkat Modul (Global Guard)
 * Memasang middleware autentikasi JWT di awal untuk mengunci seluruh rute 
 * di modul Users. Setiap request wajib memiliki token Bearer JWT yang valid.
 */
router.use(authMiddleware);

/**
 * Endpoint Pengelolaan Profil Pengguna
 * - GET /profile: Memanggil controller untuk mengambil detail profil pengguna aktif.
 * - PUT /profile: Memvalidasi body input menggunakan Zod schema sebelum memperbarui profil.
 */
router.get('/profile', userController.getProfile);
router.put('/profile', validate(updateProfileSchema), userController.updateProfile);

/**
 * Endpoint Analisis & Audit Akun
 * - GET /statistics: Mengambil ringkasan metrik statistik tugas untuk dashboard Flutter.
 * - GET /activities: Mengambil maksimal 20 log aktivitas akun terbaru.
 */
router.get('/statistics', userController.getStatistics);
router.get('/activities', userController.getActivities);

module.exports = router;

