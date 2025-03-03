import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from './logger';

// リージョン設定
interface RegionConfig {
  api: string;  // API ホスト
  routing: string;  // リージョンルーティング値
}

// リージョンマッピング
const REGIONS: Record<string, RegionConfig> = {
  BR: { api: 'br1.api.riotgames.com', routing: 'americas' },
  EUNE: { api: 'eun1.api.riotgames.com', routing: 'europe' },
  EUW: { api: 'euw1.api.riotgames.com', routing: 'europe' },
  JP: { api: 'jp1.api.riotgames.com', routing: 'asia' },
  KR: { api: 'kr.api.riotgames.com', routing: 'asia' },
  LAN: { api: 'la1.api.riotgames.com', routing: 'americas' },
  LAS: { api: 'la2.api.riotgames.com', routing: 'americas' },
  NA: { api: 'na1.api.riotgames.com', routing: 'americas' },
  OCE: { api: 'oc1.api.riotgames.com', routing: 'sea' },
  TR: { api: 'tr1.api.riotgames.com', routing: 'europe' },
  RU: { api: 'ru.api.riotgames.com', routing: 'europe' },
};

/**
 * Riot API クライアントクラス
 */
export class RiotApiClient {
  private apiKey: string;
  private client: AxiosInstance;
  private rateLimitDelay: number; // ミリ秒単位のレート制限遅延

  constructor() {
    this.apiKey = process.env.RIOT_API_KEY || '';
    if (!this.apiKey) {
      logger.error('RIOT_API_KEY is not set');
      throw new Error('RIOT_API_KEY environment variable is required');
    }

    this.client = axios.create({
      timeout: 10000, // 10秒のタイムアウト
      headers: {
        'X-Riot-Token': this.apiKey,
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
      },
    });

    // レート制限の設定（開発用キーでの制限を考慮）
    // 20 requests every 1 seconds
    // 100 requests every 2 minutes
    this.rateLimitDelay = 100; // リクエスト間の最小間隔（ミリ秒）
  }

  /**
   * リージョン固有のAPIエンドポイントURLを取得
   */
  private getRegionalApiUrl(region: string, endpoint: string): string {
    if (!REGIONS[region.toUpperCase()]) {
      throw new Error(`Invalid region: ${region}`);
    }
    return `https://${REGIONS[region.toUpperCase()].api}${endpoint}`;
  }

  /**
   * ルーティングリージョンのAPIエンドポイントURLを取得
   */
  private getRoutingApiUrl(region: string, endpoint: string): string {
    if (!REGIONS[region.toUpperCase()]) {
      throw new Error(`Invalid region: ${region}`);
    }
    return `https://${REGIONS[region.toUpperCase()].routing}.api.riotgames.com${endpoint}`;
  }

  /**
   * レート制限を考慮したスリープ関数
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Riot APIへのGETリクエスト
   */
  async get<T>(url: string): Promise<T> {
    try {
      // レート制限のためのスリープ
      await this.sleep(this.rateLimitDelay);

      const response: AxiosResponse<T> = await this.client.get(url);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        // レート制限に達した場合（429エラー）
        if (status === 429) {
          const retryAfter = parseInt(error.response.headers['retry-after'] || '1', 10);
          logger.warn(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
          await this.sleep(retryAfter * 1000);
          return this.get<T>(url);
        }

        logger.error(`Riot API Error [${status}]:`, { url, data });
        throw error;
      }

      logger.error('Riot API Request Failed:', error.message);
      throw error;
    }
  }

  /**
   * サモナー名からサモナー情報を取得
   */
  async getSummonerByName(region: string, summonerName: string): Promise<any> {
    const encodedName = encodeURIComponent(summonerName);
    const url = this.getRegionalApiUrl(region, `/lol/summoner/v4/summoners/by-name/${encodedName}`);
    return this.get<any>(url);
  }

  /**
   * PUUIDからマッチIDリストを取得
   */
  async getMatchIdsByPuuid(region: string, puuid: string, count: number = 20): Promise<string[]> {
    const url = this.getRoutingApiUrl(
      region,
      `/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
    );
    return this.get<string[]>(url);
  }

  /**
   * マッチIDからマッチ詳細を取得
   */
  async getMatchById(region: string, matchId: string): Promise<any> {
    const url = this.getRoutingApiUrl(region, `/lol/match/v5/matches/${matchId}`);
    return this.get<any>(url);
  }

  /**
   * マッチIDからマッチタイムラインを取得
   */
  async getMatchTimelineById(region: string, matchId: string): Promise<any> {
    const url = this.getRoutingApiUrl(region, `/lol/match/v5/matches/${matchId}/timeline`);
    return this.get<any>(url);
  }

  /**
   * サモナーIDからリーグエントリー（ランク情報）を取得
   */
  async getLeagueEntriesBySummonerId(region: string, summonerId: string): Promise<any[]> {
    const url = this.getRegionalApiUrl(
      region,
      `/lol/league/v4/entries/by-summoner/${summonerId}`
    );
    return this.get<any[]>(url);
  }

  /**
   * サモナーIDからチャンピオンマスタリーを取得
   */
  async getChampionMasteries(region: string, summonerId: string): Promise<any[]> {
    const url = this.getRegionalApiUrl(
      region,
      `/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`
    );
    return this.get<any[]>(url);
  }

  /**
   * サモナーIDからアクティブゲーム情報を取得
   */
  async getActiveGameBySummonerId(region: string, summonerId: string): Promise<any> {
    const url = this.getRegionalApiUrl(
      region,
      `/lol/spectator/v5/active-games/by-summoner/${summonerId}`
    );
    return this.get<any>(url);
  }

  /**
   * Data Dragonから最新バージョンを取得
   */
  async getLatestDataDragonVersion(): Promise<string> {
    const url = 'https://ddragon.leagueoflegends.com/api/versions.json';
    const versions = await axios.get<string[]>(url);
    return versions.data[0]; // 最新バージョンを返す
  }
}

// クライアントのシングルトンインスタンス
let riotApiClientInstance: RiotApiClient | null = null;

/**
 * Riot API クライアントのシングルトンインスタンスを取得
 */
export const getRiotApiClient = (): RiotApiClient => {
  if (!riotApiClientInstance) {
    riotApiClientInstance = new RiotApiClient();
  }
  return riotApiClientInstance;
};
