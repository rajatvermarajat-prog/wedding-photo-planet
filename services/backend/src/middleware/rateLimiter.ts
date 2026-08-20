import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errorCode: 'RATE_LIMIT_EXCEEDED',
  },
});

// Strict rate limiter for authentication endpoints (prevent brute-force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 login attempts per 15 mins per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
    errorCode: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});

// Heartbeat & activity limiter (allows continuous pinging)
export const activityLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // up to 2 requests per second
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many activity pings',
    errorCode: 'ACTIVITY_RATE_LIMIT_EXCEEDED',
  },
});
