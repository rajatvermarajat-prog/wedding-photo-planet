import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔥 [Unhandled Error]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation Error', 400, 'VALIDATION_FAILED', formattedErrors);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Session token expired. Please login again.', 401, 'TOKEN_EXPIRED');
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    return sendError(
      res,
      `A record with this ${target} already exists.`,
      409,
      'DUPLICATE_ENTRY'
    );
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return sendError(res, 'Requested resource not found.', 404, 'NOT_FOUND');
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred';
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  return sendError(res, message, statusCode, errorCode);
};
