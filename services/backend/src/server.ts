import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { prisma } from './config/prisma';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { SocketServer } from './sockets/socketServer';
import { InactivityMonitorService } from './services/inactivityMonitor.service';

const app = express();
const httpServer = http.createServer(app);

// 1. Security & Parsing Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl) or any localhost/frontend origin
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === env.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 2. Static File Uploads Directory
app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// 3. Healthcheck Endpoints
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Wedding Photo Planet CRM Backend API',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Wedding Photo Planet CRM Backend API',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 4. Rate Limiting on API routes
app.use('/api', generalLimiter);

// 5. Mount API Routes (support both /api and /api/v1)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

// 6. 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    errorCode: 'ROUTE_NOT_FOUND',
  });
});

// 7. Global Error Handler
app.use(errorHandler);

// 8. Initialize Socket.IO Server
const socketServer = SocketServer.getInstance();
socketServer.init(httpServer);

// 9. Start Background Inactivity Monitor (Checks every 30 seconds)
InactivityMonitorService.start(30000);

// 10. Start HTTP Server
const PORT = env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log(`🚀 Wedding Photo Planet CRM Backend Server Online`);
  console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
  console.log(`🔌 WebSockets: Enabled on port ${PORT}`);
  console.log(`🔒 Security: Helmet, RateLimiting & JWT active`);
  console.log(`⏱️ Inactivity Watcher: ${env.INACTIVITY_TIMEOUT_MINUTES}m idle + ${env.GRACE_PERIOD_MINUTES}m grace`);
  console.log(`📦 Environment: ${env.NODE_ENV}`);
  console.log('====================================================');
});

// Graceful Shutdown Handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  try {
    InactivityMonitorService.stop();
    await prisma.$disconnect();
    httpServer.close(() => {
      console.log('✅ Server HTTP listener closed cleanly.');
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Error during graceful shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

export { app, httpServer };
