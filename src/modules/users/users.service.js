const bcrypt = require('bcrypt');
const prisma = require('../../config/prisma');

// Service Layer untuk memproses seluruh operasi database terkait pengguna
class UserService {
  // Mengambil profil lengkap user berdasarkan ID
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

  // Memperbarui profil dan menyimpan log pembaruan secara transaksional
  async updateProfile(userId, { name, avatar_url, password }) {
    const updateData = {};
    if (name) updateData.name = name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Memastikan konsistensi data pembaruan profil dan pencatatan aktivitas
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

      // Mencatat aktivitas pembaruan profil
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

  // Menghitung dan merangkum seluruh statistik performa tugas pengguna
  async getStatistics(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Menghitung berbagai statistik tugas secara paralel
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

  // Mengambil riwayat log aktivitas terbaru pengguna (maksimal 20 record)
  async getActivities(userId) {
    return prisma.activity.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20
    });
  }
}

module.exports = new UserService();
