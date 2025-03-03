import { getRiotApiClient } from '../../utils/riotApi';
import { championService } from '../champion.service';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * マッチアップ関連のサービス
 */
export const matchupsService = {
  /**
   * レーン別のマッチアップ情報を取得
   * 注: この機能はダミー実装です。実際の実装では、マッチデータからレーン別の対面勝率を分析します
   */
  getLaneMatchups: async (role: string, tier: string = 'all') => {
    // 全チャンピオン情報を取得
    const allChampionsData = await championService.getAllChampions();
    const allChampions = allChampionsData.champions;
    
    // 最新のData Dragonバージョンを取得
    const latestVersion = await riotApiClient.getLatestDataDragonVersion();
    
    // レーンに適したチャンピオンをフィルタリング（ダミー）
    const laneChampions = allChampions
      .sort(() => 0.5 - Math.random())
      .slice(0, 30); // 上位30チャンピオン
    
    // マッチアップデータを生成（各チャンピオンvs他のチャンピオン）
    const matchups = [];
    
    for (let i = 0; i < laneChampions.length; i++) {
      const champion = laneChampions[i];
      const championMatchups = [];
      
      for (let j = 0; j < laneChampions.length; j++) {
        if (i === j) continue; // 自分自身とのマッチアップはスキップ
        
        const opponent = laneChampions[j];
        const winRate = Math.random() * 30 + 35; // 35-65%のランダムな勝率
        
        championMatchups.push({
          championId: opponent.id,
          championName: opponent.name,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${opponent.image.full}`,
          winRate: winRate.toFixed(2),
          difficulty: winRate < 45 ? 'Hard' : winRate > 55 ? 'Easy' : 'Medium',
          statsDiff: {
            csAt15: ((Math.random() * 20 - 10) * (winRate > 50 ? 1 : -1)).toFixed(1),
            goldAt15: Math.floor((Math.random() * 1000 - 500) * (winRate > 50 ? 1 : -1)),
            killsAt15: ((Math.random() * 2 - 1) * (winRate > 50 ? 1 : -1)).toFixed(1),
            winRateDiff: ((winRate - 50) * 2).toFixed(1),
          },
          games: Math.floor(Math.random() * 5000 + 500),
        });
      }
      
      // 勝率順にソート
      championMatchups.sort((a, b) => parseFloat(a.winRate) - parseFloat(b.winRate));
      
      matchups.push({
        championId: champion.id,
        championName: champion.name,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
        role: role.toUpperCase(),
        tier: tier.toUpperCase(),
        overallWinRate: (Math.random() * 10 + 45).toFixed(2),
        pickRate: (Math.random() * 15 + 1).toFixed(2),
        matchups: championMatchups,
        favorableCount: championMatchups.filter(m => parseFloat(m.winRate) > 55).length,
        unfavorableCount: championMatchups.filter(m => parseFloat(m.winRate) < 45).length,
      });
    }
    
    // ランキング順に並べ替え（強いチャンピオン順）
    matchups.sort((a, b) => {
      const aRating = parseFloat(a.overallWinRate) * 0.7 + (a.favorableCount - a.unfavorableCount) * 0.3;
      const bRating = parseFloat(b.overallWinRate) * 0.7 + (b.favorableCount - b.unfavorableCount) * 0.3;
      return bRating - aRating;
    });
    
    return {
      role: role.toUpperCase(),
      tier: tier.toUpperCase(),
      patch: latestVersion,
      matchups,
      lastUpdated: new Date().toISOString(),
    };
  },
};
