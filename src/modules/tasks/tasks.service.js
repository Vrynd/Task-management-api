const prisma = require('../../config/prisma');

// Service untuk menangani logika bisnis terkait Tugas (Task)
class TaskService {
  // Mengambil semua daftar tugas milik pengguna tertentu
  async getAllTasks(userId) {
    return prisma.task.findMany({
      where: { user_id: userId },
      orderBy: { deadline: 'asc' }
    });
  }

  // Membuat tugas baru secara transaksional
  async createTask(userId, { title, description, priority, deadline }) {
    const result = await prisma.$transaction(async (tx) => {
      // Simpan tugas utama
      const newTask = await tx.task.create({
        data: {
          user_id: userId,
          title,
          description,
          priority,
          deadline
        }
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
      where: { id: taskId, user_id: userId }
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

    const result = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.task.update({
        where: { id: taskId },
        data: updateData
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

  // Menghapus tugas dari daftar fokus harian (unpin)
  async unpinFocusTask(userId, taskId, dateStr) {
    const focusDate = new Date(dateStr);
    const existingPin = await prisma.dailyFocusTask.findFirst({
      where: {
        user_id: userId,
        task_id: taskId,
        focus_date: focusDate
      }
    });

    if (!existingPin) {
      const error = new Error('Tugas fokus tidak ditemukan pada tanggal ini');
      error.statusCode = 404;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const deletedPin = await tx.dailyFocusTask.delete({
        where: { id: existingPin.id }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'UNPIN_FOCUS_TASK',
          description: `Menghapus tugas dari fokus harian tanggal ${dateStr}`
        }
      });
      return deletedPin;
    });
    return result;
  }

  // Menyematkan tugas ke dalam fokus harian (pin)
  async pinFocusTask(userId, taskId, dateStr) {
    const focusDate = new Date(dateStr);
    const task = await prisma.task.findFirst({
      where: { id: taskId, user_id: userId }
    });

    if (!task) {
      const error = new Error('Tugas tidak ditemukan atau Anda tidak memiliki akses');
      error.statusCode = 404;
      throw error;
    }

    const existingPin = await prisma.dailyFocusTask.findFirst({
      where: {
        user_id: userId,
        task_id: taskId,
        focus_date: focusDate
      }
    });

    if (existingPin) {
      const error = new Error('Tugas ini sudah disematkan sebagai fokus hari ini');
      error.statusCode = 400;
      throw error;
    }

    const result = await prisma.$transaction(async (tx) => {
      const newPin = await tx.dailyFocusTask.create({
        data: {
          user_id: userId,
          task_id: taskId,
          focus_date: focusDate
        },
        include: { task: true }
      });

      await tx.activity.create({
        data: {
          user_id: userId,
          action_type: 'PIN_FOCUS_TASK',
          description: `Menyematkan tugas "${task.title}" ke fokus harian tanggal ${dateStr}`
        }
      });
      return newPin;
    });
    return result;
  }

  // Mengambil super agregasi data dashboard untuk hari tertentu (Today Dashboard)
  async getDashboardToday(userId, dateStr) {
    const targetDate = new Date(dateStr);

    const [todayTasks, focusRecords, overdueTasks] = await Promise.all([
      prisma.task.findMany({
        where: {
          user_id: userId,
          deadline: targetDate
        }
      }),
      prisma.dailyFocusTask.findMany({
        where: {
          user_id: userId,
          focus_date: targetDate
        },
        include: {
          task: true
        }
      }),
      prisma.task.findMany({
        where: {
          user_id: userId,
          deadline: { lt: targetDate },
          status: { not: 'DONE' }
        }
      })
    ]);

    const totalTasks = todayTasks.length;
    const completedTasks = todayTasks.filter(t => t.status === 'DONE').length;
    const remainingTasks = totalTasks - completedTasks;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const manualFocusTasks = focusRecords.map(r => r.task);
    const highPriorityTodayTasks = todayTasks.filter(t => t.priority === 'HIGH');
    const combinedFocusMap = new Map();

    manualFocusTasks.forEach(t => {
      if (t) combinedFocusMap.set(t.id, t);
    });
    highPriorityTodayTasks.forEach(t => {
      combinedFocusMap.set(t.id, t);
    });

    const focusTodayList = Array.from(combinedFocusMap.values());
    const timelineTasks = [...todayTasks].sort((a, b) => {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

    const riskTasksMap = new Map();
    overdueTasks.forEach(t => riskTasksMap.set(t.id, t));
    todayTasks.forEach(t => {
      if (t.status !== 'DONE' && t.priority === 'HIGH') {
        riskTasksMap.set(t.id, t);
      }
    });
    const riskTasksList = Array.from(riskTasksMap.values());

    return {
      date: dateStr,
      summary: {
        total: totalTasks,
        completed: completedTasks,
        remaining: remainingTasks,
        progress_percentage: progressPercentage
      },
      focus_today: focusTodayList,
      timeline: timelineTasks,
      risk_tasks: riskTasksList
    };
  }
}

module.exports = new TaskService();
