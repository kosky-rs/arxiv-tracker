import { generateJSON } from '@/lib/gemini';
import { ArxivPaper } from './arxiv_fetcher';

export interface ImplementationBlueprint {
  title: string;                    // ブループリントのタイトル
  description: string;              // 技術的説明（日本語）
  codeSnippet: string;              // Python/LangChain実装コード
  language: string;                 // プログラミング言語
  prerequisites: string[];          // 必要なライブラリ
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedImplementationTime: string; // 実装目安時間
  keyInsights: string[];            // 技術的な重要ポイント
}

export interface BusinessAnalysis {
  valueProposition: string;         // 価値提案（日本語）
  targetIndustries: string[];       // ターゲット業界
  useCases: string[];               // 具体的なユースケース
  roiPotential: 'high' | 'medium' | 'low';
  roiReasoning: string;             // ROI根拠
  competitiveAdvantage: string;     // 競合優位性
  risks: string[];                  // 導入リスク
}

export interface ImplementationChecklist {
  items: {
    category: string;               // カテゴリ（データ準備、インフラ、評価等）
    task: string;                   // タスク内容
    priority: 'must' | 'should' | 'nice-to-have';
    details: string;                // 詳細説明
  }[];
  estimatedTotalEffort: string;     // 総工数目安
  recommendedTeamSize: string;      // 推奨チームサイズ
  prerequisites: string[];          // 前提条件
}

export interface ExtractedKnowledge {
  blueprint: ImplementationBlueprint;
  businessAnalysis: BusinessAnalysis;
  implementationChecklist: ImplementationChecklist;
}

export async function extractKnowledge(paper: ArxivPaper): Promise<ExtractedKnowledge> {
  const systemPrompt = `あなたは3つの専門家の役割を持っています：

【役割1: シニアAIエンジニア】
この論文から実装可能なブループリント（設計図）を抽出してください。
- Python/LangChain/LlamaIndexを使った実装コード
- 即座にコピー＆ペーストで動かせるレベルの具体性
- 日本のAIエンジニアが読んですぐ理解できる説明

【役割2: AIコンサルタント】
ビジネス価値を分析してください。
- どの業界の、どんな課題を解決できるか
- ROIの根拠を具体的に
- 導入時のリスクも正直に

【役割3: プロジェクトマネージャー】
実装チェックリストを作成してください。
- この手法を自社に導入する際に必要なステップ
- 各ステップの優先度（must/should/nice-to-have）
- 現実的な工数見積もり

【出力形式】JSON
{
  "blueprint": {
    "title": "ブループリントのタイトル",
    "description": "技術的説明（日本語、2-3文）",
    "codeSnippet": "実装コード（Python）",
    "language": "python",
    "prerequisites": ["必要なライブラリ"],
    "difficulty": "beginner|intermediate|advanced",
    "estimatedImplementationTime": "例: 2-3日",
    "keyInsights": ["技術的な重要ポイント1", "ポイント2"]
  },
  "businessAnalysis": {
    "valueProposition": "価値提案（日本語）",
    "targetIndustries": ["業界1", "業界2"],
    "useCases": ["ユースケース1", "ユースケース2"],
    "roiPotential": "high|medium|low",
    "roiReasoning": "ROI根拠（日本語）",
    "competitiveAdvantage": "競合優位性（日本語）",
    "risks": ["リスク1", "リスク2"]
  },
  "implementationChecklist": {
    "items": [
      {
        "category": "カテゴリ",
        "task": "タスク内容",
        "priority": "must|should|nice-to-have",
        "details": "詳細説明"
      }
    ],
    "estimatedTotalEffort": "総工数目安",
    "recommendedTeamSize": "推奨チームサイズ",
    "prerequisites": ["前提条件"]
  }
}`;

  const userPrompt = `
【論文情報】
タイトル: ${paper.title}
アブストラクト: ${paper.summary}
著者: ${paper.authors.join(', ')}
`;

  try {
    const result = await generateJSON<ExtractedKnowledge>(userPrompt, systemPrompt);
    return result;
  } catch (error) {
    console.error('知識抽出エラー:', error);
    return {
      blueprint: {
        title: '抽出エラー',
        description: 'この論文からの知識抽出中にエラーが発生しました',
        codeSnippet: '# エラーが発生しました',
        language: 'python',
        prerequisites: [],
        difficulty: 'intermediate',
        estimatedImplementationTime: '不明',
        keyInsights: [],
      },
      businessAnalysis: {
        valueProposition: 'エラーにより分析できませんでした',
        targetIndustries: [],
        useCases: [],
        roiPotential: 'medium',
        roiReasoning: '',
        competitiveAdvantage: '',
        risks: [],
      },
      implementationChecklist: {
        items: [],
        estimatedTotalEffort: '不明',
        recommendedTeamSize: '不明',
        prerequisites: [],
      },
    };
  }
}
