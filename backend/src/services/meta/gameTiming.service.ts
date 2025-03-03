import { getRiotApiClient } from '../../utils/riotApi';
import { championService } from '../champion.service';
import { ApiError } from '../../middlewares/errorHandler';
import httpStatus from 'http-status';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * ゲームタイミング関連のサービス
 */
export const gameTimingService = {
  /**
   * ゲーム時間ごとのチャンピオン勝率を取得
   * 注: この機能はダミー実装です。実際の実装では、マッチデータからゲーム時間別の勝率を分析します
   */
  getWinRateByGameLength: async (championId: string, role: string = 'all', tier: string = 'all') => {
    // チャンピオン情報を取得
    const champInfo = await championService.getChampionById(championId);
    
    if (!champInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${championId}`);
    }
    
    // 最新のData Dragonバージョンを取得
    const latestVersion = await riotApiClient.getLatestDataDragonVersion();
    
    // チャンピオンのスケーリングタイプをランダムに決定
    // 1: アーリーゲーム型, 2: ミッドゲーム型, 3: レイトゲーム型
    const championScalingType = Math.floor(Math.random() * 3) + 1;
    
    // ゲーム時間分布を生成
    const timeIntervals = [
      '0-15min', '15-20min', '20-25min', '25-30min', '30-35min', '35-40min', '40min+'
    ];
    
    const generateWinRates = () => {
      // チャンピオンタイプに応じた勝率カーブを生成
      const baseWinRate = Math.random() * 10 + 45; // 45-55%のベース勝率
      
      return timeIntervals.map((interval, index) => {
        let adjustedWinRate;
        
        switch(championScalingType) {
          case 1: // アーリーゲーム型
            adjustedWinRate = baseWinRate + (3 - index) * 2;
            break;
          case 2: // ミッドゲーム型
            adjustedWinRate = baseWinRate + (index <= 3 ? index : (6 - index)) * 2;
            break;
          case 3: // レイトゲーム型
            adjustedWinRate = baseWinRate + (index - 3) * 2;
            break;
          default:
            adjustedWinRate = baseWinRate;
        }
        
        // 少しランダム性を加える
        adjustedWinRate += (Math.random() * 2 - 1);
        
        // 値を0-100の範囲に収める
        adjustedWinRate = Math.max(30, Math.min(70, adjustedWinRate));
        
        return {
          timeInterval: interval,
          winRate: adjustedWinRate.toFixed(2),
          games: Math.floor(Math.random() * 10000 + 5000),
        };
      });
    };
    
    // 役割別の勝率を生成
    let winRateData = {};
    
    if (role === 'all') {
      // 全役割の勝率を生成
      const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      roles.forEach(r => {
        winRateData[r] = generateWinRates();
      });
    } else {
      // 特定の役割の勝率のみ生成
      winRateData[role.toUpperCase()] = generateWinRates();
    }
    
    // ゲーム時間帯ごとの平均統計を生成
    const timeStats = timeIntervals.map((interval, index) => {
      // チャンピオンタイプに応じた統計傾向を生成
      const earlyGameFocus = championScalingType === 1;
      const midGameFocus = championScalingType === 2;
      const lateGameFocus = championScalingType === 3;
      
      const baseKills = 2 + index * 0.5;
      const baseDeaths = 2 + index * 0.3;
      const baseAssists = 3 + index * 0.8;
      
      return {
        timeInterval: interval,
        avgKills: (baseKills * (earlyGameFocus && index < 3 ? 1.3 : 1)).toFixed(2),
        avgDeaths: (baseDeaths * (lateGameFocus && index < 3 ? 1.3 : 1)).toFixed(2),
        avgAssists: (baseAssists * (midGameFocus && index >= 2 && index <= 4 ? 1.3 : 1)).toFixed(2),
        avgCS: Math.floor(50 + index * 30),
        avgGold: Math.floor(2000 + index * 1800),
        avgDamage: Math.floor(3000 + index * 2500),
      };
    });
    
    // チャンピオンの強さの説明（ゲーム時間帯別）
    let strengthDescription;
    switch(championScalingType) {
      case 1:
        strengthDescription = `${champInfo.champion.name}は序盤が特に強く、初期のスキル火力とレーン支配力に優れています。試合時間が経過するにつれて相対的な強さが低下するため、アーリーゲームでのアドバンテージを活かすことが重要です。`;
        break;
      case 2:
        strengthDescription = `${champInfo.champion.name}はミッドゲームでの集団戦とオブジェクト争奪が最も得意です。序盤をうまく乗り切り、中盤で強みを発揮することが勝利への鍵です。`;
        break;
      case 3:
        strengthDescription = `${champInfo.champion.name}はレイトゲームでの強さに特化しており、時間経過とともに戦闘力が増していきます。序盤は比較的弱いため、焦らずにアイテムを揃えて後半の戦いに備えましょう。`;
        break;
      default:
        strengthDescription = `${champInfo.champion.name}はゲーム全体を通して安定したパフォーマンスを発揮します。`;
    }
    
    return {
      championId,
      championName: champInfo.champion.name,
      role: role.toUpperCase(),
      tier,
      patch: latestVersion,
      scaleType: championScalingType === 1 ? 'Early' : championScalingType === 2 ? 'Mid' : 'Late',
      strengthDescription,
      winRateByTime: winRateData,
      timeStats,
      lastUpdated: new Date().toISOString(),
    };
  },
};
