import { getRiotApiClient } from '../utils/riotApi';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import httpStatus from 'http-status';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * リーダーボード・ランキングサービス
 */
export const leaderboardService = {
  /**
   * ランク別のプレイヤーランキングを取得
   * 注: この機能はダミー実装です。実際の実装ではRiot APIからチャレンジャーリーグ情報を取得し、拡張します
   */
  getRankedLeaderboard: async (region: string, queue: string = 'RANKED_SOLO_5x5', page: number = 1, limit: number = 100) => {
    try {
      // ダミープレイヤーデータを生成
      const generatePlayers = (count: number) => {
        const players = [];
        const tiers = ['CHALLENGER', 'GRANDMASTER', 'MASTER'];
        const tierIndex = queue === 'RANKED_SOLO_5x5' ? 0 : queue === 'RANKED_FLEX_SR' ? 1 : 2;
        const tier = tiers[tierIndex];
        
        for (let i = 0; i < count; i++) {
          const wins = Math.floor(Math.random() * 300 + 200);
          const losses = Math.floor(Math.random() * 200 + 100);
          const winRate = (wins / (wins + losses) * 100).toFixed(2);
          
          players.push({
            summonerId: `dummy-id-${i}`,
            summonerName: `Player${(page - 1) * limit + i + 1}`,
            position: i + 1 + (page - 1) * limit,
            tier,
            rank: tier === 'CHALLENGER' ? 'I' : tier === 'GRANDMASTER' ? 'I' : 'I',
            leaguePoints: Math.floor(Math.random() * 1000 + 500),
            wins,
            losses,
            winRate,
            hotStreak: Math.random() > 0.7,
            veteran: Math.random() > 0.5,
            freshBlood: Math.random() > 0.8,
            inactive: false,
            mostPlayedChampions: [
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Yasuo', 'Ahri', 'Lee Sin', 'Jinx', 'Thresh'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 100 + 50),
                winRate: (Math.random() * 20 + 50).toFixed(2),
              },
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Zed', 'Lux', 'Ezreal', 'Caitlyn', 'Yone'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 80 + 30),
                winRate: (Math.random() * 20 + 50).toFixed(2),
              },
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Jhin', 'Lulu', 'Malphite', 'Darius', 'Irelia'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 50 + 20),
                winRate: (Math.random() * 20 + 50).toFixed(2),
              },
            ],
          });
        }
        
        // LPで降順ソート
        return players.sort((a, b) => b.leaguePoints - a.leaguePoints);
      };
      
      const players = generatePlayers(limit);
      
      return {
        region,
        queue,
        page,
        limit,
        totalPlayers: 300, // ダミーの総プレイヤー数
        players,
      };
    } catch (error: any) {
      logger.error(`Error fetching ranked leaderboard for ${region}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching ranked leaderboard: ${error.message}`
      );
    }
  },

  /**
   * チャンピオンマスタリーのランキングを取得
   * 注: この機能はダミー実装です。実際の実装ではRiot APIからマスタリーデータを収集し、データベースに蓄積して利用します
   */
  getChampionMasteryLeaderboard: async (region: string, championId: string, page: number = 1, limit: number = 100) => {
    try {
      // ダミープレイヤーデータを生成
      const generatePlayers = (count: number) => {
        const players = [];
        
        for (let i = 0; i < count; i++) {
          const level = Math.floor(Math.random() * 2 + 5); // マスタリーレベル5-7
          
          players.push({
            summonerId: `dummy-id-${i}`,
            summonerName: `MasteryPlayer${(page - 1) * limit + i + 1}`,
            position: i + 1 + (page - 1) * limit,
            championId,
            championLevel: level,
            championPoints: Math.floor(Math.random() * 500000 + 500000),
            championPointsSinceLastLevel: Math.floor(Math.random() * 50000),
            championPointsUntilNextLevel: level < 7 ? Math.floor(Math.random() * 20000) : 0,
            chestGranted: Math.random() > 0.5,
            tokensEarned: level === 5 ? Math.floor(Math.random() * 3) : level === 6 ? Math.floor(Math.random() * 4) : 0,
            lastPlayTime: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
          });
        }
        
        // ポイントで降順ソート
        return players.sort((a, b) => b.championPoints - a.championPoints);
      };
      
      const players = generatePlayers(limit);
      
      return {
        region,
        championId,
        page,
        limit,
        totalPlayers: 1000, // ダミーの総プレイヤー数
        players,
      };
    } catch (error: any) {
      logger.error(`Error fetching champion mastery leaderboard for ${championId} in ${region}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion mastery leaderboard: ${error.message}`
      );
    }
  },

  /**
   * 勝率ランキングを取得
   * 注: この機能はダミー実装です。実際の実装では収集したマッチデータを分析して勝率を計算します
   */
  getWinRateLeaderboard: async (
    region: string,
    queue: string = 'RANKED_SOLO_5x5',
    tier: string = 'all',
    minGames: number = 50,
    page: number = 1,
    limit: number = 100
  ) => {
    try {
      // ダミープレイヤーデータを生成
      const generatePlayers = (count: number) => {
        const players = [];
        const tiers = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'PLATINUM'];
        
        for (let i = 0; i < count; i++) {
          const playerTier = tier === 'all' ? tiers[Math.floor(Math.random() * 5)] : tier.toUpperCase();
          const games = Math.floor(Math.random() * 500 + minGames);
          const winRate = Math.random() * 15 + 55; // 55-70%のランダムな勝率
          const wins = Math.floor(games * (winRate / 100));
          const losses = games - wins;
          
          players.push({
            summonerId: `dummy-id-${i}`,
            summonerName: `WinRatePlayer${(page - 1) * limit + i + 1}`,
            position: i + 1 + (page - 1) * limit,
            tier: playerTier,
            rank: ['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)],
            leaguePoints: Math.floor(Math.random() * 100),
            games,
            wins,
            losses,
            winRate: winRate.toFixed(2),
            kda: (Math.random() * 3 + 2).toFixed(2),
            mostPlayedChampions: [
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Yasuo', 'Ahri', 'Lee Sin', 'Jinx', 'Thresh'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 100 + 50),
                winRate: (Math.random() * 20 + 50).toFixed(2),
              },
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Zed', 'Lux', 'Ezreal', 'Caitlyn', 'Yone'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 80 + 30),
                winRate: (Math.random() * 20 + 50).toFixed(2),
              },
            ],
          });
        }
        
        // 勝率で降順ソート
        return players.sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate));
      };
      
      const players = generatePlayers(limit);
      
      return {
        region,
        queue,
        tier,
        minGames,
        page,
        limit,
        totalPlayers: 500, // ダミーの総プレイヤー数
        players,
      };
    } catch (error: any) {
      logger.error(`Error fetching win rate leaderboard for ${region}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching win rate leaderboard: ${error.message}`
      );
    }
  },

  /**
   * KDAランキングを取得
   * 注: この機能はダミー実装です。実際の実装では収集したマッチデータを分析してKDAを計算します
   */
  getKdaLeaderboard: async (
    region: string,
    queue: string = 'RANKED_SOLO_5x5',
    champion: string = 'all',
    minGames: number = 30,
    page: number = 1,
    limit: number = 100
  ) => {
    try {
      // ダミープレイヤーデータを生成
      const generatePlayers = (count: number) => {
        const players = [];
        const tiers = ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'PLATINUM'];
        
        for (let i = 0; i < count; i++) {
          const playerTier = tiers[Math.floor(Math.random() * 5)];
          const games = Math.floor(Math.random() * 200 + minGames);
          
          // KDAコンポーネント生成
          const kills = (Math.random() * 5 + 5).toFixed(2);
          const deaths = (Math.random() * 2 + 1).toFixed(2);
          const assists = (Math.random() * 8 + 5).toFixed(2);
          const kda = (parseFloat(kills) + parseFloat(assists)) / parseFloat(deaths);
          
          players.push({
            summonerId: `dummy-id-${i}`,
            summonerName: `KdaPlayer${(page - 1) * limit + i + 1}`,
            position: i + 1 + (page - 1) * limit,
            tier: playerTier,
            rank: ['I', 'II', 'III', 'IV'][Math.floor(Math.random() * 4)],
            games,
            kda: kda.toFixed(2),
            kills,
            deaths,
            assists,
            championName: champion === 'all' ? 'All Champions' : champion,
            championId: champion === 'all' ? null : champion,
            winRate: (Math.random() * 15 + 50).toFixed(2),
            mostPlayedChampions: champion === 'all' ? [
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Yasuo', 'Ahri', 'Lee Sin', 'Jinx', 'Thresh'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 100 + 50),
                kda: (Math.random() * 3 + 2).toFixed(2),
              },
              {
                championId: Math.floor(Math.random() * 150 + 1),
                championName: ['Zed', 'Lux', 'Ezreal', 'Caitlyn', 'Yone'][Math.floor(Math.random() * 5)],
                games: Math.floor(Math.random() * 80 + 30),
                kda: (Math.random() * 3 + 2).toFixed(2),
              },
            ] : [],
          });
        }
        
        // KDAで降順ソート
        return players.sort((a, b) => parseFloat(b.kda) - parseFloat(a.kda));
      };
      
      const players = generatePlayers(limit);
      
      return {
        region,
        queue,
        champion,
        minGames,
        page,
        limit,
        totalPlayers: 500, // ダミーの総プレイヤー数
        players,
      };
    } catch (error: any) {
      logger.error(`Error fetching KDA leaderboard for ${region}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching KDA leaderboard: ${error.message}`
      );
    }
  },
};
