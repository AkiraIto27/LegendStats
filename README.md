# LOL Stats Hub

League of Legends向けの拡張統計・分析プラットフォーム。OP.GGの機能を拡張し、より詳細なデータ分析と洞察を提供します。

## 特徴

- **高度なデータ分析**: プレイヤーのパフォーマンス、メタの時系列分析など詳細な統計情報
- **AIによるリプレイ解析**: 試合リプレイを分析し、改善点を提案
- **プレイヤーの成長分析**: 長期的な成績推移とスキル向上の可視化
- **対戦予測**: チャンピオン構成や各プレイヤーの統計から勝率を予測

## 技術スタック

### フロントエンド
- React + TypeScript
- Next.js (SSRによる高速表示とSEO対策)
- Styled-Components
- Redux (状態管理)
- D3.js / Chart.js (データ可視化)

### バックエンド
- Node.js (Express/NestJS)
- TypeScript
- WebSocketによるリアルタイム通信

### データベース
- MySQL (プレイヤー情報、マッチ基本情報)
- MongoDB (試合詳細データ、統計)
- Redis (キャッシュ、リアルタイム通知)

### AI / 機械学習
- Python (データ分析、AI機能)
- TensorFlow / PyTorch (機械学習モデル)

### インフラ
- AWS / GCP (クラウドホスティング)
- Docker & Kubernetes (コンテナ化とオーケストレーション)
- CDN (静的コンテンツ配信、API応答キャッシュ)

## 法的注意事項

このプロジェクトはRiot Games公式APIを利用しています。League of LegendsはRiot Gamesの登録商標です。
本サイトはRiot Gamesによる承認や後援を受けたものではありません。

## ライセンス

MIT
