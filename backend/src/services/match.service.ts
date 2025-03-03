import { getRiotApiClient } from '../utils/riotApi';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import httpStatus from 'http-status';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * マッチサービス
 */
export const matchService = {
  /**
   * マッチIDから試合情報を取得
   */
  getMatchById: async (region: string, matchId: string) => {
    try {
      const match = await riotApiClient.getMatchById(region, matchId);
      return match;
    } catch (error: any) {
      logger.error(`Error fetching match ${matchId}:`, error);
      
      // 404エラーの場合はnullを返す
      if (error.response && error.response.status === 404) {
        return null;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching match data from Riot API: ${error.message}`
      );
    }
  },

  /**
   * マッチIDから試合タイムライン情報を取得
   */
  getMatchTimeline: async (region: string, matchId: string) => {
    try {
      const timeline = await riotApiClient.getMatchTimelineById(region, matchId);
      return timeline;
    } catch (error: any) {
      logger.error(`Error fetching match timeline ${matchId}:`, error);
      
      // 404エラーの場合はnullを返す
      if (error.response && error.response.status === 404) {
        return null;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching match timeline from Riot API: ${error.message}`
      );
    }
  },

  /**
   * AIによるマッチ分析を実行
   * 注: この機能はAI分析モデルを統合する拡張機能です。現在はダミー実装となっています。
   */
  analyzeMatch: async (region: string, matchId: string, summonerName: string) => {
    try {
      // マッチ情報を取得
      const match = await riotApiClient.getMatchById(region, matchId);
      
      if (!match) {
        throw new ApiError(httpStatus.NOT_FOUND, `Match not found: ${matchId}`);
      }
      
      // マッチタイムラインを取得
      const timeline = await riotApiClient.getMatchTimelineById(region, matchId);
      
      if (!timeline) {
        throw new ApiError(httpStatus.NOT_FOUND, `Match timeline not found: ${matchId}`);
      }
      
      // サモナー情報を取得
      const summonerData = await riotApiClient.getSummonerByName(region, summonerName);
      
      if (!summonerData) {
        throw new ApiError(httpStatus.NOT_FOUND, `Summoner not found: ${summonerName}`);
      }
      
      // 該当プレイヤーの参加者情報を特定
      const participant = match.info.participants.find(
        (p: any) => p.puuid === summonerData.puuid
      );
      
      if (!participant) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Summoner ${summonerName} did not participate in match ${matchId}`
        );
      }
      
      // タイムラインフレームからプレイヤーの行動を分析
      // 実際の実装では、ここでタイムラインデータから様々な指標を計算します
      
      // ダミーの分析結果
      const dummyAnalysis = {
        matchId,
        summonerName,
        gameResult: participant.win ? 'Victory' : 'Defeat',
        gameDuration: match.info.gameDuration,
        champion: participant.championName,
        role: participant.role,
        lane: participant.lane,
        overallPerformance: {
          score: Math.round(Math.random() * 40) + 60, // 60-100のスコア
          grade: ['S+', 'S', 'S-', 'A+', 'A', 'A-', 'B+'][Math.floor(Math.random() * 7)],
          comparison: 'このチャンピオンでの平均より15%上回るパフォーマンス',
        },
        strengths: [
          {
            category: 'ファーミング',
            details: `CSは分あたり${participant.totalMinionsKilled / (match.info.gameDuration / 60)}/分で、同ランク帯の平均より高い値です`,
            score: Math.round(Math.random() * 20) + 80,
          },
          {
            category: 'ビジョンコントロール',
            details: `ビジョンスコア${participant.visionScore}は同ランク帯の平均より高く、マップ認識が優れています`,
            score: Math.round(Math.random() * 20) + 80,
          },
        ],
        weaknesses: [
          {
            category: 'チームファイト',
            details: 'チームファイトでの位置取りに改善の余地があります',
            score: Math.round(Math.random() * 20) + 50,
          },
          {
            category: 'ローミング',
            details: '他レーンへのサポートやオブジェクト争奪への参加が少ない傾向にあります',
            score: Math.round(Math.random() * 20) + 50,
          },
        ],
        keyEvents: [
          {
            time: '05:30',
            description: 'ファーストブラッドを獲得',
            impact: 'Positive',
          },
          {
            time: '12:45',
            description: 'ミッドレーンの一次タワーを破壊',
            impact: 'Positive',
          },
          {
            time: '18:20',
            description: '不利なポジションで捕捉される',
            impact: 'Negative',
          },
          {
            time: '25:10',
            description: 'バロンエリアでのチームファイトで優位を取る',
            impact: 'Positive',
          },
        ],
        recommendations: [
          'レーンフェーズでの優位を活かして他レーンへのローミングを増やすと良いでしょう',
          'ビジョン設置が優れているので、そのアドバンテージを活かしてオブジェクト争奪への参加を増やすと効果的です',
          'チームファイトでは後衛への安全な攻撃ルートを探るよう意識すると良いでしょう',
        ],
        comparativeStats: {
          damageShare: {
            value: Math.round(participant.totalDamageDealtToChampions / match.info.participants.reduce((sum: number, p: any) => sum + p.totalDamageDealtToChampions, 0) * 100),
            average: Math.round(Math.random() * 10) + 15,
            evaluation: 'Above Average',
          },
          killParticipation: {
            value: Math.round((participant.kills + participant.assists) / match.info.teams.find((t: any) => t.teamId === participant.teamId).objectives.champion.kills * 100),
            average: Math.round(Math.random() * 10) + 55,
            evaluation: 'Average',
          },
          goldShare: {
            value: Math.round(participant.goldEarned / match.info.participants.filter((p: any) => p.teamId === participant.teamId).reduce((sum: number, p: any) => sum + p.goldEarned, 0) * 100),
            average: Math.round(Math.random() * 5) + 20,
            evaluation: 'Above Average',
          },
        },
      };
      
      return dummyAnalysis;
    } catch (error: any) {
      logger.error(`Error analyzing match ${matchId}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error analyzing match: ${error.message}`
      );
    }
  },

  /**
   * チャンピオン構成から勝敗予測を実行
   * 注: この機能は機械学習モデルを統合する拡張機能です。現在はダミー実装となっています。
   */
  predictMatchOutcome: async (blueTeam: string[], redTeam: string[]) => {
    try {
      // 実際の実装では、ここでチャンピオン相性データやプレイヤー統計から勝敗予測を計算します
      
      // 各チームのチャンピオン名を正規化・検証
      const normalizedBlueTeam = blueTeam.map(champ => {
        // APIから正確なチャンピオン名を取得する処理をここに実装
        return typeof champ === 'string' ? champ : String(champ);
      });
      
      const normalizedRedTeam = redTeam.map(champ => {
        // APIから正確なチャンピオン名を取得する処理をここに実装
        return typeof champ === 'string' ? champ : String(champ);
      });
      
      // ダミーの予測結果
      const dummyPrediction = {
        blueTeam: {
          champions: normalizedBlueTeam,
          winProbability: 53.7, // パーセンテージ
          strengths: [
            'ポーク能力が高い',
            'レイトゲームでスケールする',
            'オブジェクトコントロールが強い',
          ],
          weaknesses: [
            'アーリーゲームが弱い',
            'CC量が少ない',
          ],
        },
        redTeam: {
          champions: normalizedRedTeam,
          winProbability: 46.3, // パーセンテージ
          strengths: [
            'エンゲージ能力が高い',
            'アーリーゲームのプレッシャーが強い',
            'ピック能力が高い',
          ],
          weaknesses: [
            'レイトゲームでのスケールが弱い',
            'ポークに弱い',
          ],
        },
        keyMatchups: [
          {
            lane: 'TOP',
            blueChampion: normalizedBlueTeam[0],
            redChampion: normalizedRedTeam[0],
            advantage: 'blue', // blue, red, or even
            winRate: 54.2, // ブルーチャンプの勝率
            comment: 'ブルーチームのトップレーナーが対面で有利',
          },
          {
            lane: 'JUNGLE',
            blueChampion: normalizedBlueTeam[1],
            redChampion: normalizedRedTeam[1],
            advantage: 'even',
            winRate: 49.8,
            comment: 'ジャングルは互角の対決',
          },
          {
            lane: 'MID',
            blueChampion: normalizedBlueTeam[2],
            redChampion: normalizedRedTeam[2],
            advantage: 'red',
            winRate: 47.5,
            comment: 'レッドチームのミッドレーナーが対面で有利',
          },
          {
            lane: 'BOT',
            blueChampion: normalizedBlueTeam[3],
            redChampion: normalizedRedTeam[3],
            advantage: 'blue',
            winRate: 52.8,
            comment: 'ブルーチームのADCが対面で有利',
          },
          {
            lane: 'SUPPORT',
            blueChampion: normalizedBlueTeam[4],
            redChampion: normalizedRedTeam[4],
            advantage: 'red',
            winRate: 48.2,
            comment: 'レッドチームのサポートが対面で有利',
          },
        ],
        teamComp: {
          blue: {
            damage: {
              physical: 65,
              magical: 30,
              true: 5,
            },
            cc: 6.5, // CCポイント
            tankiness: 7.2, // タフネス指標
            mobility: 6.8, // 機動性指標
            waveClear: 8.1, // ウェーブクリア指標
            scaling: 8.5, // スケーリング指標
          },
          red: {
            damage: {
              physical: 55,
              magical: 40,
              true: 5,
            },
            cc: 7.8,
            tankiness: 6.5,
            mobility: 7.2,
            waveClear: 7.4,
            scaling: 7.2,
          },
        },
        gamePhases: {
          early: {
            advantage: 'red',
            comment: 'レッドチームはアーリーゲームでプレッシャーをかけられる',
          },
          mid: {
            advantage: 'even',
            comment: 'ミッドゲームは両チーム互角',
          },
          late: {
            advantage: 'blue',
            comment: 'ブルーチームはレイトゲームでスケールして優位に立つ',
          },
        },
        winConditions: {
          blue: [
            'ブルーチームはレイトゲームまで耐えること',
            'ポーク能力を活かして消耗戦に持ち込むこと',
            'オブジェクトコントロールを優先すること',
          ],
          red: [
            'レッドチームはアーリーゲームでリードを築くこと',
            'エンゲージ能力を活かしてピックを狙うこと',
            'ミッドレーンのアドバンテージを他レーンに波及させること',
          ],
        },
      };
      
      return dummyPrediction;
    } catch (error: any) {
      logger.error('Error predicting match outcome:', error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error predicting match outcome: ${error.message}`
      );
    }
  },
};
