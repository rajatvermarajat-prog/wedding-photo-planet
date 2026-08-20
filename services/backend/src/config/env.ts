import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT_SECRET: process.env.JWT_SECRET || 'wedding_photo_planet_crm_jwt_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET || 'wedding_photo_planet_crm_session_secret_2026',

  INACTIVITY_TIMEOUT_MINUTES: parseInt(process.env.INACTIVITY_TIMEOUT_MINUTES || '10', 10),
  GRACE_PERIOD_MINUTES: parseInt(process.env.GRACE_PERIOD_MINUTES || '5', 10),
  AUTO_LOGOUT_ENABLED: process.env.AUTO_LOGOUT_ENABLED !== 'false',
  INACTIVITY_NOTIFICATION_ENABLED: process.env.INACTIVITY_NOTIFICATION_ENABLED !== 'false',
  LIVE_ACTIVITY_ENABLED: process.env.LIVE_ACTIVITY_ENABLED !== 'false',
  ALLOW_MULTIPLE_SESSIONS: process.env.ALLOW_MULTIPLE_SESSIONS === 'true',

  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
};
