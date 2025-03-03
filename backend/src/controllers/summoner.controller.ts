import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../middlewares/errorHandler';
import { summonerService } from '../services/summoner.service';
import { logger } from '../utils/logger';

/**
 * サモナーコントローラー
 */
export const summonerController = {
  /**
   * サモナー名からプロフィール情報を取得
   */
  getSummonerByName: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, name } = req.params;
      
      logger.info(`Fetching summoner: ${name} in ${region}`);
      
      const summoner = await summonerService.getSummonerByName(region, name);
      
      if (!summoner) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${name}`);
      }
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: summoner,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * サモナーの最近のマッチ履歴を取得
   */
  getSummonerMatches: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, name } = req.params;
      const { count = 20, offset = 0 } = req.query;
      
      const matches = await summonerService.getSummonerMatches(
        region,
        name,
        Number(count),
        Number(offset)
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: matches,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * サモナーのチャンピオンマスタリーを取得
   */
  getChampionMasteries: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, name } = req.params;
      
      const masteries = await summonerService.getChampionMasteries(region, name);
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: masteries,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * サモナーのライブゲーム情報を取得
   */
  getLiveGame: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, name } = req.params;
      
      const liveGame = await summonerService.getLiveGame(region, name);
      
      // ライブゲームが存在しない場合は404を返す（エラーではない）
      if (!liveGame) {
        return res.status(httpStatus.NOT_FOUND).json({
          status: 'success',
          message: 'Summoner is not in an active game',
          data: null,
        });
      }
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: liveGame,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * サモナーの統計情報を取得
   */
  getSummonerStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, name } = req.params;
      const { season = 'current', queue = 'ranked_solo_5x5' } = req.query;
      
      const stats = await summonerService.getSummonerStats(
        region,
        name,
        season as string,
        queue as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * サモナーの成長分析データを取得
   */
  getGrowthAnalysis: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, name } = req.params;
      const { period = '30days' } = req.query;
      
      const growthData = await summonerService.getGrowthAnalysis(
        region,
        name,
        period as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: growthData,
      });
    } catch (error) {
      next(error);
    }
  },
};
