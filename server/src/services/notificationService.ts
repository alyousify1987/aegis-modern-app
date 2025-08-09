import { PrismaClient } from '@prisma/client';
import { Logger } from 'winston';
import { SocketService } from './socketService';

export class NotificationService {
  private prisma: PrismaClient;
  private socketService: SocketService;
  private logger: Logger;

  constructor(
    prisma: PrismaClient,
    socketService: SocketService,
    logger: Logger
  ) {
    this.prisma = prisma;
    this.socketService = socketService;
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    this.logger.info('Notification service initialized');
  }

  // Send a notification to a user
  async sendNotification(userId: string, title: string, message: string, type: string = 'info', data?: any): Promise<void> {
    try {
      // Store in database
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          data: data ? JSON.stringify(data) : null
        }
      });

      // Send real-time notification
      this.socketService.sendToUser(userId, 'notification', {
        id: notification.id,
        title,
        message,
        type,
        data,
        timestamp: notification.createdAt
      });

      this.logger.info(`Notification sent to user ${userId}: ${title}`);
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
    }
  }

  // Send audit-related notifications
  async sendAuditNotification(auditId: string, type: 'created' | 'updated' | 'completed', userIds: string[]): Promise<void> {
    const titles = {
      created: 'New Audit Created',
      updated: 'Audit Updated',
      completed: 'Audit Completed'
    };

    const messages = {
      created: 'A new audit has been assigned to you',
      updated: 'An audit you are involved in has been updated',
      completed: 'An audit has been completed and requires your review'
    };

    for (const userId of userIds) {
      await this.sendNotification(
        userId,
        titles[type],
        messages[type],
        'audit',
        { auditId, type }
      );
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });
    } catch (error) {
      this.logger.error('Failed to mark notification as read:', error);
    }
  }

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: {
          userId,
          read: false
        }
      });
    } catch (error) {
      this.logger.error('Failed to get unread count:', error);
      return 0;
    }
  }
}
