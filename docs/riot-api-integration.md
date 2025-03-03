# Riot API 連携ガイド

## APIキーの取得と管理

1. **開発者ポータルでのAPIキー取得**:
   - [Riot Developer Portal](https://developer.riotgames.com/) にRiotアカウントでログイン
   - 「Register Product」からAPIキーを取得

2. **APIキーの種類**:
   - **開発者キー**: 24時間有効、開発・テスト用
   - **プロダクションキー**: 長期利用可、レートリミット緩和、審査が必要

3. **キーの安全な管理**:
   - 環境変数で管理（`.env`ファイル、サーバー環境変数など）
   - リポジトリにはキーを含めない（`.gitignore`に追加）
   - バックエンドでのみ使用し、フロントエンドには露出させない

## 主要APIエンドポイントとその使用法

### 1. Summoner-V4

**目的**: サモナー（プレイヤー）の基本情報を取得

**主要エンドポイント**:
```
GET /lol/summoner/v4/summoners/by-name/{summonerName}
```

**応答例**:
```json
{
  "id": "abcd1234-1234-1234-1234-abcd1234",
  "accountId": "abcd1234-1234-1234-1234-abcd1234",
  "puuid": "abcd1234-1234-1234-1234-abcd1234abcd1234abcd1234abcd1234",
  "name": "プレイヤー名",
  "profileIconId": 1234,
  "revisionDate": 1581234567000,
  "summonerLevel": 100
}
```

**使用例**:
```javascript
// Node.js での実装例
async function getSummonerByName(region, summonerName) {
  const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`;
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": process.env.RIOT_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}
```

### 2. Match-V5

**目的**: マッチ履歴と詳細情報を取得

**主要エンドポイント**:
```
GET /lol/match/v5/matches/by-puuid/{puuid}/ids
GET /lol/match/v5/matches/{matchId}
GET /lol/match/v5/matches/{matchId}/timeline
```

**使用例**:
```javascript
// puuid からマッチIDリストを取得
async function getMatchIdsByPuuid(region, puuid, count = 20) {
  const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`;
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": process.env.RIOT_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// マッチIDから詳細情報を取得
async function getMatchById(region, matchId) {
  const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": process.env.RIOT_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}
```

### 3. League-V4

**目的**: ランク情報を取得

**主要エンドポイント**:
```
GET /lol/league/v4/entries/by-summoner/{summonerId}
```

**使用例**:
```javascript
async function getLeagueEntriesBySummonerId(region, summonerId) {
  const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": process.env.RIOT_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}
```

### 4. Champion-Mastery-V4

**目的**: チャンピオン習熟度を取得

**主要エンドポイント**:
```
GET /lol/champion-mastery/v4/champion-masteries/by-summoner/{summonerId}
```

### 5. Spectator-V5

**目的**: 現在進行中ゲームの情報を取得

**主要エンドポイント**:
```
GET /lol/spectator/v5/active-games/by-summoner/{summonerId}
```

## レートリミット管理

### 制限値

- **開発者キー**:
  - 20リクエスト/秒
  - 100リクエスト/2分

- **プロダクションキー**:
  - アプリケーションによって異なる（申請時に必要数を提示）

### 実装戦略

1. **リクエスト間隔調整**:
   ```javascript
   const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

   async function rateLimit() {
     const RATE_LIMIT_MS = 100; // 10リクエスト/秒に制限
     await sleep(RATE_LIMIT_MS);
   }

   async function fetchWithRateLimit(url, options) {
     await rateLimit();
     return fetch(url, options);
   }
   ```

2. **キューイングシステム**:
   - リクエストを順番に処理するキューを実装
   - バックグラウンドプロセスでデータを収集

3. **レスポンスヘッダー監視**:
   ```javascript
   async function fetchWithRateLimitMonitoring(url, options) {
     const response = await fetch(url, options);
     
     // レートリミットヘッダーの確認
     console.log(`X-App-Rate-Limit: ${response.headers.get('X-App-Rate-Limit')}`);
     console.log(`X-App-Rate-Limit-Count: ${response.headers.get('X-App-Rate-Limit-Count')}`);
     
     // 429エラー（レート制限超過）の処理
     if (response.status === 429) {
       const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
       console.log(`Rate limit exceeded. Retrying after ${retryAfter} seconds`);
       await sleep(retryAfter * 1000);
       return fetchWithRateLimitMonitoring(url, options);
     }
     
     return response;
   }
   ```

## Data Dragon リソース利用

Data DragonはRiotが提供する静的データリポジトリで、画像やゲームデータを含みます。

### バージョン取得

```javascript
async function getLatestVersion() {
  const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await response.json();
  return versions[0]; // 最新バージョン
}
```

### チャンピオンアイコン取得

```javascript
function getChampionIconUrl(version, championName) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championName}.png`;
}
```

### アイテムアイコン取得

```javascript
function getItemIconUrl(version, itemId) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
}
```

### チャンピオンデータ取得

```javascript
async function getChampionsData(version, language = 'ja_JP') {
  const url = `http://ddragon.leagueoflegends.com/cdn/${version}/data/${language}/champion.json`;
  const response = await fetch(url);
  return await response.json();
}
```

## キャッシュ戦略

APIリクエストを最小限に抑えるためのキャッシュ実装：

1. **短期キャッシュ** (Redis/メモリキャッシュ):
   - サモナー情報: 1時間
   - ランキング: 30分
   - 現在のゲーム: 30秒

2. **長期キャッシュ** (データベース):
   - マッチ履歴: 永続的
   - チャンピオン統計: 更新時のみ

## エラーハンドリング

1. **APIエラー対応**:
   ```javascript
   async function fetchRiotAPI(url, options) {
     try {
       const response = await fetch(url, {
         ...options,
         headers: {
           ...options?.headers,
           "X-Riot-Token": process.env.RIOT_API_KEY
         }
       });
       
       if (response.status === 401) {
         throw new Error('Unauthorized - Invalid API key');
       }
       
       if (response.status === 404) {
         return null; // リソースが見つからない（存在しないサモナーなど）
       }
       
       if (response.status === 429) {
         // レートリミット処理（前述）
       }
       
       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }
       
       return await response.json();
     } catch (error) {
       console.error('Riot API error:', error);
       throw error;
     }
   }
   ```

2. **フォールバック戦略**:
   - キャッシュデータの利用
   - 部分的なデータ表示
   - ユーザーフレンドリーなエラーメッセージ

## リージョン対応

Riot APIは地域ごとに異なるエンドポイントを持ちます：

```javascript
const REGIONS = {
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

function getApiUrl(region, endpoint) {
  return `https://${REGIONS[region].api}${endpoint}`;
}

function getRoutingUrl(region, endpoint) {
  return `https://${REGIONS[region].routing}.api.riotgames.com${endpoint}`;
}
```

## Riot API 利用規約の遵守

1. **ディスクレーマー表示**:
   ```html
   <footer>
     League of LegendsはRiot Games, Inc.の登録商標です。本サイトはRiot Gamesによる承認や後援を受けたものではありません。
   </footer>
   ```

2. **プライバシー配慮**:
   - カスタムゲームデータは本人のみに表示
   - ユーザーに個人データ利用の透明性確保

3. **データ再配布の制限**:
   - 生データのダウンロード機能は提供しない
   - API形式での再配布をしない
