import Link from 'next/link';
import { prisma } from '@/lib/db';
import { StatsCard } from '@/components/features/stats-card';
import { PaperCard } from '@/components/features/paper-card';
import {
  BookOpen,
  ArrowRight,
  Zap,
  Target,
  FileText,
} from 'lucide-react';
import { Paper, Blueprint, BusinessAnalysis, ImplementationChecklist } from '@/lib/types';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

function transformPaper(dbPaper: {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  institutions: string[];
  published: Date;
  updated: Date;
  link: string;
  categories: string[];
  relevanceScore: number;
  noveltyScore: number;
  authorityScore: number;
  practicalScore: number;
  overallScore: number;
  scoreReasoning: string;
  ragComponent: string;
  blueprint: unknown;
  businessAnalysis: unknown;
  implementationChecklist: unknown;
  isSelected: boolean;
  fetchedAt: Date;
  processedAt: Date | null;
}): Paper {
  return {
    ...dbPaper,
    published: dbPaper.published.toISOString(),
    updated: dbPaper.updated.toISOString(),
    fetchedAt: dbPaper.fetchedAt.toISOString(),
    processedAt: dbPaper.processedAt?.toISOString() || null,
    blueprint: dbPaper.blueprint as Blueprint,
    businessAnalysis: dbPaper.businessAnalysis as BusinessAnalysis,
    implementationChecklist: dbPaper.implementationChecklist as ImplementationChecklist,
  };
}

async function getDashboardData() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalPapers, selectedPapers, recentPapers, componentCounts] = await Promise.all([
      prisma.paper.count(),
      prisma.paper.count({ where: { isSelected: true } }),
      prisma.paper.findMany({
        where: { isSelected: true },
        orderBy: [{ overallScore: 'desc' }, { published: 'desc' }],
        take: 5,
      }),
      prisma.paper.groupBy({
        by: ['ragComponent'],
        where: { isSelected: true },
        _count: true,
      }),
    ]);

    const mostActiveComponent =
      componentCounts.sort((a, b) => b._count - a._count)[0]?.ragComponent || 'なし';

    return {
      totalPapers,
      selectedPapers,
      recentPapers: recentPapers.map(transformPaper),
      mostActiveComponent,
      selectionRate: totalPapers > 0 ? Math.round((selectedPapers / totalPapers) * 100) : 0,
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      totalPapers: 0,
      selectedPapers: 0,
      recentPapers: [] as Paper[],
      mostActiveComponent: 'なし',
      selectionRate: 0,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヒーローセクション */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 border border-slate-800 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-yellow-400">✨</span>
              <span className="text-sm font-medium text-yellow-400">
                AIエンジニア・コンサルタント向け
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              最先端RAG研究の
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                ナレッジハブ
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl">
              arXivから毎日自動で論文を収集し、AIが厳選。
              実装ブループリント・ビジネス分析・導入チェックリストを即座に取得できます。
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/papers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                論文を探索する
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/digest"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              >
                <FileText className="h-4 w-4" />
                週次ダイジェストを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 統計カード */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">ダッシュボード概要</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="スキャン済み論文"
            value={data.totalPapers}
            subtitle="arXivから取得"
            iconName="BookOpen"
            color="blue"
          />
          <StatsCard
            title="厳選論文"
            value={data.selectedPapers}
            subtitle={`選定率 ${data.selectionRate}%`}
            iconName="Sparkles"
            color="purple"
          />
          <StatsCard
            title="最もアクティブ"
            value={data.mostActiveComponent}
            subtitle="今月のトレンド"
            iconName="TrendingUp"
            color="green"
          />
          <StatsCard
            title="毎日更新"
            value="9:00"
            subtitle="JST自動取得"
            iconName="Calendar"
            color="orange"
          />
        </div>
      </section>

      {/* 3つの価値訴求 */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">このツールで得られる価値</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              即座に使える実装ブループリント
            </h3>
            <p className="text-sm text-slate-400">
              論文の手法をPython/LangChainコードに変換。
              コピペで動く実装例と必要ライブラリを提供。
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              コンサル資料に使えるビジネス分析
            </h3>
            <p className="text-sm text-slate-400">
              ターゲット業界・ROIポテンシャル・導入リスクを自動分析。
              クライアントへの提案資料作成を加速。
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              導入前チェックリストを自動生成
            </h3>
            <p className="text-sm text-slate-400">
              新手法を自社に導入する際の必須タスクを優先度付きで整理。
              工数見積もりとチームサイズも提案。
            </p>
          </div>
        </div>
      </section>

      {/* 最新の厳選論文 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">最新の厳選論文</h2>
          <Link
            href="/papers"
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            すべて見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {data.recentPapers.length > 0 ? (
          <div className="space-y-6">
            {data.recentPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-slate-900/50 border border-slate-800">
            <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">まだ論文がありません</h3>
            <p className="text-sm text-slate-500 mb-6">
              日次バッチが実行されると、厳選された論文がここに表示されます。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
