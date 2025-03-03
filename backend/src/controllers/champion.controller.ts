import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../middlewares/errorHandler';
import { championService } from '../services/champion.service';
import { logger } from '../utils/logger';

/**
 * チャンピオンコントローラー
 */
export const championController = {
  /**
   * 全チャンピオン情報を取得
   */
  getAllChampions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { locale = 'ja_JP' } = req.query;
      
      logger.info(`Fetching all champions with locale: ${locale}`);
      
      const champions = await championService.getAllChampions(locale as string);
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: champions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * チャンピオンIDから詳細情報を取得
   */
  getChampionById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { locale = 'ja_JP' } = req.query;
      
      logger.info(`Fetching champion: ${id} with locale: ${locale}`);
      
      const champion = await championService.getChampionById(id, locale as string);
      
      if (!champion) {
        throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${id}`);
      }
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: champion,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * チャンピオンの統計情報を取得
   */
  getChampionStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { tier = 'all', region = 'all', queue = 'ranked_solo_5x5' } = req.query;
      
      const stats = await championService.getChampionStats(
        id,
        tier as string,
        region as string,
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
   * チャンピオンの推奨ビルド情報を取得
   */
  getChampionBuilds: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { tier = 'all', position = 'all' } = req.query;
      
      const builds = await championService.getChampionBuilds(
        id,
        tier as string,
        position as string
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
   * チャンピオンのカウンター情報を取得
   */
  getChampionCounters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { tier = 'all', position = 'all' } = req.query;
      
      const counters = await championService.getChampionCounters(
        id,
        tier as string,
        position as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: counters,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * チャンピオンの対面別勝率情報を取得
   */
  getChampionMatchups: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { tier = 'all', position = 'all' } = req.query;
      
      const matchups = await championService.getChampionMatchups(
        id,
        tier as string,
        position as string
      );
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: matchups,
      });
    } catch (error) {
      next(error);
    }
  },
};
