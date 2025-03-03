import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';
import { connectDB } from './config/database';

// 環境変数のロード
dotenv.config();

// アプリケーションの初期化
const app = express();
const port = process.env.PORT || 3001;

// データベース接続（MongoDB）
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ミドルウェア
app.use(helmet()); // セキュリティ強化
app.use(compression()); // レスポンス圧縮
app.use(morgan('dev')); // リクエストログ
app.use(express.json()); // JSON解析
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // CORS対応

// ルート
app.use('/api', routes);

// エラーハンドラー
app.use(errorHandler);

// サーバー起動
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

export default app;
