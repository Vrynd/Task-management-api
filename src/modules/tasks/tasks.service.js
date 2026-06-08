const prisma = require('../../config/prisma');

// Service untuk menangani logika bisnis terkait Tugas (Task)
class TaskService {
  // Mengambil semua daftar tugas milik pengguna tertentu
  async getAllTasks(userId) {
    return prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { deadline: 'asc' },
      include: { category: true }
    });
  }

  // Membuat tugas baru secara transaksional
  async createTask(userId, { title, description, priority, deadline, category }) {
    const result = await prisma.$transaction(async (tx) => {
      let categoryId = null;
      if (category && category.name) {
        let existingCategory = await tx.category.findFirst({
          where: {
            user_id: userId,
            name: {
              equals: category.name,
              mode: 'insensitive'
            }
          }
        });

        if (existingCategory) {
          categoryId = existingCategory.id;
          if (category.color && existingCategory.color !== category.color) {
            existingCategory = await tx.category.update({
              where: { id: existingCategory.id },
              data: { color: category.color }
            });
          }
        } else {
          const newCategory = await tx.category.create({
            data: {
              user_id: userId,
              name: category.name,
              color: category.color || '#94A3B8'
            }
          });
          categoryId = newCategory.id;
        }
      }

      // Simpan tugas utama
      const newTask = await tx.task.create({
        data: {
          user_id: userId,
          category_id: categoryId,
          title,
          description,
          priority,
          deadline
        },
        include: { category: true }
      });

      // Catat log awal perubahan status tugas (TODO)
      await tx.taskLog.create({
        data: {
          task_id: newTask.id,
          new_status: 'TODO'
        }
      });

      // Catat riwayat aktivitas pembuatan tugas
      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'CREATE_TASK',
          description: `Membuat tugas baru: ${title}`
        }
      });
      return newTask;
    });
    return result;
  }

  // Mengambil detail satu tugas
  async getTaskById(taskId, userId) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId },
      include: { category: true }
    });

    if (!task) {
      const error = new Error('Tugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }
    return task;
  }

  // Memperbarui detail tugas
  async updateTask(taskId, userId, updateData) {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId }
    });

    if (!existingTask) {
      const error = new Error('Tugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const { category, ...restOfUpdateData } = updateData;

    const result = await prisma.$transaction(async (tx) => {
      let categoryId = undefined; // undefined berarti tidak merubah relasi category

      if (category === null) {
        categoryId = null; // menghapus relasi category
      } else if (category && category.name) {
        let existingCategory = await tx.category.findFirst({
          where: {
            user_id: userId,
            name: {
              equals: category.name,
              mode: 'insensitive'
            }
          }
        });

        if (existingCategory) {
          categoryId = existingCategory.id;
          if (category.color && existingCategory.color !== category.color) {
            existingCategory = await tx.category.update({
              where: { id: existingCategory.id },
              data: { color: category.color }
            });
          }
        } else {
          const newCategory = await tx.category.create({
            data: {
              user_id: userId,
              name: category.name,
              color: category.color || '#94A3B8'
            }
          });
          categoryId = newCategory.id;
        }
      }

      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: {
          ...restOfUpdateData,
          ...(categoryId !== undefined ? { category_id: categoryId } : {})
        },
        include: { category: true }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'UPDATE_TASK',
          description: `Memperbarui detail tugas: ${updatedTask.title}`
        }
      });
      return updatedTask;
    });
    return result;
  }

  // Menghapus tugas secara transaksional
  async deleteTask(taskId, userId) {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId }
    });

    if (!existingTask) {
      const error = new Error('Tugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedTask = await tx.task.delete({
        where: { id: taskId }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'DELETE_TASK',
          description: `Menghapus tugas: ${existingTask.title}`
        }
      });
      return deletedTask;
    });
    return result;
  }

  // Mengubah status tugas secara spesifik dan mencatat riwayat perubahannya
  async updateStatus(taskId, userId, status) {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId }
    });

    if (!existingTask) {
      const error = new Error('Tugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Perbarui status tugas
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { status },
        include: { category: true }
      });

      // Catat riwayat perpindahan status di TaskLog
      await tx.taskLog.create({
        data: {
          task_id: taskId,
          old_status: existingTask.status,
          new_status: status
        }
      });

      // Catat riwayat aktivitas
      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'UPDATE_TASK_STATUS',
          description: `Mengubah status tugas "${existingTask.title}" dari ${existingTask.status} menjadi ${status}`
        }
      });
      return updatedTask;
    });
    return result;
  }
}

module.exports = new TaskService();
