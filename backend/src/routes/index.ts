import express from 'express';
import summonerRoutes from './summoner.routes';
import matchRoutes from './match.routes';
import championRoutes from './champion.routes';
import leaderboardRoutes from './leaderboard.routes';
import metaRoutes from './meta.routes';
import { notFoundHandler } from '../middlewares/errorHandler';

const router = express.Router();

// ヘルスチェックエンドポイント
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 各機能のルーターを結合
router.use('/summoners', summonerRoutes);
router.use('/matches', matchRoutes);
router.use('/champions', championRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/meta', metaRoutes);

// 404ハンドラー
router.use(notFoundHandler);

export default router;
