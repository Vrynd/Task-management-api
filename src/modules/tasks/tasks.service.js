const prisma = require('../../config/prisma');

/**
 * Service Layer: Logika Bisnis & Operasi Database Tugas (Task)
 * Mengelola interaksi basis data PostgreSQL secara aman menggunakan Prisma Client.
 */
class TaskService {
  /**
   * Mengambil Semua Daftar Tugas
   * Mengambil seluruh tugas milik pengguna aktif, diurutkan berdasarkan batas waktu terdekat
   * dan menyertakan data kategori yang berelasi.
   */
  async getAllTasks(userId) {
    return prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { deadline: 'asc' },
      include: { category: true }
    });
  }

  /**
   * Pembuatan Tugas Baru Secara Transaksional
   * - Menangani pencocokan kategori secara case-insensitive. Jika kategori belum ada,
   *   sistem akan membuatnya secara otomatis di database.
   * - Menyimpan data tugas utama.
   * - Mencatat status awal TODO ke tabel audit log status (TaskLog).
   * - Mencatat log aktivitas ke tabel Activity.
   * Semua operasi didelegasikan dalam satu prisma.$transaction untuk konsistensi data.
   */
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

      await tx.taskLog.create({
        data: {
          task_id: newTask.id,
          new_status: 'TODO'
        }
      });

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

  /**
   * Mengambil Detail Tugas Berdasarkan ID
   * Memastikan pengguna yang login hanya dapat memanggil tugas miliknya sendiri (Authorization Check).
   */
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

  /**
   * Pembaruan Tugas Secara Transaksional
   * - Memastikan tugas tersebut adalah milik user aktif.
   * - Menghubungkan atau membuat kategori baru secara dinamis berdasarkan input.
   * - Melakukan pembaruan kolom dan menyimpan log aktivitas.
   */
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

  /**
   * Penghapusan Tugas Secara Transaksional
   * Menghapus tugas dan menulis log audit aktivitas. Pustaka Cascade
   * pada schema database otomatis membersihkan record TaskLog terkait.
   */
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

  /**
   * Pembaruan Status Tugas
   * Mengubah status penyelesaian tugas, mendokumentasikan status lama dan status baru
   * pada tabel TaskLog, serta mencatat log audit ke tabel Activity secara atomik.
   */
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
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: { status },
        include: { category: true }
      });

      await tx.taskLog.create({
        data: {
          task_id: taskId,
          old_status: existingTask.status,
          new_status: status
        }
      });

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

