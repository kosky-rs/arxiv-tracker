'use client';

import { useState, useEffect } from 'react';
import { PaperCard } from '@/components/features/paper-card';
import { ComponentFilter } from '@/components/features/component-filter';
import { Paper } from '@/lib/types';
import { Search, BookOpen, Loader2, Filter } from 'lucide-react';

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const doFetch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedComponent) params.set('component', selectedComponent);
        params.set('limit', '50');

        const res = await fetch(`/api/papers?${params}`);
        const data = await res.json();
        setPapers(data.papers || []);
      } catch (error) {
        console.error('Failed to fetch papers:', error);
      } finally {
        setLoading(false);
      }
    };
    doFetch();
  }, [selectedComponent]);

  const filteredPapers = papers.filter((paper) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(query) ||
      paper.summary.toLowerCase().includes(query) ||
      paper.authors.some((a) => a.toLowerCase().includes(query))
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">論文ライブラリ</h1>
        <p className="text-slate-400">
          AIが厳選したRAG関連の最新論文。実装コードとビジネス分析付き。
        </p>
      </div>

      {/* 検索・フィルター */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="論文タイトル、著者、キーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-colors md:hidden"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
          <ComponentFilter selected={selectedComponent} onChange={setSelectedComponent} />
        </div>
      </div>

      {/* 結果カウント */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500">
          {filteredPapers.length}件の論文
          {selectedComponent && ` (${selectedComponent})`}
        </p>
      </div>

      {/* 論文リスト */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      ) : filteredPapers.length > 0 ? (
        <div className="space-y-6">
          {filteredPapers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-2xl bg-slate-900/50 border border-slate-800">
          <BookOpen className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? '検索結果がありません' : '論文がまだありません'}
          </h3>
          <p className="text-sm text-slate-500">
            {searchQuery
              ? '別のキーワードで検索してみてください'
              : '日次バッチが実行されると、論文が表示されます'}
          </p>
        </div>
      )}
    </div>
  );
}
