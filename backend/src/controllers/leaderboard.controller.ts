import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../middlewares/errorHandler';
import { leaderboardService } from '../services/leaderboard.service';
import { logger } from '../utils/logger';

/**
 * リーダーボード・ランキングコントローラー
 */
export const leaderboardController = {
  /**
   * ランク別のプレイヤーランキングを取得
   */
  getRankedLeaderboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region } = req.params;
      const { queue = 'RANKED_SOLO_5x5', page = 1, limit = 100 } = req.query;
      
      logger.info(`Fetching ranked leaderboard for ${region}, queue: ${queue}`);
      
      const leaderboard = await leaderboardService.getRankedLeaderboard(
        region,
        queue as string,
        Number(page),
        Number(limit)
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * チャンピオンマスタリーのランキングを取得
   */
  getChampionMasteryLeaderboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region } = req.params;
      const { championId, page = 1, limit = 100 } = req.query;
      
      if (!championId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Champion ID is required');
      }
      
      const leaderboard = await leaderboardService.getChampionMasteryLeaderboard(
        region,
        championId as string,
        Number(page),
        Number(limit)
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 勝率ランキングを取得
   */
  getWinRateLeaderboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region } = req.params;
      const { queue = 'RANKED_SOLO_5x5', tier = 'all', minGames = 50, page = 1, limit = 100 } = req.query;
      
      const leaderboard = await leaderboardService.getWinRateLeaderboard(
        region,
        queue as string,
        tier as string,
        Number(minGames),
        Number(page),
        Number(limit)
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * KDAランキングを取得
   */
  getKdaLeaderboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region } = req.params;
      const { queue = 'RANKED_SOLO_5x5', champion = 'all', minGames = 30, page = 1, limit = 100 } = req.query;
      
      const leaderboard = await leaderboardService.getKdaLeaderboard(
        region,
        queue as string,
        champion as string,
        Number(minGames),
        Number(page),
        Number(limit)
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: leaderboard,
      });
    } catch (error) {
      next(error);
    }
  },
};
