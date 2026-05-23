const prisma = require('../../config/prisma');

// Service untuk menangani logika bisnis terkait Tugas (Task) dan Sub-tugas (Subtask)
class TaskService {
  // Mengambil semua daftar tugas milik pengguna tertentu
  async getAllTasks(userId) {
    return prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { deadline: 'asc' },
      include: {
        subtasks: true,
        category: {
          select: { id: true, name: true, color: true }
        }
      }
    });
  }

  // Membuat tugas baru beserta opsional sub-tugas secara transaksional
  async createTask(userId, { title, description, priority, deadline, start_time, end_time, category_id, subtasks }) {
    // Memeriksa kepemilikan kategori jika category_id disediakan
    if (category_id) {
      const category = await prisma.category.findFirst({
        where: { id: category_id, user_id: userId }
      });
      if (!category) {
        const error = new Error('Kategori tidak ditemukan atau Anda tidak memiliki akses');
        error.statusCode = 404;
        throw error;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Simpan tugas utama
      const newTask = await tx.task.create({
        data: {
          user_id: userId,
          category_id,
          title,
          description,
          priority,
          deadline,
          start_time,
          end_time,
          subtasks: subtasks && subtasks.length > 0 ? {
            createMany: {
              data: subtasks.map(s => ({ title: s.title }))
            }
          } : undefined
        },
        include: { subtasks: true }
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

  // Mengambil detail satu tugas beserta daftar sub-tugasnya
  async getTaskById(taskId, userId) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId },
      include: {
        subtasks: true,
        category: {
          select: { id: true, name: true, color: true }
        }
      }
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

    // Memeriksa kepemilikan kategori jika category_id diperbarui
    if (updateData.category_id) {
      const category = await prisma.category.findFirst({
        where: { id: updateData.category_id, user_id: userId }
      });
      if (!category) {
        const error = new Error('Kategori tidak ditemukan atau Anda tidak memiliki akses');
        error.statusCode = 404;
        throw error;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: updateData,
        include: { subtasks: true }
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
        data: { status }
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

  // Menambahkan sub-tugas baru ke dalam tugas tertentu
  async createSubtask(taskId, userId, { title }) {
    const existingTask = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId }
    });

    if (!existingTask) {
      const error = new Error('Tugas utama tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newSubtask = await tx.subtask.create({
        data: {
          task_id: taskId,
          title
        }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'CREATE_SUBTASK',
          description: `Menambahkan subtugas "${title}" ke dalam tugas "${existingTask.title}"`
        }
      });
      return newSubtask;
    });
    return result;
  }

  // Memperbarui judul atau status pencapaian (selesai/tidak) sub-tugas
  async updateSubtask(subtaskId, userId, { title, is_done }) {
    const existingSubtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true }
    });

    if (!existingSubtask || existingSubtask.task.user_id !== userId) {
      const error = new Error('Subtugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedSubtask = await tx.subtask.update({
        where: { id: subtaskId },
        data: { title, is_done }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'UPDATE_SUBTASK',
          description: `Memperbarui status/judul subtugas pada tugas "${existingSubtask.task.title}"`
        }
      });
      return updatedSubtask;
    });
    return result;
  }

  // Menghapus sub-tugas dari tugas tertentu
  async deleteSubtask(subtaskId, userId) {
    const existingSubtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { task: true }
    });

    if (!existingSubtask || existingSubtask.task.user_id !== userId) {
      const error = new Error('Subtugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedSubtask = await tx.subtask.delete({
        where: { id: subtaskId }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'DELETE_SUBTASK',
          description: `Menghapus subtugas dari tugas "${existingSubtask.task.title}"`
        }
      });
      return deletedSubtask;
    });
    return result;
  }
}

module.exports = new TaskService();
