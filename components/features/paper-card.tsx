'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Calendar,
  Zap,
  Target,
  Lightbulb,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Paper, getComponentInfo } from '@/lib/types';

interface PaperCardProps {
  paper: Paper;
  defaultExpanded?: boolean;
}

export function PaperCard({ paper, defaultExpanded = false }: PaperCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'blueprint' | 'business' | 'checklist'>('blueprint');

  const componentInfo = getComponentInfo(paper.ragComponent);

  const copyCode = async () => {
    if (paper.blueprint?.codeSnippet) {
      await navigator.clipboard.writeText(paper.blueprint.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const scoreColor =
    paper.overallScore >= 9
      ? 'from-yellow-400 to-orange-500'
      : paper.overallScore >= 8
      ? 'from-green-400 to-emerald-500'
      : 'from-blue-400 to-cyan-500';

  return (
    <motion.article
      layout
      className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors"
    >
      {/* ヘッダー */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-full text-xs font-medium text-white',
                  componentInfo.color
                )}
              >
                {componentInfo.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                {new Date(paper.published).toLocaleDateString('ja-JP')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight mb-2 line-clamp-2">
              {paper.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {paper.institutions.slice(0, 2).map((inst) => (
                <span
                  key={inst}
                  className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full"
                >
                  <Building2 className="h-3 w-3" />
                  {inst}
                </span>
              ))}
              <span className="text-xs text-slate-500">
                {paper.authors.slice(0, 2).join(', ')}
                {paper.authors.length > 2 && ` 他${paper.authors.length - 2}名`}
              </span>
            </div>
          </div>

          {/* スコア */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center',
                scoreColor
              )}
            >
              <span className="text-2xl font-bold text-white">{paper.overallScore}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">総合スコア</span>
          </div>
        </div>

        {/* スコア内訳 */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: '関連性', score: paper.relevanceScore, icon: Target },
            { label: '新規性', score: paper.noveltyScore, icon: Lightbulb },
            { label: '権威性', score: paper.authorityScore, icon: Building2 },
            { label: '実用性', score: paper.practicalScore, icon: Zap },
          ].map(({ label, score, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  style={{ width: `${score * 10}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-400">{score}</span>
            </div>
          ))}
        </div>

        {/* 要約 */}
        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {paper.scoreReasoning}
        </p>

        {/* 展開ボタン */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-sm font-medium text-slate-300 transition-colors"
        >
          {isExpanded ? '詳細を閉じる' : '実装・ビジネス詳細を見る'}
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {/* 展開コンテンツ */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-slate-800"
          >
            {/* タブ */}
            <div className="flex border-b border-slate-800">
              {[
                { id: 'blueprint', label: '実装ブループリント', icon: Zap },
                { id: 'business', label: 'ビジネス分析', icon: Target },
                { id: 'checklist', label: 'チェックリスト', icon: CheckSquare },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                    activeTab === id
                      ? 'text-blue-400 bg-blue-500/10 border-b-2 border-blue-400'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* タブコンテンツ */}
            <div className="p-5">
              {activeTab === 'blueprint' && paper.blueprint && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">
                      {paper.blueprint.title}
                    </h4>
                    <p className="text-sm text-slate-400">{paper.blueprint.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        paper.blueprint.difficulty === 'beginner'
                          ? 'bg-green-500/20 text-green-400'
                          : paper.blueprint.difficulty === 'intermediate'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {paper.blueprint.difficulty === 'beginner'
                        ? '初級'
                        : paper.blueprint.difficulty === 'intermediate'
                        ? '中級'
                        : '上級'}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-800 text-slate-400">
                      実装目安: {paper.blueprint.estimatedImplementationTime}
                    </span>
                  </div>

                  {/* コードスニペット */}
                  <div className="relative">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-800 rounded-t-lg border-b border-slate-700">
                      <span className="text-xs text-slate-400">{paper.blueprint.language}</span>
                      <button
                        onClick={copyCode}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-400" />
                            コピー済み
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            コピー
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-900 rounded-b-lg overflow-x-auto">
                      <code className="text-sm text-slate-300 font-mono">
                        {paper.blueprint.codeSnippet}
                      </code>
                    </pre>
                  </div>

                  {/* 必要ライブラリ */}
                  {paper.blueprint.prerequisites?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">必要ライブラリ</h5>
                      <div className="flex flex-wrap gap-2">
                        {paper.blueprint.prerequisites.map((lib) => (
                          <span
                            key={lib}
                            className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-400 font-mono"
                          >
                            {lib}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 重要ポイント */}
                  {paper.blueprint.keyInsights?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">技術的ポイント</h5>
                      <ul className="space-y-1">
                        {paper.blueprint.keyInsights.map((insight, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'business' && paper.businessAnalysis && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">価値提案</h4>
                    <p className="text-sm text-slate-400">
                      {paper.businessAnalysis.valueProposition}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">ターゲット業界</h5>
                      <div className="flex flex-wrap gap-2">
                        {paper.businessAnalysis.targetIndustries?.map((ind) => (
                          <span
                            key={ind}
                            className="px-2 py-1 rounded bg-blue-500/20 text-xs text-blue-400"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">ROIポテンシャル</h5>
                      <span
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium',
                          paper.businessAnalysis.roiPotential === 'high'
                            ? 'bg-green-500/20 text-green-400'
                            : paper.businessAnalysis.roiPotential === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-500/20 text-slate-400'
                        )}
                      >
                        {paper.businessAnalysis.roiPotential === 'high'
                          ? '高'
                          : paper.businessAnalysis.roiPotential === 'medium'
                          ? '中'
                          : '低'}
                      </span>
                    </div>
                  </div>

                  {paper.businessAnalysis.roiReasoning && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">ROI根拠</h5>
                      <p className="text-sm text-slate-400">{paper.businessAnalysis.roiReasoning}</p>
                    </div>
                  )}

                  {paper.businessAnalysis.useCases?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">ユースケース</h5>
                      <ul className="space-y-1">
                        {paper.businessAnalysis.useCases.map((uc, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <Target className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                            {uc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {paper.businessAnalysis.risks?.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-slate-500 mb-2">導入リスク</h5>
                      <ul className="space-y-1">
                        {paper.businessAnalysis.risks.map((risk, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-orange-400">
                            <span className="shrink-0">⚠️</span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'checklist' && paper.implementationChecklist && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="px-4 py-3 rounded-xl bg-slate-800/50">
                      <span className="text-xs text-slate-500 block">総工数目安</span>
                      <span className="text-sm font-medium text-white">
                        {paper.implementationChecklist.estimatedTotalEffort || '未設定'}
                      </span>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-slate-800/50">
                      <span className="text-xs text-slate-500 block">推奨チームサイズ</span>
                      <span className="text-sm font-medium text-white">
                        {paper.implementationChecklist.recommendedTeamSize || '未設定'}
                      </span>
                    </div>
                  </div>

                  {paper.implementationChecklist.items?.length > 0 && (
                    <div className="space-y-2">
                      {paper.implementationChecklist.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30"
                        >
                          <div
                            className={cn(
                              'shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold',
                              item.priority === 'must'
                                ? 'bg-red-500/20 text-red-400'
                                : item.priority === 'should'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-slate-500/20 text-slate-400'
                            )}
                          >
                            {item.priority === 'must'
                              ? '必'
                              : item.priority === 'should'
                              ? '推'
                              : '任'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-slate-500">{item.category}</span>
                            </div>
                            <p className="text-sm font-medium text-white">{item.task}</p>
                            {item.details && (
                              <p className="text-xs text-slate-500 mt-1">{item.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* arXivリンク */}
            <div className="px-5 pb-5">
              <a
                href={paper.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                arXivで論文を読む
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
