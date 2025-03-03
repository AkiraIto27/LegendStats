import { getRiotApiClient } from '../utils/riotApi';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import httpStatus from 'http-status';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * サモナーサービス
 */
export const summonerService = {
  /**
   * サモナー名からプロフィール情報を取得
   */
  getSummonerByName: async (region: string, summonerName: string) => {
    try {
      // サモナーの基本情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        return null;
      }
      
      // ランク情報を取得
      const leagueEntries = await riotApiClient.getLeagueEntriesBySummonerId(region, summonerData.id);
      
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // 統合されたサモナープロフィールを構築
      const profile = {
        name: summonerData.name,
        level: summonerData.summonerLevel,
        profileIconId: summonerData.profileIconId,
        profileIconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${summonerData.profileIconId}.png`,
        id: summonerData.id,
        accountId: summonerData.accountId,
        puuid: summonerData.puuid,
        revisionDate: summonerData.revisionDate,
        ranks: leagueEntries.map(entry => ({
          queueType: entry.queueType,
          tier: entry.tier,
          rank: entry.rank,
          leaguePoints: entry.leaguePoints,
          wins: entry.wins,
          losses: entry.losses,
          winRate: Math.round((entry.wins / (entry.wins + entry.losses)) * 100),
          hotStreak: entry.hotStreak,
          veteran: entry.veteran,
          freshBlood: entry.freshBlood,
          inactive: entry.inactive,
        })),
      };
      
      return profile;
    } catch (error: any) {
      // 404エラーの場合はnullを返す
      if (error.response && error.response.status === 404) {
        return null;
      }
      
      logger.error('Error fetching summoner data:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error fetching summoner data from Riot API'
      );
    }
  },

  /**
   * サモナーの最近のマッチ履歴を取得
   */
  getSummonerMatches: async (region: string, summonerName: string, count: number = 20, offset: number = 0) => {
    try {
      // まずサモナーの基本情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${summonerName}`);
      }
      
      // PUUIDを使ってマッチIDリストを取得
      const matchIds = await riotApiClient.getMatchIdsByPuuid(region, summonerData.puuid, count + offset);
      
      // offsetを適用
      const paginatedMatchIds = matchIds.slice(offset, offset + count);
      
      // 各マッチの詳細情報を取得
      const matchesPromises = paginatedMatchIds.map(matchId => 
        riotApiClient.getMatchById(region, matchId)
      );
      
      const matchesData = await Promise.all(matchesPromises);
      
      // サモナーごとのマッチ詳細を抽出
      const matches = matchesData.map(match => {
        // 該当サモナーの参加者情報を抽出
        const participant = match.info.participants.find(
          (p: any) => p.puuid === summonerData.puuid
        );
        
        if (!participant) {
          return null;
        }
        
        // チーム情報を抽出
        const team = match.info.teams.find(
          (t: any) => t.teamId === participant.teamId
        );
        
        // 味方と敵チームの参加者をフィルタリング
        const teamPlayers = match.info.participants
          .filter((p: any) => p.teamId === participant.teamId)
          .map((p: any) => ({
            summonerName: p.summonerName,
            championId: p.championId,
            championName: p.championName,
            team: p.teamId,
          }));
        
        const enemyPlayers = match.info.participants
          .filter((p: any) => p.teamId !== participant.teamId)
          .map((p: any) => ({
            summonerName: p.summonerName,
            championId: p.championId,
            championName: p.championName,
            team: p.teamId,
          }));
        
        // マッチの詳細情報を整形
        return {
          id: match.metadata.matchId,
          gameCreation: match.info.gameCreation,
          gameDuration: match.info.gameDuration,
          gameMode: match.info.gameMode,
          gameType: match.info.gameType,
          gameVersion: match.info.gameVersion,
          mapId: match.info.mapId,
          queueId: match.info.queueId,
          win: participant.win,
          championId: participant.championId,
          championName: participant.championName,
          champLevel: participant.champLevel,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          kda: participant.deaths > 0 
            ? ((participant.kills + participant.assists) / participant.deaths).toFixed(2) 
            : (participant.kills + participant.assists).toFixed(2),
          totalDamageDealtToChampions: participant.totalDamageDealtToChampions,
          totalDamageTaken: participant.totalDamageTaken,
          cs: participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0),
          csPerMin: ((participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0)) / (match.info.gameDuration / 60)).toFixed(1),
          goldEarned: participant.goldEarned,
          items: [
            participant.item0,
            participant.item1,
            participant.item2,
            participant.item3,
            participant.item4,
            participant.item5,
            participant.item6,
          ],
          summoner1Id: participant.summoner1Id,
          summoner2Id: participant.summoner2Id,
          visionScore: participant.visionScore,
          role: participant.role,
          lane: participant.lane,
          teamPlayers,
          enemyPlayers,
          // チーム別の統計
          teamStats: {
            teamId: team.teamId,
            win: team.win,
            objectives: team.objectives,
            bans: team.bans,
          },
        };
      }).filter(Boolean);
      
      return {
        matches,
        total: matchIds.length,
        page: Math.floor(offset / count) + 1,
        count,
        hasMore: offset + count < matchIds.length,
      };
    } catch (error: any) {
      logger.error('Error fetching summoner matches:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error fetching summoner matches from Riot API'
      );
    }
  },

  /**
   * サモナーのチャンピオンマスタリーを取得
   */
  getChampionMasteries: async (region: string, summonerName: string) => {
    try {
      // まずサモナーの基本情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${summonerName}`);
      }
      
      // チャンピオンマスタリーを取得
      const masteries = await riotApiClient.getChampionMasteries(region, summonerData.id);
      
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // チャンピオン情報を取得
      const championsResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/ja_JP/champion.json`);
      const championsData = await championsResponse.json();
      const champions = championsData.data;
      
      // チャンピオンIDとキーのマッピングを作成
      const championKeyToId: { [key: string]: string } = {};
      Object.values(champions).forEach((champion: any) => {
        championKeyToId[champion.key] = champion.id;
      });
      
      // マスタリー情報を整形
      const formattedMasteries = masteries.map((mastery: any) => {
        const championId = championKeyToId[mastery.championId];
        return {
          championId: mastery.championId,
          championName: championId,
          championLevel: mastery.championLevel,
          championPoints: mastery.championPoints,
          lastPlayTime: mastery.lastPlayTime,
          championPointsSinceLastLevel: mastery.championPointsSinceLastLevel,
          championPointsUntilNextLevel: mastery.championPointsUntilNextLevel,
          chestGranted: mastery.chestGranted,
          tokensEarned: mastery.tokensEarned,
          championIconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championId}.png`,
        };
      });
      
      return formattedMasteries;
    } catch (error: any) {
      logger.error('Error fetching champion masteries:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error fetching champion masteries from Riot API'
      );
    }
  },

  /**
   * サモナーのライブゲーム情報を取得
   */
  getLiveGame: async (region: string, summonerName: string) => {
    try {
      // まずサモナーの基本情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${summonerName}`);
      }
      
      try {
        // ライブゲーム情報を取得
        const liveGame = await riotApiClient.getActiveGameBySummonerId(region, summonerData.id);
        
        // 最新のData Dragonバージョンを取得
        const latestVersion = await riotApiClient.getLatestDataDragonVersion();
        
        // 参加プレイヤーの詳細情報を追加
        const enhancedParticipants = await Promise.all(
          liveGame.participants.map(async (participant: any) => {
            try {
              // プレイヤーのランク情報を取得
              const leagueEntries = await riotApiClient.getLeagueEntriesBySummonerId(region, participant.summonerId);
              
              // ソロランクとフレックスランクを抽出
              const soloRank = leagueEntries.find((entry: any) => entry.queueType === 'RANKED_SOLO_5x5');
              const flexRank = leagueEntries.find((entry: any) => entry.queueType === 'RANKED_FLEX_SR');
              
              return {
                ...participant,
                championIconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${participant.championId}.png`,
                spell1IconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${participant.spell1Id}.png`,
                spell2IconUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${participant.spell2Id}.png`,
                ranks: {
                  soloRank: soloRank ? {
                    tier: soloRank.tier,
                    rank: soloRank.rank,
                    leaguePoints: soloRank.leaguePoints,
                    wins: soloRank.wins,
                    losses: soloRank.losses,
                    winRate: Math.round((soloRank.wins / (soloRank.wins + soloRank.losses)) * 100),
                  } : null,
                  flexRank: flexRank ? {
                    tier: flexRank.tier,
                    rank: flexRank.rank,
                    leaguePoints: flexRank.leaguePoints,
                    wins: flexRank.wins,
                    losses: flexRank.losses,
                    winRate: Math.round((flexRank.wins / (flexRank.wins + flexRank.losses)) * 100),
                  } : null,
                },
              };
            } catch (error) {
              // 一部のプレイヤー情報取得に失敗しても続行
              logger.warn(`Failed to fetch detailed info for player ${participant.summonerName}:`, error);
              return participant;
            }
          })
        );
        
        // チーム別に参加者を分ける
        const blueTeam = enhancedParticipants.filter((p: any) => p.teamId === 100);
        const redTeam = enhancedParticipants.filter((p: any) => p.teamId === 200);
        
        // ゲーム情報を整形
        const formattedLiveGame = {
          gameId: liveGame.gameId,
          gameType: liveGame.gameType,
          gameStartTime: liveGame.gameStartTime,
          mapId: liveGame.mapId,
          gameLength: liveGame.gameLength,
          platformId: liveGame.platformId,
          gameMode: liveGame.gameMode,
          bannedChampions: liveGame.bannedChampions,
          gameQueueConfigId: liveGame.gameQueueConfigId,
          blueTeam,
          redTeam,
        };
        
        return formattedLiveGame;
      } catch (error: any) {
        // ライブゲームが存在しない場合は404エラーが返される
        if (error.response && error.response.status === 404) {
          return null;
        }
        throw error;
      }
    } catch (error: any) {
      logger.error('Error fetching live game:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error fetching live game from Riot API'
      );
    }
  },

  /**
   * サモナーの統計情報を取得
   */
  getSummonerStats: async (region: string, summonerName: string, season: string = 'current', queue: string = 'ranked_solo_5x5') => {
    try {
      // まずサモナーの基本情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${summonerName}`);
      }
      
      // マッチリストを取得（最大100試合）
      const matchIds = await riotApiClient.getMatchIdsByPuuid(region, summonerData.puuid, 100);
      
      // キューIDフィルタリング（season実装は今後のバックエンド拡張時に実装）
      let queueId = 0;
      switch(queue) {
        case 'ranked_solo_5x5':
          queueId = 420;
          break;
        case 'ranked_flex_sr':
          queueId = 440;
          break;
        case 'normal_blind_pick':
          queueId = 430;
          break;
        case 'normal_draft_pick':
          queueId = 400;
          break;
        case 'aram':
          queueId = 450;
          break;
        default:
          queueId = 0; // すべてのキュー
      }
      
      // マッチデータを取得・分析（並列処理で高速化）
      const matchPromises = matchIds.map(async (matchId) => {
        try {
          const match = await riotApiClient.getMatchById(region, matchId);
          // キューフィルタリング
          if (queueId !== 0 && match.info.queueId !== queueId) {
            return null;
          }
          
          // 該当サモナーの参加者情報を抽出
          const participant = match.info.participants.find(
            (p: any) => p.puuid === summonerData.puuid
          );
          
          if (!participant) {
            return null;
          }
          
          return {
            gameId: match.metadata.matchId,
            win: participant.win,
            championId: participant.championId,
            championName: participant.championName,
            kills: participant.kills,
            deaths: participant.deaths,
            assists: participant.assists,
            kda: participant.deaths > 0 
              ? (participant.kills + participant.assists) / participant.deaths 
              : participant.kills + participant.assists,
            damageDealt: participant.totalDamageDealtToChampions,
            damageTaken: participant.totalDamageTaken,
            cs: participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0),
            csPerMin: (participant.totalMinionsKilled + (participant.neutralMinionsKilled || 0)) / (match.info.gameDuration / 60),
            visionScore: participant.visionScore,
            goldEarned: participant.goldEarned,
            lane: participant.lane,
            role: participant.role,
            gameCreation: match.info.gameCreation,
            gameDuration: match.info.gameDuration,
          };
        } catch (error) {
          logger.warn(`Failed to process match ${matchId}:`, error);
          return null;
        }
      });
      
      const matchResults = (await Promise.all(matchPromises)).filter(Boolean);
      
      // 指定キュー分析対象のマッチ数
      const totalGames = matchResults.length;
      
      if (totalGames === 0) {
        return {
          summonerName: summonerData.name,
          totalGames: 0,
          message: 'No matching games found for the specified criteria',
        };
      }
      
      // 統計情報を計算
      const wins = matchResults.filter((match) => match.win).length;
      const losses = totalGames - wins;
      const winRate = (wins / totalGames) * 100;
      
      const totalKills = matchResults.reduce((sum, match) => sum + match.kills, 0);
      const totalDeaths = matchResults.reduce((sum, match) => sum + match.deaths, 0);
      const totalAssists = matchResults.reduce((sum, match) => sum + match.assists, 0);
      
      const avgKills = totalKills / totalGames;
      const avgDeaths = totalDeaths / totalGames;
      const avgAssists = totalAssists / totalGames;
      const avgKda = avgDeaths > 0 ? (avgKills + avgAssists) / avgDeaths : avgKills + avgAssists;
      
      const avgCs = matchResults.reduce((sum, match) => sum + match.cs, 0) / totalGames;
      const avgCsPerMin = matchResults.reduce((sum, match) => sum + match.csPerMin, 0) / totalGames;
      const avgVisionScore = matchResults.reduce((sum, match) => sum + match.visionScore, 0) / totalGames;
      const avgGameDuration = matchResults.reduce((sum, match) => sum + match.gameDuration, 0) / totalGames;
      
      // チャンピオン使用統計
      const championStats = {};
      matchResults.forEach((match) => {
        const championName = match.championName;
        if (!championStats[championName]) {
          championStats[championName] = {
            championId: match.championId,
            championName,
            games: 0,
            wins: 0,
            kills: 0,
            deaths: 0,
            assists: 0,
          };
        }
        
        championStats[championName].games += 1;
        championStats[championName].wins += match.win ? 1 : 0;
        championStats[championName].kills += match.kills;
        championStats[championName].deaths += match.deaths;
        championStats[championName].assists += match.assists;
      });
      
      // チャンピオン統計を配列に変換して計算
      const championsArray = Object.values(championStats).map((champ: any) => ({
        ...champ,
        winRate: (champ.wins / champ.games) * 100,
        kda: champ.deaths > 0 ? (champ.kills + champ.assists) / champ.deaths : champ.kills + champ.assists,
        avgKills: champ.kills / champ.games,
        avgDeaths: champ.deaths / champ.games,
        avgAssists: champ.assists / champ.games,
      }));
      
      // 最も使用したチャンピオン順にソート
      const topChampions = championsArray.sort((a: any, b: any) => b.games - a.games);
      
      // レーン分布
      const laneDistribution = {};
      matchResults.forEach((match) => {
        const lane = match.lane === 'NONE' ? match.role : match.lane;
        if (!laneDistribution[lane]) {
          laneDistribution[lane] = {
            games: 0,
            wins: 0,
          };
        }
        
        laneDistribution[lane].games += 1;
        laneDistribution[lane].wins += match.win ? 1 : 0;
      });
      
      // レーン統計を配列に変換して計算
      const lanesArray = Object.entries(laneDistribution).map(([lane, stats]: [string, any]) => ({
        lane,
        games: stats.games,
        wins: stats.wins,
        losses: stats.games - stats.wins,
        winRate: (stats.wins / stats.games) * 100,
        percentage: (stats.games / totalGames) * 100,
      }));
      
      // 最終的な統計情報
      return {
        summonerName: summonerData.name,
        region,
        queue,
        season,
        totalGames,
        wins,
        losses,
        winRate,
        kda: {
          kills: avgKills,
          deaths: avgDeaths,
          assists: avgAssists,
          ratio: avgKda,
        },
        farming: {
          avgCs,
          avgCsPerMin,
        },
        vision: {
          avgVisionScore,
        },
        avgGameDuration,
        champions: topChampions,
        lanes: lanesArray,
        recentMatches: matchResults.slice(0, 20), // 最新20試合のみ
      };
    } catch (error: any) {
      logger.error('Error fetching summoner stats:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error calculating summoner statistics'
      );
    }
  },

  /**
   * サモナーの成長分析データを取得
   * 注: このメソッドはデータ分析機能の一部でダミー実装です
   */
  getGrowthAnalysis: async (region: string, summonerName: string, period: string = '30days') => {
    try {
      // サモナー基本情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${summonerName}`);
      }
      
      // 実際の実装ではここで過去のマッチ履歴を取得し、期間ごとの成長を分析します
      // 現在はダミーデータを返します
      
      // ダミーデータの例
      const dummyGrowthData = {
        summonerName: summonerData.name,
        region,
        period,
        kda: {
          current: 3.25,
          previous: 2.98,
          change: 9.1, // パーセンテージ変化
          trend: 'increase',
        },
        csPerMin: {
          current: 7.2,
          previous: 6.8,
          change: 5.9,
          trend: 'increase',
        },
        winRate: {
          current: 56.3,
          previous: 52.1,
          change: 4.2,
          trend: 'increase',
        },
        visionScore: {
          current: 23.6,
          previous: 19.2,
          change: 22.9,
          trend: 'increase',
        },
        damagePerMinute: {
          current: 542,
          previous: 489,
          change: 10.8,
          trend: 'increase',
        },
        // 時系列データ（チャート用）
        timeSeriesData: {
          kda: [
            { date: '2025-01-01', value: 2.8 },
            { date: '2025-01-15', value: 3.0 },
            { date: '2025-02-01', value: 2.9 },
            { date: '2025-02-15', value: 3.1 },
            { date: '2025-03-01', value: 3.25 },
          ],
          winRate: [
            { date: '2025-01-01', value: 51.2 },
            { date: '2025-01-15', value: 52.5 },
            { date: '2025-02-01', value: 54.3 },
            { date: '2025-02-15', value: 55.7 },
            { date: '2025-03-01', value: 56.3 },
          ],
          csPerMin: [
            { date: '2025-01-01', value: 6.7 },
            { date: '2025-01-15', value: 6.8 },
            { date: '2025-02-01', value: 7.0 },
            { date: '2025-02-15', value: 7.1 },
            { date: '2025-03-01', value: 7.2 },
          ],
        },
        // 成長スコア（AI生成の成長指標）
        growthScore: 68.5, // 0-100のスケール
        strengthAreas: ['ファーミング', 'ビジョンコントロール'],
        improvementAreas: ['チームファイト参加', 'ローミング'],
        recommendations: [
          'ウェーブ管理を継続して改善し、より高いCSを維持する',
          'ビジョンスコアをさらに向上させるためにコントロールワードの使用を増やす',
          'チームファイトへの参加タイミングを改善し、KDA向上を目指す',
        ],
      };
      
      return dummyGrowthData;
    } catch (error: any) {
      logger.error('Error fetching growth analysis:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Error generating growth analysis'
      );
    }
  },
};
