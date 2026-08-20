import { prisma } from '../config/prisma';
import { socketManager } from '../sockets/socketServer';
import { NotificationType } from '@prisma/client';

export class NotificationService {
  public static async getUserNotifications(userId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
  }

  public static async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, user_id: userId },
    });

    if (!notification) {
      throw { statusCode: 404, message: 'Notification not found', errorCode: 'NOTIFICATION_NOT_FOUND' };
    }

    return prisma.notification.update({
      where: { id },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  public static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: {
        is_read: true,
        read_at: new Date(),
      },
    });
  }

  public static async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    referenceId?: string;
    referenceType?: string;
  }) {
    const notif = await prisma.notification.create({
      data: {
        user_id: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        reference_id: data.referenceId,
        reference_type: data.referenceType,
      },
    });

    socketManager.notifyNotification(data.userId, notif);
    return notif;
  }
}
