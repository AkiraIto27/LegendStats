import { getRiotApiClient } from '../../utils/riotApi';
import { championService } from '../champion.service';
import { ApiError } from '../../middlewares/errorHandler';
import httpStatus from 'http-status';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * ビルド関連のサービス
 */
export const buildsService = {
  /**
   * 人気のビルドパスを取得
   * 注: この機能はダミー実装です。実際の実装では、マッチデータから人気のビルドを分析します
   */
  getPopularBuilds: async (championId: string, role: string = 'all', tier: string = 'all') => {
    // チャンピオン情報を取得
    const champInfo = await championService.getChampionById(championId);
    
    if (!champInfo) {
      throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${championId}`);
    }
    
    // チャンピオンビルド情報を取得
    const buildsInfo = await championService.getChampionBuilds(championId, tier, role);
    
    // アイテムビルドパスを追加
    const buildPaths = [
      {
        name: '標準ビルド',
        description: 'もっとも一般的なビルドパス',
        winRate: (Math.random() * 5 + 55).toFixed(2),
        pickRate: (Math.random() * 20 + 40).toFixed(2),
        path: [
          {
            stage: 'Starting',
            items: buildsInfo.startingItems[0].items,
            itemNames: buildsInfo.startingItems[0].names,
            imageUrls: buildsInfo.startingItems[0].imageUrls,
          },
          {
            stage: 'Early',
            items: [buildsInfo.boots[0].itemId, buildsInfo.coreItems[0].items[0]],
            itemNames: [buildsInfo.boots[0].name, buildsInfo.coreItems[0].names[0]],
            imageUrls: [buildsInfo.boots[0].imageUrl, buildsInfo.coreItems[0].imageUrls[0]],
          },
          {
            stage: 'Core',
            items: [buildsInfo.coreItems[0].items[1], buildsInfo.coreItems[0].items[2]],
            itemNames: [buildsInfo.coreItems[0].names[1], buildsInfo.coreItems[0].names[2]],
            imageUrls: [buildsInfo.coreItems[0].imageUrls[1], buildsInfo.coreItems[0].imageUrls[2]],
          },
          {
            stage: 'Late',
            items: [3026, 3033], // ダミーのアイテムID
            itemNames: ['Guardian Angel', 'Mortal Reminder'],
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3026.png`,
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3033.png`,
            ],
          },
        ],
      },
      {
        name: '高火力ビルド',
        description: 'バーストダメージを最大化するビルド',
        winRate: (Math.random() * 5 + 50).toFixed(2),
        pickRate: (Math.random() * 15 + 20).toFixed(2),
        path: [
          {
            stage: 'Starting',
            items: buildsInfo.startingItems[1].items,
            itemNames: buildsInfo.startingItems[1].names,
            imageUrls: buildsInfo.startingItems[1].imageUrls,
          },
          {
            stage: 'Early',
            items: [buildsInfo.boots[1].itemId, buildsInfo.coreItems[1].items[0]],
            itemNames: [buildsInfo.boots[1].name, buildsInfo.coreItems[1].names[0]],
            imageUrls: [buildsInfo.boots[1].imageUrl, buildsInfo.coreItems[1].imageUrls[0]],
          },
          {
            stage: 'Core',
            items: [buildsInfo.coreItems[1].items[1], buildsInfo.coreItems[1].items[2]],
            itemNames: [buildsInfo.coreItems[1].names[1], buildsInfo.coreItems[1].names[2]],
            imageUrls: [buildsInfo.coreItems[1].imageUrls[1], buildsInfo.coreItems[1].imageUrls[2]],
          },
          {
            stage: 'Late',
            items: [3078, 3156], // ダミーのアイテムID
            itemNames: ['Trinity Force', 'Maw of Malmortius'],
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3078.png`,
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3156.png`,
            ],
          },
        ],
      },
      {
        name: '生存特化ビルド',
        description: '耐久力重視のビルド',
        winRate: (Math.random() * 5 + 50).toFixed(2),
        pickRate: (Math.random() * 10 + 10).toFixed(2),
        path: [
          {
            stage: 'Starting',
            items: [1054, 2003], // ダミーのアイテムID
            itemNames: ['Doran\'s Shield', 'Health Potion'],
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/1054.png`,
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/2003.png`,
            ],
          },
          {
            stage: 'Early',
            items: [3047, 3211], // ダミーのアイテムID
            itemNames: ['Plated Steelcaps', 'Spectre\'s Cowl'],
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3047.png`,
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3211.png`,
            ],
          },
          {
            stage: 'Core',
            items: [3075, 3065], // ダミーのアイテムID
            itemNames: ['Thornmail', 'Spirit Visage'],
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3075.png`,
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3065.png`,
            ],
          },
          {
            stage: 'Late',
            items: [3143, 3193], // ダミーのアイテムID
            itemNames: ['Randuin\'s Omen', 'Gargoyle Stoneplate'],
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3143.png`,
              `https://ddragon.leagueoflegends.com/cdn/${champInfo.version}/img/item/3193.png`,
            ],
          },
        ],
      },
    ];
    
    // 各ビルドパスのスキルオーダーを追加
    const skillOrders = buildsInfo.skillOrder || [
      {
        order: ['Q', 'W', 'E', 'Q', 'Q', 'R', 'Q', 'W', 'Q', 'W', 'R', 'W', 'W', 'E', 'E'],
        priority: 'Q > W > E',
        winRate: (Math.random() * 5 + 55).toFixed(2),
        pickRate: (Math.random() * 20 + 60).toFixed(2),
      },
      {
        order: ['Q', 'E', 'W', 'Q', 'Q', 'R', 'Q', 'E', 'Q', 'E', 'R', 'E', 'E', 'W', 'W'],
        priority: 'Q > E > W',
        winRate: (Math.random() * 5 + 50).toFixed(2),
        pickRate: (Math.random() * 20 + 20).toFixed(2),
      },
    ];
    
    return {
      championId,
      championName: champInfo.champion.name,
      role: role.toUpperCase(),
      tier,
      patch: champInfo.version,
      buildPaths,
      skillOrders,
      summonerSpells: buildsInfo.summonerSpells,
      runes: buildsInfo.runes,
      lastUpdated: new Date().toISOString(),
    };
  },
};
