import express from 'express';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = express.Router();

/**
 * @route GET /api/leaderboard/:region/ranked
 * @desc ランク別のプレイヤーランキングを取得
 * @access Public
 */
router.get('/:region/ranked', leaderboardController.getRankedLeaderboard);

/**
 * @route GET /api/leaderboard/:region/champions
 * @desc チャンピオンマスタリーのランキングを取得
 * @access Public
 */
router.get('/:region/champions', leaderboardController.getChampionMasteryLeaderboard);

/**
 * @route GET /api/leaderboard/:region/win-rate
 * @desc 勝率ランキングを取得
 * @access Public
 */
router.get('/:region/win-rate', leaderboardController.getWinRateLeaderboard);

/**
 * @route GET /api/leaderboard/:region/kda
 * @desc KDAランキングを取得
 * @access Public
 */
router.get('/:region/kda', leaderboardController.getKdaLeaderboard);

export default router;
