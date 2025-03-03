import mongoose from 'mongoose';
import { logger } from '../utils/logger';

/**
 * MongoDB接続関数
 */
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lol-stats-hub';
    await mongoose.connect(mongoURI);
    logger.info('MongoDB Connected');
  } catch (error) {
    logger.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

/**
 * MongoDB切断関数（テスト用）
 */
export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB Disconnected');
};
