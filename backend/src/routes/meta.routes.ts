import express from 'express';
import { metaController } from '../controllers/meta.controller';

const router = express.Router();

/**
 * @route GET /api/meta/tier-list
 * @desc 現在のチャンピオンティアリストを取得
 * @access Public
 */
router.get('/tier-list', metaController.getChampionTierList);

/**
 * @route GET /api/meta/trends
 * @desc パッチ間のメタ変化トレンドを取得
 * @access Public
 */
router.get('/trends', metaController.getMetaTrends);

/**
 * @route GET /api/meta/popular-builds
 * @desc 人気のビルドパスを取得
 * @access Public
 */
router.get('/popular-builds', metaController.getPopularBuilds);

/**
 * @route GET /api/meta/lane-matchups
 * @desc レーン別のマッチアップ情報を取得
 * @access Public
 */
router.get('/lane-matchups', metaController.getLaneMatchups);

/**
 * @route GET /api/meta/win-rate-by-game-length
 * @desc ゲーム時間ごとのチャンピオン勝率を取得
 * @access Public
 */
router.get('/win-rate-by-game-length', metaController.getWinRateByGameLength);

export default router;
