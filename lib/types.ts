// 論文型定義
export interface Paper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  institutions: string[];
  published: string;
  updated: string;
  link: string;
  categories: string[];
  relevanceScore: number;
  noveltyScore: number;
  authorityScore: number;
  practicalScore: number;
  overallScore: number;
  scoreReasoning: string;
  ragComponent: string;
  blueprint: Blueprint;
  businessAnalysis: BusinessAnalysis;
  implementationChecklist: ImplementationChecklist;
  isSelected: boolean;
  fetchedAt: string;
  processedAt: string | null;
}

export interface Blueprint {
  title: string;
  description: string;
  codeSnippet: string;
  language: string;
  prerequisites: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedImplementationTime: string;
  keyInsights: string[];
}

export interface BusinessAnalysis {
  valueProposition: string;
  targetIndustries: string[];
  useCases: string[];
  roiPotential: 'high' | 'medium' | 'low';
  roiReasoning: string;
  competitiveAdvantage: string;
  risks: string[];
}

export interface ImplementationChecklist {
  items: ChecklistItem[];
  estimatedTotalEffort: string;
  recommendedTeamSize: string;
  prerequisites: string[];
}

export interface ChecklistItem {
  category: string;
  task: string;
  priority: 'must' | 'should' | 'nice-to-have';
  details: string;
}

// トレンドデータ型
export interface TrendData {
  componentStats: ComponentStat[];
  weeklyTrends: WeeklyTrend[];
  topPapers: TopPaper[];
  summary: TrendSummary;
}

export interface ComponentStat {
  component: string;
  count: number;
  avgScore: number;
}

export interface WeeklyTrend {
  weekStart: string;
  weekEnd: string;
  total: number;
  byComponent: Record<string, number>;
}

export interface TopPaper {
  id: string;
  title: string;
  overallScore: number;
  ragComponent: string;
  published: string;
}

export interface TrendSummary {
  totalPapers: number;
  avgScore: number;
  mostActiveComponent: string;
}

// ダイジェスト型
export interface WeeklyDigest {
  id?: string;
  weekStart: string;
  weekEnd: string;
  title: string;
  summary: string;
  trendAnalysis: string;
  papers: DigestPaper[];
}

export interface DigestPaper {
  paper: {
    id: string;
    title: string;
    summary: string;
    authors: string[];
    overallScore: number;
    ragComponent: string;
    published: string;
  };
  highlight: string;
}

// RAGコンポーネント
export const RAG_COMPONENTS = [
  { id: 'Chunking', label: 'チャンキング', color: 'bg-purple-500' },
  { id: 'Embedding', label: 'エンベディング', color: 'bg-blue-500' },
  { id: 'Retrieval', label: 'リトリーバル', color: 'bg-green-500' },
  { id: 'Reranking', label: 'リランキング', color: 'bg-yellow-500' },
  { id: 'Generation', label: '生成', color: 'bg-orange-500' },
  { id: 'Orchestration', label: 'オーケストレーション', color: 'bg-red-500' },
  { id: 'Evaluation', label: '評価', color: 'bg-pink-500' },
] as const;

export function getComponentInfo(id: string) {
  return RAG_COMPONENTS.find((c) => c.id === id) || { id, label: id, color: 'bg-gray-500' };
}
