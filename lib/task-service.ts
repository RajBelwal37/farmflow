import { prisma } from '@/lib/prisma';

export class TaskService {
  async createTask(taskData: {
    title: string;
    type: string;
    priority: string;
    description: string;
    dueDate: Date;
    assignedTo?: string;
    userId: string;
  }) {
    return prisma.task.create({
      data: {
        ...taskData,
        status: 'PENDING',
      },
    });
  }

  async getTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async updateTaskStatus(taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED') {
    return prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async deleteTask(taskId: string) {
    return prisma.task.delete({
      where: { id: taskId },
    });
  }
} 