import { generateJSON } from '@/lib/gemini';
import { ArxivPaper } from './arxiv_fetcher';

// 有名な研究機関・大学のリスト（権威性評価用）
const PRESTIGIOUS_INSTITUTIONS = [
  // 米国トップ大学
  'Stanford', 'MIT', 'Berkeley', 'CMU', 'Carnegie Mellon', 'Harvard', 'Princeton',
  'University of Washington', 'Cornell', 'UCLA', 'UIUC', 'Georgia Tech',
  // 海外トップ大学
  'Oxford', 'Cambridge', 'ETH Zurich', 'University of Toronto', 'Tsinghua', 'Peking',
  'National University of Singapore', 'KAIST', 'University of Tokyo', 'Kyoto University',
  // トップ企業研究機関
  'Google', 'DeepMind', 'OpenAI', 'Anthropic', 'Meta AI', 'Microsoft Research',
  'Amazon', 'NVIDIA', 'Apple', 'Alibaba', 'Tencent', 'ByteDance', 'Baidu',
  'Cohere', 'Hugging Face', 'AI2', 'Allen Institute',
];

// 有名なRAG研究者（権威性評価用）
const NOTABLE_AUTHORS = [
  'Patrick Lewis', 'Ethan Perez', 'Douwe Kiela', 'Sebastian Riedel',
  'Danqi Chen', 'Percy Liang', 'Christopher Manning', 'Dan Jurafsky',
  'Jacob Devlin', 'Kenton Lee', 'Kristina Toutanova', 'Luke Zettlemoyer',
  'Omar Khattab', 'Matei Zaharia', // ColBERT/DSPy authors
  'Jason Wei', 'Denny Zhou', // Chain-of-thought authors
  'Sewon Min', 'Mike Lewis', 'Wen-tau Yih',
];

export interface PaperEvaluation {
  relevanceScore: number;      // RAG関連性 0-10
  noveltyScore: number;        // 新規性・独自性 0-10
  authorityScore: number;      // 著者・機関の権威性 0-10
  practicalScore: number;      // 実用性・即座に使えるか 0-10
  overallScore: number;        // 総合スコア 0-10
  reasoning: string;           // 評価理由（日本語）
  ragComponent: string;        // RAGパイプラインのどこに該当するか
  shouldSelect: boolean;       // 選定すべきか
  institutions: string[];      // 検出された機関
}

function detectInstitutions(authors: string[], summary: string): string[] {
  const detected: string[] = [];
  const text = `${authors.join(' ')} ${summary}`;

  for (const inst of PRESTIGIOUS_INSTITUTIONS) {
    if (text.toLowerCase().includes(inst.toLowerCase())) {
      detected.push(inst);
    }
  }

  return [...new Set(detected)];
}

function calculateAuthorityBonus(authors: string[], institutions: string[]): number {
  let bonus = 0;

  // 有名著者ボーナス
  for (const author of authors) {
    for (const notable of NOTABLE_AUTHORS) {
      if (author.toLowerCase().includes(notable.toLowerCase())) {
        bonus += 2;
        break;
      }
    }
  }

  // 有名機関ボーナス
  bonus += Math.min(institutions.length * 1.5, 4);

  return Math.min(bonus, 5); // 最大5点ボーナス
}

export async function evaluatePaper(paper: ArxivPaper): Promise<PaperEvaluation> {
  const institutions = detectInstitutions(paper.authors, paper.summary);
  const authorityBonus = calculateAuthorityBonus(paper.authors, institutions);

  const systemPrompt = `あなたはRAG（Retrieval-Augmented Generation）の世界的エキスパートです。
以下の論文を厳格に評価してください。

【評価基準】
1. relevanceScore (0-10): RAGシステムへの直接的な貢献度
   - 10: RAGの核心技術に直接的な革新をもたらす
   - 7-9: RAGの重要な側面を大幅に改善
   - 4-6: RAGに関連するが、間接的
   - 0-3: RAGとの関連が薄い

2. noveltyScore (0-10): 技術的な新規性
   - 10: パラダイムシフトを起こす可能性がある
   - 7-9: 既存手法を大幅に超える新しいアプローチ
   - 4-6: 既存手法の改良・組み合わせ
   - 0-3: 既知の手法の小さな変更

3. practicalScore (0-10): 実用性・実装容易性
   - 10: すぐにプロダクションで使える具体的な手法
   - 7-9: 少しの調整で実装可能
   - 4-6: 概念は有用だが実装にハードルがある
   - 0-3: 理論的で実用には遠い

4. ragComponent: 以下から最も適切なものを1つ選択
   - "Chunking": テキスト分割・前処理
   - "Embedding": ベクトル化・エンコーディング
   - "Retrieval": 検索・取得
   - "Reranking": 再ランク付け
   - "Generation": 生成・応答
   - "Orchestration": 全体制御・エージェント
   - "Evaluation": 評価・品質測定
   - "Other": その他

【選定基準】
総合スコア7以上、かつRAG関連性6以上のみを選定してください。
「量より質」を重視し、本当に価値のある論文のみを選んでください。

【出力形式】JSON
{
  "relevanceScore": number,
  "noveltyScore": number,
  "practicalScore": number,
  "ragComponent": string,
  "reasoning": "評価理由を日本語で2-3文で簡潔に"
}`;

  const userPrompt = `
タイトル: ${paper.title}
著者: ${paper.authors.join(', ')}
アブストラクト: ${paper.summary}
カテゴリ: ${paper.category.join(', ')}
検出された機関: ${institutions.length > 0 ? institutions.join(', ') : '特定できず'}
`;

  try {
    const result = await generateJSON<{
      relevanceScore: number;
      noveltyScore: number;
      practicalScore: number;
      ragComponent: string;
      reasoning: string;
    }>(userPrompt, systemPrompt);

    // 権威性スコアは機関・著者から自動計算
    const authorityScore = Math.min(5 + authorityBonus, 10);

    // 総合スコア計算（重み付け）
    const overallScore = Math.round(
      result.relevanceScore * 0.35 +
      result.noveltyScore * 0.25 +
      authorityScore * 0.15 +
      result.practicalScore * 0.25
    );

    // 選定基準: 総合7以上 かつ 関連性6以上（緩和版）
    const shouldSelect = overallScore >= 7 && result.relevanceScore >= 6;

    return {
      relevanceScore: result.relevanceScore,
      noveltyScore: result.noveltyScore,
      authorityScore,
      practicalScore: result.practicalScore,
      overallScore,
      reasoning: result.reasoning,
      ragComponent: result.ragComponent,
      shouldSelect,
      institutions,
    };
  } catch (error) {
    console.error('論文評価エラー:', error);
    return {
      relevanceScore: 0,
      noveltyScore: 0,
      authorityScore: 0,
      practicalScore: 0,
      overallScore: 0,
      reasoning: '評価中にエラーが発生しました',
      ragComponent: 'Other',
      shouldSelect: false,
      institutions: [],
    };
  }
}
