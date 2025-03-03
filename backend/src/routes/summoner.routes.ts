import express from 'express';
import { summonerController } from '../controllers/summoner.controller';

const router = express.Router();

/**
 * @route GET /api/summoners/:region/:name
 * @desc サモナー名からプロフィール情報を取得
 * @access Public
 */
router.get('/:region/:name', summonerController.getSummonerByName);

/**
 * @route GET /api/summoners/:region/:name/matches
 * @desc サモナーの最近のマッチ履歴を取得
 * @access Public
 */
router.get('/:region/:name/matches', summonerController.getSummonerMatches);

/**
 * @route GET /api/summoners/:region/:name/champion-masteries
 * @desc サモナーのチャンピオンマスタリーを取得
 * @access Public
 */
router.get('/:region/:name/champion-masteries', summonerController.getChampionMasteries);

/**
 * @route GET /api/summoners/:region/:name/live-game
 * @desc サモナーの現在進行中のゲーム情報を取得
 * @access Public
 */
router.get('/:region/:name/live-game', summonerController.getLiveGame);

/**
 * @route GET /api/summoners/:region/:name/stats
 * @desc サモナーの統計情報を取得（勝率、KDA、使用チャンピオン等）
 * @access Public
 */
router.get('/:region/:name/stats', summonerController.getSummonerStats);

/**
 * @route GET /api/summoners/:region/:name/growth
 * @desc サモナーの成長分析データを取得
 * @access Public
 */
router.get('/:region/:name/growth', summonerController.getGrowthAnalysis);

export default router;
