import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message = 'Success',
  statusCode = 200
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message = 'Internal Server Error',
  statusCode = 500,
  errorCode = 'INTERNAL_ERROR',
  errors?: any
): Response => {
  const payload: ApiResponse = {
    success: false,
    message,
    errorCode,
    errors,
  };
  return res.status(statusCode).json(payload);
};
