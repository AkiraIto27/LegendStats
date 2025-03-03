import { getRiotApiClient } from '../../utils/riotApi';
import { championService } from '../champion.service';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * メタトレンド関連のサービス
 */
export const metaTrendsService = {
  /**
   * パッチ間のメタ変化トレンドを取得
   * 注: この機能はダミー実装です。実際の実装では、パッチごとに収集したデータから変化を分析します
   */
  getMetaTrends: async (patches: number = 3, role: string = 'all') => {
    // 全チャンピオン情報を取得
    const allChampionsData = await championService.getAllChampions();
    const allChampions = allChampionsData.champions;
    
    // 最新のData Dragonバージョンから過去のパッチバージョンを推測
    const latestVersion = await riotApiClient.getLatestDataDragonVersion();
    const versionParts = latestVersion.split('.');
    const majorVersion = parseInt(versionParts[0]);
    const minorVersion = parseInt(versionParts[1]);
    
    // 過去のパッチバージョンを生成
    const previousPatches = [];
    for (let i = 0; i < patches; i++) {
      let patchMinor = minorVersion - i;
      let patchMajor = majorVersion;
      
      if (patchMinor <= 0) {
        patchMinor = 12 + patchMinor; // 13から前年の12に戻る
        patchMajor -= 1;
      }
      
      previousPatches.push(`${patchMajor}.${patchMinor}`);
    }
    
    // ランダムに一部のチャンピオンを選択（変化が顕著なチャンピオン）
    const significantChampions = allChampions
      .sort(() => 0.5 - Math.random())
      .slice(0, 20);
    
    // 役割に応じたメタトレンドデータを生成
    const generateRoleTrends = (roleName: string) => {
      const championTrends = significantChampions.map(champ => {
        // パッチごとの統計データを生成
        const patchData = previousPatches.map((patch, index) => {
          // 最新パッチに近いほど変化が大きくなるようにベースを設定
          const basePick = Math.random() * 10 + 1;
          const baseWin = Math.random() * 10 + 45;
          const baseBan = Math.random() * 5 + 1;
          
          // パッチ間で変動させる
          const variance = Math.random() * 10 - 5; // -5〜+5の変動
          
          return {
            patch,
            pickRate: (basePick + (variance / 2) * (index / patches)).toFixed(2),
            winRate: (baseWin + variance * (index / patches)).toFixed(2),
            banRate: (baseBan + (variance / 3) * (index / patches)).toFixed(2),
            tier: ['S+', 'S', 'A', 'B', 'C', 'D'][Math.floor(Math.random() * 6)],
            change: index === 0 ? 'none' : 
              variance > 2 ? 'buff' : 
              variance < -2 ? 'nerf' : 'none',
          };
        });
        
        return {
          id: champ.id,
          name: champ.name,
          role: roleName,
          patchData,
        };
      });
      
      return championTrends;
    };
    
    let trends = [];
    
    if (role === 'all') {
      // すべての役割のメタトレンドを生成
      const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      roles.forEach(r => {
        trends = [...trends, ...generateRoleTrends(r)];
      });
    } else {
      // 特定の役割のメタトレンドのみ生成
      trends = generateRoleTrends(role.toUpperCase());
    }
    
    // メタの概要（各パッチでの重要な変化）
    const metaSummary = previousPatches.map((patch, index) => ({
      patch,
      summary: `パッチ ${patch} では${index === 0 ? '最新の' : ''}メタが大きく変動し、${['タンク', 'ファイター', 'アサシン', 'メイジ', 'マークスマン'][Math.floor(Math.random() * 5)]}系チャンピオンの台頭が見られました。`,
      topPicks: allChampions
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(c => c.name),
      topBans: allChampions
        .sort(() => 0.5 - Math.random())
        .slice(0, 5)
        .map(c => c.name),
      majorChanges: index === 0 ? [
        'アイテムシステムの一部変更',
        'ドラゴンバフの効果調整',
        'いくつかのチャンピオンのスキル調整'
      ] : [
        'バランス調整',
        'マイナーバグ修正',
        'UI改善'
      ],
    }));
    
    return {
      patches: previousPatches,
      role: role.toUpperCase(),
      trends,
      metaSummary,
      lastUpdated: new Date().toISOString(),
    };
  },
};
