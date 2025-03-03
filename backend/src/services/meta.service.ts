import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import httpStatus from 'http-status';
import { tierListService } from './meta/tierList.service';
import { metaTrendsService } from './meta/metaTrends.service';
import { buildsService } from './meta/builds.service';
import { matchupsService } from './meta/matchups.service';
import { gameTimingService } from './meta/gameTiming.service';

/**
 * メタ分析サービス
 * 各サブサービスを集約して提供します
 */
export const metaService = {
  /**
   * 現在のチャンピオンティアリストを取得
   */
  getChampionTierList: async (tier: string = 'all', role: string = 'all', region: string = 'all') => {
    try {
      return await tierListService.getChampionTierList(tier, role, region);
    } catch (error: any) {
      logger.error('Error generating champion tier list:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error generating champion tier list: ${error.message}`
      );
    }
  },

  /**
   * パッチ間のメタ変化トレンドを取得
   */
  getMetaTrends: async (patches: number = 3, role: string = 'all') => {
    try {
      return await metaTrendsService.getMetaTrends(patches, role);
    } catch (error: any) {
      logger.error('Error generating meta trends:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error generating meta trends: ${error.message}`
      );
    }
  },

  /**
   * 人気のビルドパスを取得
   */
  getPopularBuilds: async (championId: string, role: string = 'all', tier: string = 'all') => {
    try {
      return await buildsService.getPopularBuilds(championId, role, tier);
    } catch (error: any) {
      logger.error(`Error fetching popular builds for ${championId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching popular builds: ${error.message}`
      );
    }
  },

  /**
   * レーン別のマッチアップ情報を取得
   */
  getLaneMatchups: async (role: string, tier: string = 'all') => {
    try {
      return await matchupsService.getLaneMatchups(role, tier);
    } catch (error: any) {
      logger.error(`Error fetching lane matchups for ${role}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching lane matchups: ${error.message}`
      );
    }
  },

  /**
   * ゲーム時間ごとのチャンピオン勝率を取得
   */
  getWinRateByGameLength: async (championId: string, role: string = 'all', tier: string = 'all') => {
    try {
      return await gameTimingService.getWinRateByGameLength(championId, role, tier);
    } catch (error: any) {
      logger.error(`Error fetching win rate by game length for ${championId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching win rate by game length: ${error.message}`
      );
    }
  },
};
