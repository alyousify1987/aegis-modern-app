import { Server } from 'socket.io';
import { Logger } from 'winston';

export class SocketService {
  private io: Server;
  private logger: Logger;

  constructor(io: Server, logger: Logger) {
    this.io = io;
    this.logger = logger;
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user_${userId}`).emit(event, data);
    this.logger.debug(`Sent ${event} to user ${userId}`, data);
  }

  // Send notification to all users in organization
  sendToOrganization(organizationId: string, event: string, data: any): void {
    this.io.to(`org_${organizationId}`).emit(event, data);
    this.logger.debug(`Sent ${event} to organization ${organizationId}`, data);
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any): void {
    this.io.emit(event, data);
    this.logger.debug(`Broadcasted ${event}`, data);
  }

  // Send audit status update
  sendAuditUpdate(auditId: string, update: any): void {
    this.io.to(`audit_${auditId}`).emit('auditUpdate', {
      auditId,
      ...update,
      timestamp: new Date()
    });
  }

  // Send real-time analytics update
  sendAnalyticsUpdate(organizationId: string, metrics: any): void {
    this.sendToOrganization(organizationId, 'analyticsUpdate', {
      metrics,
      timestamp: new Date()
    });
  }

  // Join user to rooms based on their access
  joinUserRooms(socket: any, user: any): void {
    // Join personal room
    socket.join(`user_${user.id}`);
    
    // Join organization room
    if (user.organizationId) {
      socket.join(`org_${user.organizationId}`);
    }
    
    this.logger.debug(`User ${user.id} joined rooms`);
  }

  // Leave user rooms
  leaveUserRooms(socket: any, user: any): void {
    socket.leave(`user_${user.id}`);
    
    if (user.organizationId) {
      socket.leave(`org_${user.organizationId}`);
    }
    
    this.logger.debug(`User ${user.id} left rooms`);
  }
}
