# LOL Stats Hub - セットアップガイド

## プロジェクト概要

LOL Stats Hubは、League of Legendsの統計情報と分析を提供するWebアプリケーションです。OP.GGの拡張版として以下の機能を提供します：

- プレイヤー検索と詳細な戦績表示
- チャンピオン統計とティアリスト
- AIを活用したリプレイ解析
- プレイヤーの成長分析
- マッチ予測機能
- メタ分析と時系列トレンド

## 技術スタック

- **フロントエンド**: React, TypeScript, Next.js, Styled-Components
- **バックエンド**: Node.js, Express, TypeScript
- **データベース**: MongoDB, Redis(キャッシュ)
- **インフラ**: Docker, AWS(予定)

## セットアップ手順

### 前提条件

以下のソフトウェアがインストールされていることを確認してください：

- Node.js (v16以上)
- npm または yarn
- Docker と Docker Compose
- MongoDB (ローカル開発用)

### 1. Riot API キーの取得

1. [Riot Developer Portal](https://developer.riotgames.com/)にアクセス
2. アカウント登録後、開発者キーを取得
3. `.env`ファイルの`RIOT_API_KEY`に取得したキーを設定

### 2. 開発環境のセットアップ

#### 手動セットアップ

**バックエンド**:
```bash
# リポジトリのクローン
git clone https://github.com/yourusername/lol-stats-hub.git
cd lol-stats-hub

# バックエンドの依存関係インストール
cd backend
npm install

# 開発サーバー起動
npm run dev
```

**フロントエンド**:
```bash
# 別ターミナルで
cd frontend
npm install

# 開発サーバー起動
npm run dev
```

#### Dockerを使用したセットアップ

```bash
# リポジトリのルートディレクトリで
docker-compose up
```

これにより以下のサービスが起動します：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001
- MongoDB: localhost:27017
- Redis: localhost:6379

### 3. 本番環境へのデプロイ

#### AWS環境構築（予定）

1. Amazon ECR にコンテナイメージをプッシュ
2. ECS または EKS でコンテナをデプロイ
3. MongoDB Atlas または Amazon DocumentDB を使用
4. ElastiCache (Redis) をキャッシュ層として使用
5. CloudFront でCDNを構成

## プロジェクト構造

```
lol-stats-hub/
├── backend/                   # バックエンドコード
│   ├── src/
│   │   ├── config/            # 設定ファイル
│   │   ├── controllers/       # コントローラー
│   │   ├── middlewares/       # ミドルウェア
│   │   ├── models/            # データモデル
│   │   ├── routes/            # APIルート
│   │   ├── services/          # ビジネスロジック
│   │   │   └── meta/          # メタ分析サービス
│   │   ├── utils/             # ユーティリティ
│   │   └── index.ts           # エントリーポイント
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  # フロントエンドコード
│   ├── public/                # 静的ファイル
│   ├── src/
│   │   ├── components/        # React コンポーネント
│   │   ├── hooks/             # カスタムフック
│   │   ├── pages/             # Next.js ページ
│   │   ├── services/          # API 連携
│   │   ├── store/             # Redux ストア
│   │   ├── styles/            # スタイル
│   │   ├── types/             # TypeScript 型定義
│   │   └── utils/             # ユーティリティ
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                      # ドキュメント
├── .env                       # 環境変数
├── docker-compose.yml         # Docker Compose 設定
└── README.md                  # プロジェクト説明
```

## APIエンドポイント

主要なAPIエンドポイントは以下の通りです：

- `/api/summoners/:region/:name` - サモナー情報
- `/api/summoners/:region/:name/matches` - マッチ履歴
- `/api/matches/:region/:matchId` - マッチ詳細
- `/api/champions` - チャンピオン一覧
- `/api/champions/:id/stats` - チャンピオン統計
- `/api/meta/tier-list` - メタティアリスト
- `/api/leaderboard/:region/ranked` - ランキング

詳細なAPI仕様は開発過程で`/docs/api-docs.md`に追加されます。

## 貢献方法

1. リポジトリをフォークする
2. 機能ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュする (`git push origin feature/amazing-feature`)
5. Pull Requestを作成する

## ライセンス

このプロジェクトはMITライセンスで公開されています。

## 免責事項

このプロジェクトはRiot Gamesの公式プロダクトではありません。League of LegendsはRiot Games, Inc.の登録商標です。
