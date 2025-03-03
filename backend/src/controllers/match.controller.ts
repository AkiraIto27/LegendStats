import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../middlewares/errorHandler';
import { matchService } from '../services/match.service';
import { logger } from '../utils/logger';

/**
 * マッチコントローラー
 */
export const matchController = {
  /**
   * マッチIDから試合情報を取得
   */
  getMatchById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, matchId } = req.params;
      
      logger.info(`Fetching match: ${matchId} in ${region}`);
      
      const match = await matchService.getMatchById(region, matchId);
      
      if (!match) {
        throw new ApiError(httpStatus.NOT_FOUND, `Match not found: ${matchId}`);
      }
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: match,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * マッチIDから試合タイムライン情報を取得
   */
  getMatchTimeline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, matchId } = req.params;
      
      const timeline = await matchService.getMatchTimeline(region, matchId);
      
      if (!timeline) {
        throw new ApiError(httpStatus.NOT_FOUND, `Match timeline not found: ${matchId}`);
      }
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: timeline,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * AIによるマッチ分析を実行
   */
  analyzeMatch: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { region, matchId, summonerName } = req.body;
      
      if (!region || !matchId || !summonerName) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Missing required parameters: region, matchId, summonerName'
        );
      }
      
      logger.info(`Analyzing match: ${matchId} for summoner: ${summonerName}`);
      
      const analysis = await matchService.analyzeMatch(region, matchId, summonerName);
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * チャンピオン構成から勝敗予測を実行
   */
  predictMatchOutcome: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { blueTeam, redTeam } = req.body;
      
      if (!blueTeam || !redTeam || !Array.isArray(blueTeam) || !Array.isArray(redTeam)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Invalid request format. Both teams must be arrays of champion IDs/names'
        );
      }
      
      if (blueTeam.length !== 5 || redTeam.length !== 5) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          'Each team must have exactly 5 champions'
        );
      }
      
      const prediction = await matchService.predictMatchOutcome(blueTeam, redTeam);
      
      res.status(httpStatus.OK).json({
        status: 'success',
        data: prediction,
      });
    } catch (error) {
      next(error);
    }
  },
};
