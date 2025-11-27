'use client';

import { useState, useEffect } from 'react';
import { WeeklyDigest, getComponentInfo } from '@/lib/types';
import {
  FileText,
  Calendar,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DigestPage() {
  const [digest, setDigest] = useState<WeeklyDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDigest();
  }, []);

  const fetchDigest = async () => {
    try {
      const res = await fetch('/api/digest');
      const data = await res.json();
      setDigest(data);
    } catch (error) {
      console.error('Failed to fetch digest:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyDigest = async () => {
    if (!digest) return;

    const text = `
【${digest.title}】
期間: ${new Date(digest.weekStart).toLocaleDateString('ja-JP')} - ${new Date(digest.weekEnd).toLocaleDateString('ja-JP')}

${digest.summary}

${digest.trendAnalysis ? `■ トレンド分析\n${digest.trendAnalysis}\n` : ''}
■ 注目論文
${digest.papers.map((p, i) => `${i + 1}. ${p.paper.title}\n   ${p.highlight}`).join('\n\n')}

---
RAG Knowledge Hub より
    `.trim();

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 rounded-2xl bg-slate-900/50 border border-slate-800">
          <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">ダイジェストがありません</h3>
          <p className="text-sm text-slate-500">
            毎週月曜日に週次ダイジェストが自動生成されます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(digest.weekStart).toLocaleDateString('ja-JP')} -{' '}
              {new Date(digest.weekEnd).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">{digest.title}</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={copyDigest}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-400" />
                  コピー済み
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  テキストをコピー
                </>
              )}
            </button>
            <span className="text-sm text-slate-500">Slack・メールで共有</span>
          </div>
        </div>

        {/* サマリー */}
        <section className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            今週のハイライト
          </h2>
          <p className="text-slate-300 leading-relaxed">{digest.summary}</p>
        </section>

        {/* トレンド分析 */}
        {digest.trendAnalysis && (
          <section className="mb-8 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-3">トレンド分析</h2>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line">
              {digest.trendAnalysis}
            </p>
          </section>
        )}

        {/* 論文リスト */}
        <section>
          <h2 className="text-lg font-bold text-white mb-6">
            今週の注目論文（{digest.papers.length}本）
          </h2>

          <div className="space-y-4">
            {digest.papers.map((item, index) => {
              const componentInfo = getComponentInfo(item.paper.ragComponent);
              return (
                <article
                  key={item.paper.id}
                  className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium text-white',
                            componentInfo.color
                          )}
                        >
                          {componentInfo.label}
                        </span>
                        <span className="text-xs text-slate-500">
                          スコア: {item.paper.overallScore}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(item.paper.published).toLocaleDateString('ja-JP')}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-white mb-2 leading-tight">
                        {item.paper.title}
                      </h3>

                      <p className="text-sm text-slate-500 mb-3">
                        {item.paper.authors.slice(0, 3).join(', ')}
                        {item.paper.authors.length > 3 && ` 他${item.paper.authors.length - 3}名`}
                      </p>

                      <div className="p-3 rounded-lg bg-slate-800/50 border-l-2 border-blue-500">
                        <p className="text-sm text-slate-300">{item.highlight}</p>
                      </div>

                      <a
                        href={`https://arxiv.org/abs/${item.paper.id.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:text-blue-300"
                      >
                        論文を読む
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* フッター */}
        <footer className="mt-12 pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500">
            RAG Knowledge Hub は毎週月曜日に週次ダイジェストを自動生成します。
          </p>
        </footer>
      </div>
    </div>
  );
}
