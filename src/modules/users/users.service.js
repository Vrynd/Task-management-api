const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');

/**
 * Service Layer: Logika Bisnis & Operasi Database Pengguna
 * Menangani query database PostgreSQL menggunakan Prisma Client secara transaksional
 * serta pemrosesan data sensitif seperti password hashing.
 */
class UserService {
  /**
   * Mengambil Profil Pengguna
   * Menyaring password_hash menggunakan filter 'select' sebelum mengembalikan data profil
   * ke controller untuk menjaga kerahasiaan kredensial.
   */
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      const error = new Error('Pengguna tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Memperbarui Profil Secara Transaksional
   * - Menghash sandi baru dengan bcrypt jika diubah.
   * - Menggunakan prisma.$transaction untuk menjamin bahwa pembaruan profil user
   *   dan pencatatan log aktivitas di tabel Activity berjalan sukses bersamaan.
   */
  async updateProfile(userId, { name, avatar_url, password }) {
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatar_url: true,
          created_at: true,
          updated_at: true
        }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'UPDATE_PROFILE',
          description: 'Memperbarui detail profil akun'
        }
      });
      return updatedUser;
    });
    return result;
  }

  /**
   * Metrik Statistik Penyelesaian Tugas
   * - today: Tanggal hari ini jam 00:00:00.000 untuk perbandingan deadline yang terlambat.
   * - Promise.all: Menjalankan 5 perintah database count secara bersamaan (paralel)
   *   untuk mempercepat response time bagi aplikasi Flutter.
   */
  async getStatistics(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      lateTasks
    ] = await Promise.all([
      prisma.task.count({ where: { user_id: userId } }),
      prisma.task.count({ where: { user_id: userId, status: 'DONE' } }),
      prisma.task.count({ where: { user_id: userId, status: 'TODO' } }),
      prisma.task.count({ where: { user_id: userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({
        where: {
          user_id: userId,
          status: { not: 'DONE' },
          deadline: { lt: today }
        }
      })
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      todo_tasks: todoTasks,
      in_progress_tasks: inProgressTasks,
      late_tasks: lateTasks,
      completion_rate_percentage: completionRate
    };
  }

  /**
   * Log Histori Aktivitas
   * Mengambil 20 riwayat audit log aktivitas akun terbaru.
   */
  async getActivities(userId) {
    return prisma.activity.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20
    });
  }
}

module.exports = new UserService();

