import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../middlewares/errorHandler';
import { metaService } from '../services/meta.service';
import { logger } from '../utils/logger';

/**
 * メタ分析コントローラー
 */
export const metaController = {
  /**
   * 現在のチャンピオンティアリストを取得
   */
  getChampionTierList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tier = 'all', role = 'all', region = 'all' } = req.query;
      
      logger.info(`Fetching champion tier list for tier: ${tier}, role: ${role}, region: ${region}`);
      
      const tierList = await metaService.getChampionTierList(
        tier as string,
        role as string,
        region as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: tierList,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * パッチ間のメタ変化トレンドを取得
   */
  getMetaTrends: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { patches = 3, role = 'all' } = req.query;
      
      const trends = await metaService.getMetaTrends(
        Number(patches),
        role as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * 人気のビルドパスを取得
   */
  getPopularBuilds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { championId, role = 'all', tier = 'all' } = req.query;
      
      if (!championId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Champion ID is required');
      }
      
      const builds = await metaService.getPopularBuilds(
        championId as string,
        role as string,
        tier as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: builds,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * レーン別のマッチアップ情報を取得
   */
  getLaneMatchups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, tier = 'all' } = req.query;
      
      if (!role) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Role is required');
      }
      
      const matchups = await metaService.getLaneMatchups(
        role as string,
        tier as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: matchups,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * ゲーム時間ごとのチャンピオン勝率を取得
   */
  getWinRateByGameLength: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { championId, role = 'all', tier = 'all' } = req.query;
      
      if (!championId) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Champion ID is required');
      }
      
      const winRates = await metaService.getWinRateByGameLength(
        championId as string,
        role as string,
        tier as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: winRates,
      });
    } catch (error) {
      next(error);
    }
  },
};
