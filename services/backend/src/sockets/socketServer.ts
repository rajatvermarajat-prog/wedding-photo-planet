import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export class SocketServer {
  private static instance: SocketServer;
  private io: SocketIOServer | null = null;
  private onlineUsers: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds

  private constructor() {}

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    // Socket Authentication Middleware
    this.io.use(async (socket: Socket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const payload = verifyToken(token);
        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, username: true, full_name: true, role: true, status: true },
        });

        if (!user || user.status !== 'ACTIVE') {
          return next(new Error('User inactive or invalid'));
        }

        // Attach user info to socket
        (socket as any).user = user;
        (socket as any).sessionId = payload.sessionId;
        next();
      } catch (err) {
        next(new Error('Invalid socket credentials'));
      }
    });

    // Connection Handler
    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      if (!user) return;

      const userId = user.id;

      // Track online socket
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)?.add(socket.id);

      // Join personal room
      socket.join(`user_${userId}`);

      // If Admin or Manager, join admin room
      if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
        socket.join('admin_room');
      }

      console.log(`🔌 Socket connected: ${user.username} (${user.role}) - ID: ${socket.id}`);

      // Broadcast user online event to admins
      this.emitToAdmins('member:online', {
        userId: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        onlineAt: new Date(),
      });

      // Disconnect Handler
      socket.on('disconnect', () => {
        const sockets = this.onlineUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.onlineUsers.delete(userId);
            this.emitToAdmins('member:offline', {
              userId: user.id,
              username: user.username,
              offlineAt: new Date(),
            });
          }
        }
        console.log(`🔌 Socket disconnected: ${user.username} - ID: ${socket.id}`);
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  public isUserOnline(userId: string): boolean {
    const sockets = this.onlineUsers.get(userId);
    return !!(sockets && sockets.size > 0);
  }

  public emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user_${userId}`).emit(event, data);
  }

  public emitToAdmins(event: string, data: any) {
    if (!this.io) return;
    this.io.to('admin_room').emit(event, data);
  }

  public broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Domain-specific real-time triggers
  public notifyInactivityWarning(userId: string, data: {
    minutesIdle: number;
    gracePeriodMinutes: number;
    expiresAt: Date;
    taskId?: string;
    taskTitle?: string;
  }) {
    this.emitToUser(userId, 'member:idle-warning', data);
    this.emitToAdmins('admin:member-idle-alert', {
      userId,
      ...data,
      alertTime: new Date(),
    });
  }

  public notifyAutoLogout(userId: string, data: {
    reason: string;
    message: string;
    taskId?: string;
  }) {
    this.emitToUser(userId, 'member:auto-logout', data);
    this.emitToAdmins('member:auto-logout-event', {
      userId,
      ...data,
      logoutTime: new Date(),
    });
  }

  public notifyTaskAssigned(userId: string, data: any) {
    this.emitToUser(userId, 'task:assigned', data);
    this.emitToAdmins('task:assigned-admin', data);
  }

  public notifyNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification:new', notification);
  }
}

export const socketManager = SocketServer.getInstance();
