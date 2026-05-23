const prisma = require('../../config/prisma');

// Service Layer untuk mengelola seluruh logika bisnis terkait kategori tugas
class CategoryService {
  // Mengambil semua kategori milik pengguna tertentu
  async getCategories(userId) {
    return prisma.category.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
  }

  // Membuat kategori tugas baru
  async createCategory(userId, { name, description, color }) {
    const result = await prisma.$transaction(async (tx) => {
      const newCategory = await tx.category.create({
        data: {
          user_id: userId,
          name,
          description,
          color
        }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'CREATE_CATEGORY',
          description: `Membuat kategori baru: ${name}`
        }
      });

      return newCategory;
    });

    return result;
  }

  // Memperbarui informasi kategori tugas
  async updateCategory(categoryId, userId, { name, description, color }) {
    // Memeriksa kepemilikan kategori sebelum memperbarui
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId }
    });

    if (!existingCategory) {
      const error = new Error('Kategori tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedCategory = await tx.category.update({
        where: { id: categoryId },
        data: { name, description, color }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'UPDATE_CATEGORY',
          description: `Memperbarui kategori: ${name || existingCategory.name}`
        }
      });
      return updatedCategory;
    });
    return result;
  }

  // Menghapus kategori tugas secara transaksional
  async deleteCategory(categoryId, userId) {
    // Memeriksa kepemilikan kategori sebelum menghapus
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId }
    });

    if (!existingCategory) {
      const error = new Error('Kategori tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedCategory = await tx.category.delete({
        where: { id: categoryId }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'DELETE_CATEGORY',
          description: `Menghapus kategori: ${existingCategory.name}`
        }
      });
      return deletedCategory;
    });
    return result;
  }

  // Mengambil semua daftar tugas di dalam kategori tertentu
  async getTasks(categoryId, userId) {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId }
    });

    if (!existingCategory) {
      const error = new Error('Kategori tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    return prisma.task.findMany({
      where: { category_id: categoryId, user_id: userId },
      orderBy: { deadline: 'asc' }
    });
  }

  // Menghitung progres persentase penyelesaian tugas di dalam kategori tertentu
  async getProgress(categoryId, userId) {
    const existingCategory = await prisma.category.findFirst({
      where: { id: categoryId, user_id: userId }
    });

    if (!existingCategory) {
      const error = new Error('Kategori tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const [totalTasks, completedTasks] = await Promise.all([
      prisma.task.count({ where: { category_id: categoryId, user_id: userId } }),
      prisma.task.count({ where: { category_id: categoryId, user_id: userId, status: 'DONE' } })
    ]);

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      category_name: existingCategory.name,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      progress_percentage: progressPercentage
    };
  }
}

module.exports = new CategoryService();
