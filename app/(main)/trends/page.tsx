'use client';

import { useState, useEffect } from 'react';
import {
  TrendRadar,
  WeeklyTrendChart,
  ComponentBarChart,
} from '@/components/features/trend-chart';
import { StatsCard } from '@/components/features/stats-card';
import { TrendData, getComponentInfo } from '@/lib/types';
import { BarChart3, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TrendsPage() {
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await fetch('/api/trends');
      const data = await res.json();
      setTrendData(data);
    } catch (error) {
      console.error('Failed to fetch trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!trendData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 rounded-2xl bg-slate-900/50 border border-slate-800">
          <BarChart3 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">データがありません</h3>
          <p className="text-sm text-slate-500">
            論文が蓄積されると、トレンド分析が表示されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">トレンド分析</h1>
        <p className="text-slate-400">
          RAG研究の最新トレンドをリアルタイムで可視化。技術選定の意思決定に活用できます。
        </p>
      </div>

      {/* サマリー統計 */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard
            title="過去30日間の論文"
            value={trendData.summary.totalPapers}
            iconName="TrendingUp"
            color="blue"
          />
          <StatsCard
            title="平均スコア"
            value={trendData.summary.avgScore}
            iconName="Award"
            color="purple"
          />
          <StatsCard
            title="最もアクティブな分野"
            value={getComponentInfo(trendData.summary.mostActiveComponent).label}
            iconName="Target"
            color="green"
          />
        </div>
      </section>

      {/* チャート */}
      <section className="grid lg:grid-cols-2 gap-6 mb-8">
        <TrendRadar data={trendData.componentStats} />
        <ComponentBarChart data={trendData.componentStats} />
      </section>

      <section className="mb-8">
        <WeeklyTrendChart data={trendData.weeklyTrends} />
      </section>

      {/* トップ論文 */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">今月のトップ論文</h2>
        <div className="space-y-3">
          {trendData.topPapers.map((paper, index) => {
            const componentInfo = getComponentInfo(paper.ragComponent);
            return (
              <Link
                key={paper.id}
                href={`/papers?highlight=${encodeURIComponent(paper.id)}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-400">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{paper.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs text-white ${componentInfo.color}`}
                    >
                      {componentInfo.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(paper.published).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{paper.overallScore}</span>
                  <span className="text-xs text-slate-500 block">スコア</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
