const prisma = require('../../config/prisma');

// Service Layer untuk mengelola logika bisnis dashboard utama dan fokus harian
class DashboardService {
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
        },
        include: {
          subtasks: true,
          category: { select: { id: true, name: true, color: true } }
        }
      }),
      prisma.dailyFocusTask.findMany({
        where: {
          user_id: userId,
          focus_date: targetDate
        },
        include: {
          task: {
            include: {
              subtasks: true,
              category: { select: { id: true, name: true, color: true } }
            }
          }
        }
      }),
      prisma.task.findMany({
        where: {
          user_id: userId,
          deadline: { lt: targetDate },
          status: { not: 'DONE' }
        },
        include: {
          subtasks: true,
          category: { select: { id: true, name: true, color: true } }
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
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
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

module.exports = new DashboardService();
