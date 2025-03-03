import { getRiotApiClient } from '../../utils/riotApi';
import { championService } from '../champion.service';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * チャンピオンティアリスト関連のサービス
 */
export const tierListService = {
  /**
   * 現在のチャンピオンティアリストを取得
   * 注: この機能はダミー実装です。実際の実装では、収集したマッチデータからより詳細なティア分析を行います
   */
  getChampionTierList: async (tier: string = 'all', role: string = 'all', region: string = 'all') => {
    // 全チャンピオン情報を取得
    const allChampionsData = await championService.getAllChampions();
    const allChampions = allChampionsData.champions;
    
    // 最新のData Dragonバージョンを取得
    const latestVersion = await riotApiClient.getLatestDataDragonVersion();
    
    // ティアを生成
    const generateTierList = (champions: any[], roleName: string) => {
      // ランダムに順序を入れ替え
      const shuffled = [...champions].sort(() => 0.5 - Math.random());
      
      // ティア分け
      const tierSPlus = shuffled.slice(0, 5); // 5チャンピオン
      const tierS = shuffled.slice(5, 15); // 10チャンピオン
      const tierA = shuffled.slice(15, 35); // 20チャンピオン
      const tierB = shuffled.slice(35, 65); // 30チャンピオン
      const tierC = shuffled.slice(65, 95); // 30チャンピオン
      const tierD = shuffled.slice(95); // 残り
      
      // チャンピオンデータを整形する関数
      const formatChampionData = (champ: any, tierRank: string) => ({
        id: champ.id,
        name: champ.name,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`,
        tier: tierRank,
        winRate: (Math.random() * 10 + 50).toFixed(2),
        pickRate: (Math.random() * 15 + 1).toFixed(2),
        banRate: (Math.random() * 10 + 1).toFixed(2),
        kda: (Math.random() * 2 + 2).toFixed(2),
        games: Math.floor(Math.random() * 100000 + 10000),
        role: roleName,
      });
      
      // 各ティアのチャンピオンデータを整形
      return {
        [roleName]: {
          S_PLUS: tierSPlus.map(champ => formatChampionData(champ, 'S+')),
          S: tierS.map(champ => formatChampionData(champ, 'S')),
          A: tierA.map(champ => formatChampionData(champ, 'A')),
          B: tierB.map(champ => formatChampionData(champ, 'B')),
          C: tierC.map(champ => formatChampionData(champ, 'C')),
          D: tierD.map(champ => formatChampionData(champ, 'D')),
        },
      };
    };
    
    // 役割に応じたティアリストを生成
    let tierLists = {};
    
    if (role === 'all') {
      // すべての役割のティアリストを生成
      const roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];
      roles.forEach(r => {
        tierLists = { ...tierLists, ...generateTierList(allChampions, r) };
      });
    } else {
      // 特定の役割のティアリストのみ生成
      tierLists = generateTierList(allChampions, role.toUpperCase());
    }
    
    return {
      patch: latestVersion,
      tier,
      region,
      tierLists,
      lastUpdated: new Date().toISOString(),
    };
  },
};
