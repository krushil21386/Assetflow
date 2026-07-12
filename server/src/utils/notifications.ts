import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createNotification = async (userId: number, title: string, message: string, type: string = 'INFO') => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const notifyDepartmentHead = async (departmentId: number, title: string, message: string, type: string = 'INFO') => {
  try {
    const dept = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { head: true },
    });
    
    if (dept?.head?.userId) {
      await createNotification(dept.head.userId, title, message, type);
    }
  } catch (error) {
    console.error('Failed to notify department head:', error);
  }
};

export const notifyRoles = async (roleNames: string[], title: string, message: string, type: string = 'INFO') => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          name: { in: roleNames }
        }
      }
    });

    for (const user of users) {
      await createNotification(user.id, title, message, type);
    }
  } catch (error) {
    console.error('Failed to notify roles:', error);
  }
};
