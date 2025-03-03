import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { logger } from '../utils/logger';

/**
 * API エラークラス
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * グローバルエラーハンドラー
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // ApiErrorでない場合はデフォルトのステータスコードを設定
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = 
      error.name === 'CastError' ? httpStatus.BAD_REQUEST :
      error.name === 'ValidationError' ? httpStatus.BAD_REQUEST :
      httpStatus.INTERNAL_SERVER_ERROR;
    
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const apiError = error as ApiError;
  const response = {
    status: 'error',
    statusCode: apiError.statusCode,
    message: apiError.message,
    ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
  };

  // エラーをログに記録
  logger.error({
    message: apiError.message,
    stack: apiError.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
  });

  res.status(apiError.statusCode).json(response);
};

/**
 * 404エラーハンドラー（存在しないルートへのアクセス）
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(httpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`);
  next(error);
};
