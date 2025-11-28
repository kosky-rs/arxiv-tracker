import Link from 'next/link';
import { prisma } from '@/lib/db';
import { StatsCard } from '@/components/features/stats-card';
import { PaperCard } from '@/components/features/paper-card';
import { RAGPipelineDiagram } from '@/components/features/rag-pipeline-diagram';
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

    const componentCountsMap = componentCounts.reduce((acc, item) => {
      acc[item.ragComponent] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPapers,
      selectedPapers,
      recentPapers: recentPapers.map(transformPaper),
      mostActiveComponent,
      selectionRate: totalPapers > 0 ? Math.round((selectedPapers / totalPapers) * 100) : 0,
      componentCountsMap,
    };
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return {
      totalPapers: 0,
      selectedPapers: 0,
      recentPapers: [] as Paper[],
      mostActiveComponent: 'なし',
      selectionRate: 0,
      componentCountsMap: {} as Record<string, number>,
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="min-h-screen">
      {/* Hero Section - Flux inspired */}
      <section className="relative overflow-hidden border-b bg-gradient-to-br from-white via-neutral-50 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-900">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="container relative mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse-blue"></span>
              <span className="text-sm font-medium text-[#0066FF] dark:text-[#3D8BFF]">AIエンジニア・コンサルタント向け</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6 animate-fade-in-up">
              最先端RAG研究の
              <br />
              <span className="text-[#0066FF] dark:text-[#3D8BFF]">ナレッジハブ</span>
            </h1>

            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
              arXivから毎日自動で論文を収集し、AIが厳選。
              実装ブループリント・ビジネス分析・導入チェックリストを即座に取得できます。
            </p>

            <div className="flex flex-wrap gap-4 animate-slide-in-right">
              <Link
                href="/papers"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052CC] text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                論文を探索する
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/digest"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium rounded-lg border transition-colors"
              >
                <FileText className="h-4 w-4" />
                週次ダイジェストを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* Stats Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 accent-border pl-4">概要</h2>
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

        {/* RAG Pipeline Diagram */}
        <section className="mb-16">
          <RAGPipelineDiagram componentCounts={data.componentCountsMap} />
        </section>

        {/* Value Proposition */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 accent-border pl-4">
            このツールで得られる価値
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border bg-white dark:bg-neutral-800 hover-lift group">
              <div className="w-12 h-12 rounded-lg bg-[#0066FF]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#0066FF]/20 group-hover:scale-110">
                <Zap className="h-6 w-6 text-[#0066FF] dark:text-[#3D8BFF]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                即座に使える実装ブループリント
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                論文の手法をPython/LangChainコードに変換。
                コピペで動く実装例と必要ライブラリを提供。
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-white dark:bg-neutral-800 hover-lift group">
              <div className="w-12 h-12 rounded-lg bg-[#0066FF]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#0066FF]/20 group-hover:scale-110">
                <Target className="h-6 w-6 text-[#0066FF] dark:text-[#3D8BFF]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                コンサル資料に使えるビジネス分析
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                ターゲット業界・ROIポテンシャル・導入リスクを自動分析。
                クライアントへの提案資料作成を加速。
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-white dark:bg-neutral-800 hover-lift group">
              <div className="w-12 h-12 rounded-lg bg-[#0066FF]/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-[#0066FF]/20 group-hover:scale-110">
                <FileText className="h-6 w-6 text-[#0066FF] dark:text-[#3D8BFF]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                導入前チェックリストを自動生成
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                新手法を自社に導入する際の必須タスクを優先度付きで整理。
                工数見積もりとチームサイズも提案。
              </p>
            </div>
          </div>
        </section>

        {/* Latest Papers */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white accent-border pl-4">
              最新の厳選論文
            </h2>
            <Link
              href="/papers"
              className="text-sm text-[#0066FF] dark:text-[#3D8BFF] hover:text-[#0052CC] dark:hover:text-[#0066FF] flex items-center gap-1 font-medium transition-colors group"
            >
              すべて見る
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {data.recentPapers.length > 0 ? (
            <div className="space-y-6">
              {data.recentPapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-lg border bg-white dark:bg-neutral-800">
              <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">まだ論文がありません</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                日次バッチが実行されると、厳選された論文がここに表示されます。
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
