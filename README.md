# RAG Knowledge Hub

最先端RAG（Retrieval-Augmented Generation）研究のナレッジベース。arXivから毎日自動で論文を収集し、AIが厳選。AIエンジニア・コンサルタント向けに実装ブループリント・ビジネス分析・導入チェックリストを提供します。

## 機能

### コア機能
- **日次論文自動取得**: arXivからRAG関連論文を毎日9:00 JSTに自動収集
- **AI選定**: Gemini AIによる厳格な論文評価（関連性・新規性・権威性・実用性）
- **知識抽出**: 選定論文から実装コード・ビジネス分析を自動生成

### 3つの目玉機能

1. **即座に使える実装ブループリント**
   - Python/LangChain実装コード
   - 必要ライブラリと工数見積もり
   - 技術的な重要ポイント

2. **ビジネス分析・コンサル資料**
   - ターゲット業界とROIポテンシャル
   - ユースケースと競合優位性
   - 導入リスクの明示

3. **導入チェックリスト自動生成**
   - 優先度付きタスク一覧（必須/推奨/任意）
   - 推奨チームサイズと総工数
   - 前提条件の整理

### その他の機能
- **トレンド分析**: RAGコンポーネント別の論文動向を可視化
- **週次ダイジェスト**: 3分で読める週次サマリー（Slack/メール共有対応）
- **RAGコンポーネント分類**: Chunking, Embedding, Retrieval, Reranking, Generation, Orchestration, Evaluation

## 技術スタック

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI/UX**: Framer Motion, Recharts, Lucide Icons
- **Backend**: Next.js API Routes, Vercel Cron
- **Database**: Vercel Postgres + Prisma
- **AI**: Google Gemini API
- **CI/CD**: GitHub Actions

## セットアップ

### 環境変数

`.env.local`を作成:

```bash
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Vercel Postgres（Vercelで自動設定）
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Cron認証（任意の文字列）
CRON_SECRET=your_secret_string
```

### ローカル開発

```bash
# 依存関係インストール
npm install

# Prismaクライアント生成
npx prisma generate

# DBマイグレーション（初回のみ）
npx prisma migrate dev

# 開発サーバー起動
npm run dev
```

### Vercelデプロイ

1. Vercelプロジェクトを作成
2. Vercel Storageで「Postgres」を追加
3. 環境変数を設定（`GEMINI_API_KEY`, `CRON_SECRET`）
4. GitHubリポジトリを接続してデプロイ

Cronジョブは`vercel.json`で自動設定されます:
- 日次論文取得: 毎日9:00 JST
- 週次ダイジェスト: 毎週月曜10:00 JST

## プロジェクト構成

```
├── app/
│   ├── (main)/           # メインレイアウト
│   │   ├── page.tsx      # ダッシュボード
│   │   ├── papers/       # 論文ライブラリ
│   │   ├── trends/       # トレンド分析
│   │   └── digest/       # 週次ダイジェスト
│   └── api/
│       ├── cron/         # 日次/週次バッチ
│       ├── papers/       # 論文API
│       ├── trends/       # トレンドAPI
│       └── digest/       # ダイジェストAPI
├── components/
│   ├── features/         # 機能コンポーネント
│   └── layout/           # レイアウトコンポーネント
├── lib/
│   ├── pipeline/         # 論文処理パイプライン
│   ├── gemini.ts         # Gemini APIクライアント
│   └── db.ts             # Prismaクライアント
└── prisma/
    └── schema.prisma     # DBスキーマ
```

## 論文評価基準

選定される論文は以下の条件を満たす必要があります:

- **総合スコア**: 8以上（10点満点）
- **RAG関連性**: 7以上（10点満点）

評価軸:
- **関連性** (35%): RAGシステムへの直接的貢献度
- **新規性** (25%): 技術的な独自性
- **実用性** (25%): すぐに実装可能か
- **権威性** (15%): 著者・所属機関の実績

## ライセンス

MIT
