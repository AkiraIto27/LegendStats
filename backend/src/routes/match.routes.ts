import express from 'express';
import { matchController } from '../controllers/match.controller';

const router = express.Router();

/**
 * @route GET /api/matches/:region/:matchId
 * @desc マッチIDから試合情報を取得
 * @access Public
 */
router.get('/:region/:matchId', matchController.getMatchById);

/**
 * @route GET /api/matches/:region/:matchId/timeline
 * @desc マッチIDから試合タイムライン情報を取得
 * @access Public
 */
router.get('/:region/:matchId/timeline', matchController.getMatchTimeline);

/**
 * @route POST /api/matches/analysis
 * @desc AIによるマッチ分析を実行
 * @access Public
 */
router.post('/analysis', matchController.analyzeMatch);

/**
 * @route POST /api/matches/prediction
 * @desc チャンピオン構成から勝敗予測を実行
 * @access Public
 */
router.post('/prediction', matchController.predictMatchOutcome);

export default router;
