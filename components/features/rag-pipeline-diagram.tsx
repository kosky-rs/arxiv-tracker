'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Grid3x3,
  Binary,
  Search,
  ListFilter,
  Sparkles,
  Network,
  BarChart3,
  ArrowRight
} from 'lucide-react';

interface ComponentData {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  keywords: string[];
  papers?: number;
}

const components: ComponentData[] = [
  {
    id: 'Chunking',
    label: 'Chunking',
    icon: Grid3x3,
    color: 'from-blue-500 to-blue-600',
    keywords: ['セマンティック分割', 'オーバーラップ', '文境界検出'],
    papers: 0,
  },
  {
    id: 'Embedding',
    label: 'Embedding',
    icon: Binary,
    color: 'from-purple-500 to-purple-600',
    keywords: ['BERT', 'E5', 'コントラスト学習'],
    papers: 0,
  },
  {
    id: 'Retrieval',
    label: 'Retrieval',
    icon: Search,
    color: 'from-green-500 to-green-600',
    keywords: ['ベクトル検索', 'ハイブリッド検索', 'BM25'],
    papers: 0,
  },
  {
    id: 'Reranking',
    label: 'Reranking',
    icon: ListFilter,
    color: 'from-yellow-500 to-yellow-600',
    keywords: ['Cross-Encoder', 'ColBERT', 'スコアリング'],
    papers: 0,
  },
  {
    id: 'Generation',
    label: 'Generation',
    icon: Sparkles,
    color: 'from-pink-500 to-pink-600',
    keywords: ['プロンプト最適化', 'CoT', 'Few-shot'],
    papers: 0,
  },
  {
    id: 'Orchestration',
    label: 'Orchestration',
    icon: Network,
    color: 'from-indigo-500 to-indigo-600',
    keywords: ['エージェント', 'ルーティング', 'マルチステップ'],
    papers: 0,
  },
  {
    id: 'Evaluation',
    label: 'Evaluation',
    icon: BarChart3,
    color: 'from-orange-500 to-orange-600',
    keywords: ['RAGAS', 'Faithfulness', 'Relevance'],
    papers: 0,
  },
];

interface RAGPipelineDiagramProps {
  componentCounts?: Record<string, number>;
}

export function RAGPipelineDiagram({ componentCounts = {} }: RAGPipelineDiagramProps) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const componentsWithCounts = components.map((comp) => ({
    ...comp,
    papers: componentCounts[comp.id] || 0,
  }));

  return (
    <div className="relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 accent-border pl-4">
          RAGシステム全体像
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 pl-4">
          各コンポーネントにカーソルを合わせると、トレンドキーワードが表示されます
        </p>
      </div>

      {/* パイプライン図 */}
      <div className="relative bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800 rounded-xl border p-8 overflow-hidden">
        {/* 背景グリッド */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>

        {/* コンポーネント */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {componentsWithCounts.map((component, index) => (
            <div key={component.id} className="relative">
              {/* 矢印（最後以外） */}
              {index < componentsWithCounts.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-0">
                  <ArrowRight className="h-6 w-6 text-neutral-300 dark:text-neutral-700" />
                </div>
              )}

              {/* コンポーネントカード */}
              <motion.div
                className="relative z-10"
                onHoverStart={() => setHoveredComponent(component.id)}
                onHoverEnd={() => setHoveredComponent(null)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`
                    relative p-4 rounded-lg cursor-pointer transition-all duration-300
                    ${
                      hoveredComponent === component.id
                        ? 'shadow-xl ring-2 ring-[#0066FF] dark:ring-[#3D8BFF]'
                        : 'shadow-md hover:shadow-lg'
                    }
                    bg-white dark:bg-neutral-800 border
                  `}
                >
                  {/* アイコン */}
                  <div
                    className={`
                      w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center
                      bg-gradient-to-br ${component.color}
                    `}
                  >
                    <component.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* ラベル */}
                  <h3 className="text-sm font-semibold text-center text-neutral-900 dark:text-white mb-1">
                    {component.label}
                  </h3>

                  {/* 論文数バッジ */}
                  {component.papers > 0 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#0066FF] dark:bg-[#3D8BFF] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{component.papers}</span>
                    </div>
                  )}

                  {/* ホバー時のキーワード */}
                  {hoveredComponent === component.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 border-t space-y-1"
                    >
                      {component.keywords.map((keyword) => (
                        <div
                          key={keyword}
                          className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700/50 px-2 py-1 rounded"
                        >
                          {keyword}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* フロー説明（モバイル用） */}
        <div className="mt-6 lg:hidden flex items-center justify-center gap-2 text-xs text-neutral-500 dark:text-neutral-500">
          <span>データ取得</span>
          <ArrowRight className="h-3 w-3" />
          <span>検索</span>
          <ArrowRight className="h-3 w-3" />
          <span>生成</span>
          <ArrowRight className="h-3 w-3" />
          <span>評価</span>
        </div>
      </div>

      {/* 凡例 */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#0066FF] dark:bg-[#3D8BFF] rounded-full"></div>
          <span>論文数</span>
        </div>
        <div className="flex items-center gap-2">
          <FileText className="h-3 w-3" />
          <span>ホバーでキーワード表示</span>
        </div>
      </div>
    </div>
  );
}
