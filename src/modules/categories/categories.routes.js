const express = require('express');
const router = express.Router();
const categoryController = require('./categories.controller');
const validate = require('../../middlewares/validate');
const authMiddleware = require('../../middlewares/auth');
const { createCategorySchema, updateCategorySchema } = require('./categories.validation');

// Memproteksi seluruh rute di modul ini secara global menggunakan JWT Auth
router.use(authMiddleware);

// Rute untuk operasi CRUD kategori
router.get('/', categoryController.getCategories);
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// Rute untuk relasi tugas dan kemajuan progres kategori
router.get('/:id/tasks', categoryController.getTasks);
router.get('/:id/progress', categoryController.getProgress);

module.exports = router;
