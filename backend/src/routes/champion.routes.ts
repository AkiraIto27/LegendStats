import express from 'express';
import { championController } from '../controllers/champion.controller';

const router = express.Router();

/**
 * @route GET /api/champions
 * @desc 全チャンピオン情報を取得
 * @access Public
 */
router.get('/', championController.getAllChampions);

/**
 * @route GET /api/champions/:id
 * @desc チャンピオンIDから詳細情報を取得
 * @access Public
 */
router.get('/:id', championController.getChampionById);

/**
 * @route GET /api/champions/:id/stats
 * @desc チャンピオンの統計情報を取得（勝率、ピック率、バン率など）
 * @access Public
 */
router.get('/:id/stats', championController.getChampionStats);

/**
 * @route GET /api/champions/:id/builds
 * @desc チャンピオンの推奨ビルド情報を取得
 * @access Public
 */
router.get('/:id/builds', championController.getChampionBuilds);

/**
 * @route GET /api/champions/:id/counters
 * @desc チャンピオンのカウンター情報を取得
 * @access Public
 */
router.get('/:id/counters', championController.getChampionCounters);

/**
 * @route GET /api/champions/:id/matchups
 * @desc チャンピオンの対面別勝率情報を取得
 * @access Public
 */
router.get('/:id/matchups', championController.getChampionMatchups);

export default router;
