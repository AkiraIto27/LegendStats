import { getRiotApiClient } from '../utils/riotApi';
import { logger } from '../utils/logger';
import { ApiError } from '../middlewares/errorHandler';
import httpStatus from 'http-status';
import axios from 'axios';

// Riot APIクライアント
const riotApiClient = getRiotApiClient();

/**
 * チャンピオンサービス
 */
export const championService = {
  /**
   * 全チャンピオン情報を取得
   */
  getAllChampions: async (locale: string = 'ja_JP') => {
    try {
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // チャンピオン情報を取得
      const response = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${locale}/champion.json`
      );
      
      const championsData = response.data.data;
      
      // チャンピオン情報を整形
      const champions = Object.values(championsData).map((champion: any) => ({
        id: champion.id,
        key: champion.key,
        name: champion.name,
        title: champion.title,
        blurb: champion.blurb,
        info: champion.info,
        image: {
          full: champion.image.full,
          sprite: champion.image.sprite,
          group: champion.image.group,
          url: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champion.image.full}`,
        },
        tags: champion.tags,
        partype: champion.partype,
        stats: champion.stats,
      }));
      
      return {
        version: latestVersion,
        locale,
        champions,
      };
    } catch (error: any) {
      logger.error('Error fetching all champions:', error);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion data: ${error.message}`
      );
    }
  },

  /**
   * チャンピオンIDから詳細情報を取得
   */
  getChampionById: async (id: string, locale: string = 'ja_JP') => {
    try {
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // チャンピオン詳細情報を取得
      const response = await axios.get(
        `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/${locale}/champion/${id}.json`
      );
      
      if (!response.data.data || !response.data.data[id]) {
        return null;
      }
      
      const championData = response.data.data[id];
      
      // スキン情報を整形
      const skins = championData.skins.map((skin: any) => ({
        id: skin.id,
        num: skin.num,
        name: skin.name,
        chromas: skin.chromas,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${id}_${skin.num}.jpg`,
        loadingUrl: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${id}_${skin.num}.jpg`,
      }));
      
      // スキル情報を整形
      const spells = championData.spells.map((spell: any) => ({
        id: spell.id,
        name: spell.name,
        description: spell.description,
        tooltip: spell.tooltip,
        maxrank: spell.maxrank,
        cooldown: spell.cooldown,
        cost: spell.cost,
        range: spell.range,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${spell.id}.png`,
      }));
      
      // パッシブ情報を整形
      const passive = {
        name: championData.passive.name,
        description: championData.passive.description,
        imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/passive/${championData.passive.image.full}`,
      };
      
      // チャンピオン詳細情報を整形
      const champion = {
        id: championData.id,
        key: championData.key,
        name: championData.name,
        title: championData.title,
        lore: championData.lore,
        allytips: championData.allytips,
        enemytips: championData.enemytips,
        tags: championData.tags,
        partype: championData.partype,
        info: championData.info,
        stats: championData.stats,
        image: {
          full: championData.image.full,
          sprite: championData.image.sprite,
          group: championData.image.group,
          url: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championData.image.full}`,
        },
        skins,
        spells,
        passive,
      };
      
      return {
        version: latestVersion,
        locale,
        champion,
      };
    } catch (error: any) {
      logger.error(`Error fetching champion ${id}:`, error);
      
      // 404エラーの場合はnullを返す
      if (error.response && error.response.status === 404) {
        return null;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion details: ${error.message}`
      );
    }
  },

  /**
   * チャンピオンの統計情報を取得
   * 注: この機能はダミー実装です。実際の実装では、収集したマッチデータから統計情報を集計します
   */
  getChampionStats: async (id: string, tier: string = 'all', region: string = 'all', queue: string = 'ranked_solo_5x5') => {
    try {
      // チャンピオン基本情報を取得
      const champInfo = await this.getChampionById(id);
      
      if (!champInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${id}`);
      }
      
      // ダミーの統計情報
      const dummyStats = {
        championId: id,
        championName: champInfo.champion.name,
        tier,
        region,
        queue,
        overallStats: {
          pickRate: (Math.random() * 10 + 1).toFixed(2),
          banRate: (Math.random() * 15).toFixed(2),
          winRate: (Math.random() * 10 + 45).toFixed(2),
          totalGames: Math.floor(Math.random() * 100000 + 10000),
        },
        roleDistribution: {
          TOP: (Math.random() * 100).toFixed(2),
          JUNGLE: (Math.random() * 100).toFixed(2),
          MIDDLE: (Math.random() * 100).toFixed(2),
          BOTTOM: (Math.random() * 100).toFixed(2),
          SUPPORT: (Math.random() * 100).toFixed(2),
        },
        bestRole: {
          role: ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'][Math.floor(Math.random() * 5)],
          winRate: (Math.random() * 10 + 50).toFixed(2),
          pickRate: (Math.random() * 10 + 5).toFixed(2),
        },
        performance: {
          averageKills: (Math.random() * 5 + 3).toFixed(2),
          averageDeaths: (Math.random() * 3 + 2).toFixed(2),
          averageAssists: (Math.random() * 8 + 5).toFixed(2),
          kda: (Math.random() * 2 + 2).toFixed(2),
          averageGold: Math.floor(Math.random() * 5000 + 10000),
          averageDamage: Math.floor(Math.random() * 10000 + 15000),
          averageCS: (Math.random() * 100 + 150).toFixed(2),
          averageVisionScore: (Math.random() * 20 + 15).toFixed(2),
        },
        trends: {
          winRateTrend: [
            { patch: '14.1', winRate: (Math.random() * 10 + 45).toFixed(2) },
            { patch: '14.2', winRate: (Math.random() * 10 + 45).toFixed(2) },
            { patch: '14.3', winRate: (Math.random() * 10 + 45).toFixed(2) },
            { patch: '14.4', winRate: (Math.random() * 10 + 45).toFixed(2) },
            { patch: '14.5', winRate: (Math.random() * 10 + 45).toFixed(2) },
          ],
          pickRateTrend: [
            { patch: '14.1', pickRate: (Math.random() * 10 + 1).toFixed(2) },
            { patch: '14.2', pickRate: (Math.random() * 10 + 1).toFixed(2) },
            { patch: '14.3', pickRate: (Math.random() * 10 + 1).toFixed(2) },
            { patch: '14.4', pickRate: (Math.random() * 10 + 1).toFixed(2) },
            { patch: '14.5', pickRate: (Math.random() * 10 + 1).toFixed(2) },
          ],
          banRateTrend: [
            { patch: '14.1', banRate: (Math.random() * 15).toFixed(2) },
            { patch: '14.2', banRate: (Math.random() * 15).toFixed(2) },
            { patch: '14.3', banRate: (Math.random() * 15).toFixed(2) },
            { patch: '14.4', banRate: (Math.random() * 15).toFixed(2) },
            { patch: '14.5', banRate: (Math.random() * 15).toFixed(2) },
          ],
        },
      };
      
      return dummyStats;
    } catch (error: any) {
      logger.error(`Error fetching champion stats for ${id}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion statistics: ${error.message}`
      );
    }
  },

  /**
   * チャンピオンの推奨ビルド情報を取得
   * 注: この機能はダミー実装です。実際の実装では、収集したマッチデータから推奨ビルドを集計します
   */
  getChampionBuilds: async (id: string, tier: string = 'all', position: string = 'all') => {
    try {
      // チャンピオン基本情報を取得
      const champInfo = await this.getChampionById(id);
      
      if (!champInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${id}`);
      }
      
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // ダミーのビルド情報
      const dummyBuilds = {
        championId: id,
        championName: champInfo.champion.name,
        tier,
        position,
        startingItems: [
          {
            items: [1055, 2003],
            names: ['ドーランの剣', 'ヘルスポーション'],
            winRate: (Math.random() * 5 + 50).toFixed(2),
            pickRate: (Math.random() * 20 + 30).toFixed(2),
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/1055.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/2003.png`,
            ],
          },
          {
            items: [1056, 2003],
            names: ['ドーランのリング', 'ヘルスポーション'],
            winRate: (Math.random() * 5 + 50).toFixed(2),
            pickRate: (Math.random() * 20 + 10).toFixed(2),
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/1056.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/2003.png`,
            ],
          },
        ],
        coreItems: [
          {
            items: [3142, 3036, 3031],
            names: ['ヨウムウのゴーストブレード', 'ロード・ドミニクの挨拶', 'インフィニティエッジ'],
            winRate: (Math.random() * 5 + 55).toFixed(2),
            pickRate: (Math.random() * 20 + 40).toFixed(2),
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3142.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3036.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3031.png`,
            ],
          },
          {
            items: [3142, 3036, 3072],
            names: ['ヨウムウのゴーストブレード', 'ロード・ドミニクの挨拶', 'ブラッドサースター'],
            winRate: (Math.random() * 5 + 55).toFixed(2),
            pickRate: (Math.random() * 20 + 20).toFixed(2),
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3142.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3036.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3072.png`,
            ],
          },
        ],
        boots: [
          {
            itemId: 3006,
            name: 'バーサーカーグリーヴス',
            winRate: (Math.random() * 5 + 55).toFixed(2),
            pickRate: (Math.random() * 20 + 60).toFixed(2),
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3006.png`,
          },
          {
            itemId: 3047,
            name: 'プレートドブーツ',
            winRate: (Math.random() * 5 + 50).toFixed(2),
            pickRate: (Math.random() * 10 + 20).toFixed(2),
            imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/3047.png`,
          },
        ],
        summonerSpells: [
          {
            spells: ['Flash', 'Ignite'],
            winRate: (Math.random() * 5 + 55).toFixed(2),
            pickRate: (Math.random() * 20 + 60).toFixed(2),
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/SummonerFlash.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/SummonerDot.png`,
            ],
          },
          {
            spells: ['Flash', 'Teleport'],
            winRate: (Math.random() * 5 + 50).toFixed(2),
            pickRate: (Math.random() * 20 + 20).toFixed(2),
            imageUrls: [
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/SummonerFlash.png`,
              `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/SummonerTeleport.png`,
            ],
          },
        ],
        skillOrder: [
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
        ],
        runes: [
          {
            primaryPath: 'Precision',
            primaryRunes: ['Conqueror', 'Triumph', 'Legend: Alacrity', 'Coup de Grace'],
            secondaryPath: 'Domination',
            secondaryRunes: ['Taste of Blood', 'Ravenous Hunter'],
            statRunes: ['Adaptive Force', 'Adaptive Force', 'Armor'],
            winRate: (Math.random() * 5 + 55).toFixed(2),
            pickRate: (Math.random() * 20 + 50).toFixed(2),
          },
          {
            primaryPath: 'Domination',
            primaryRunes: ['Electrocute', 'Taste of Blood', 'Eyeball Collection', 'Relentless Hunter'],
            secondaryPath: 'Precision',
            secondaryRunes: ['Triumph', 'Coup de Grace'],
            statRunes: ['Adaptive Force', 'Adaptive Force', 'Armor'],
            winRate: (Math.random() * 5 + 50).toFixed(2),
            pickRate: (Math.random() * 20 + 30).toFixed(2),
          },
        ],
      };
      
      return dummyBuilds;
    } catch (error: any) {
      logger.error(`Error fetching champion builds for ${id}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion builds: ${error.message}`
      );
    }
  },

  /**
   * チャンピオンのカウンター情報を取得
   * 注: この機能はダミー実装です。実際の実装では、収集したマッチデータからカウンター情報を集計します
   */
  getChampionCounters: async (id: string, tier: string = 'all', position: string = 'all') => {
    try {
      // チャンピオン基本情報を取得
      const champInfo = await this.getChampionById(id);
      
      if (!champInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${id}`);
      }
      
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // 全チャンピオン情報を取得（カウンター候補用）
      const allChampions = await this.getAllChampions();
      const otherChampions = allChampions.champions.filter((c: any) => c.id !== id);
      
      // ランダムにカウンター/カウンターされるチャンピオンを選択
      const getRandomChampions = (count: number, isWeak: boolean) => {
        const shuffled = otherChampions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map((champ: any) => ({
          championId: champ.id,
          championName: champ.name,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`,
          winRate: isWeak 
            ? (Math.random() * 10 + 40).toFixed(2) // チャンピオンが弱いカウンター
            : (Math.random() * 10 + 55).toFixed(2), // チャンピオンが強いカウンター
          games: Math.floor(Math.random() * 5000 + 1000),
          statsDiff: {
            kills: ((Math.random() * 2 - 1) * (isWeak ? -1 : 1)).toFixed(2),
            deaths: ((Math.random() * 2 - 1) * (isWeak ? 1 : -1)).toFixed(2),
            assists: ((Math.random() * 3 - 1.5) * (isWeak ? -1 : 1)).toFixed(2),
            gold: Math.floor((Math.random() * 1000 - 500) * (isWeak ? -1 : 1)),
            cs: Math.floor((Math.random() * 20 - 10) * (isWeak ? -1 : 1)),
          },
          difficulty: Math.floor(Math.random() * 5) + 1, // 1-5のスケール
        }));
      };
      
      // ダミーのカウンター情報
      const dummyCounters = {
        championId: id,
        championName: champInfo.champion.name,
        tier,
        position,
        weakAgainst: getRandomChampions(10, true), // このチャンピオンが弱いマッチアップ
        strongAgainst: getRandomChampions(10, false), // このチャンピオンが強いマッチアップ
        tips: {
          whenFacingAgainst: [
            champInfo.champion.enemytips[0] || 'このチャンピオンのCCを避けてダメージを交換する',
            champInfo.champion.enemytips[1] || 'このチャンピオンのアルティメットのクールダウン中に攻めると有利',
            'このチャンピオンは序盤が弱いため、早期にプレッシャーをかける',
            'このチャンピオンのマナ管理は弱点なので、長期戦を仕掛けるとよい',
          ],
          whenPlayingAs: [
            champInfo.champion.allytips[0] || 'スキルを組み合わせてバーストダメージを最大化する',
            champInfo.champion.allytips[1] || '敵のCCが切れた瞬間を狙って攻撃する',
            'このチャンピオンは集団戦で強いため、チームファイトを優先する',
            'このチャンピオンは分割を得意とするため、サイドレーンでプレッシャーをかける',
          ],
        },
      };
      
      return dummyCounters;
    } catch (error: any) {
      logger.error(`Error fetching champion counters for ${id}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion counters: ${error.message}`
      );
    }
  },

  /**
   * チャンピオンの対面別勝率情報を取得
   * 注: この機能はダミー実装です。実際の実装では、収集したマッチデータから対面勝率を集計します
   */
  getChampionMatchups: async (id: string, tier: string = 'all', position: string = 'all') => {
    try {
      // チャンピオン基本情報を取得
      const champInfo = await this.getChampionById(id);
      
      if (!champInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, `Champion not found: ${id}`);
      }
      
      // 最新のData Dragonバージョンを取得
      const latestVersion = await riotApiClient.getLatestDataDragonVersion();
      
      // 全チャンピオン情報を取得（マッチアップ候補用）
      const allChampions = await this.getAllChampions();
      const otherChampions = allChampions.champions.filter((c: any) => c.id !== id);
      
      // ダミーのマッチアップ情報を生成
      const matchups = otherChampions.map((champ: any) => {
        const winRate = Math.random() * 30 + 35; // 35-65%のランダムな勝率
        return {
          championId: champ.id,
          championName: champ.name,
          imageUrl: `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${champ.image.full}`,
          winRate: winRate.toFixed(2),
          totalGames: Math.floor(Math.random() * 5000 + 500),
          kills: (Math.random() * 5 + 3).toFixed(2),
          deaths: (Math.random() * 3 + 2).toFixed(2),
          assists: (Math.random() * 7 + 4).toFixed(2),
          kda: (Math.random() * 2 + 2).toFixed(2),
          goldDiff: Math.floor((Math.random() * 2000 - 1000)),
          csDiff: Math.floor((Math.random() * 40 - 20)),
          difficulty: winRate < 45 ? 'Hard' : winRate > 55 ? 'Easy' : 'Medium',
        };
      });
      
      // 勝率順にソート
      matchups.sort((a, b) => parseFloat(a.winRate) - parseFloat(b.winRate));
      
      // ダミーのマッチアップ統計情報
      const dummyMatchups = {
        championId: id,
        championName: champInfo.champion.name,
        tier,
        position,
        matchups,
        averageWinRate: (matchups.reduce((sum, m) => sum + parseFloat(m.winRate), 0) / matchups.length).toFixed(2),
        favorableMatchups: matchups.filter(m => parseFloat(m.winRate) > 55).length,
        unfavorableMatchups: matchups.filter(m => parseFloat(m.winRate) < 45).length,
      };
      
      return dummyMatchups;
    } catch (error: any) {
      logger.error(`Error fetching champion matchups for ${id}:`, error);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        `Error fetching champion matchups: ${error.message}`
      );
    }
  },
};
