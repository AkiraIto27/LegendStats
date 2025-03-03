import winston from 'winston';

const { combine, timestamp, printf, colorize } = winston.format;

// ログフォーマット
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${typeof message === 'object' ? JSON.stringify(message) : message}`;
});

// ロガーの作成
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // コンソール出力
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    // ファイル出力（本番環境用）
    ...(process.env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ] : [])
  ],
});
