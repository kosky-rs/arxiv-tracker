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

  // 有名著者ボーナス（控えめに）
  for (const author of authors) {
    for (const notable of NOTABLE_AUTHORS) {
      if (author.toLowerCase().includes(notable.toLowerCase())) {
        bonus += 1;
        break;
      }
    }
  }

  // 有名機関ボーナス（控えめに）
  bonus += Math.min(institutions.length * 0.5, 2);

  return Math.min(bonus, 3); // 最大3点ボーナス（以前は5点）
}

export async function evaluatePaper(paper: ArxivPaper): Promise<PaperEvaluation> {
  const institutions = detectInstitutions(paper.authors, paper.summary);
  const authorityBonus = calculateAuthorityBonus(paper.authors, institutions);

  const systemPrompt = `あなたはRAG（Retrieval-Augmented Generation）の世界的エキスパートです。
以下の論文を**極めて厳格に**評価してください。1日に1-3件程度しか選ばれないレベルの厳しさで評価してください。

【評価基準】
1. relevanceScore (0-10): RAGシステムへの直接的な貢献度
   - 10: RAGの核心技術（検索・生成・評価）に直接的な革新をもたらす画期的な手法
   - 8-9: RAGパイプラインの重要な課題を解決する明確な改善
   - 6-7: RAGに関連するが、既存手法の小さな改良程度
   - 0-5: RAGとの直接的な関連が不明確、または周辺技術にすぎない

   ※「RAG」という単語が出てくるだけでは不十分。具体的な技術的貢献が必須。

2. noveltyScore (0-10): 技術的な新規性
   - 10: 全く新しいアプローチで、業界標準になる可能性がある
   - 8-9: 既存研究を大幅に超える独創的なアイデア
   - 6-7: 既存手法の組み合わせや小さな改良
   - 0-5: 既知の手法の再実装やベンチマーク報告のみ

3. practicalScore (0-10): 実用性・実装容易性
   - 10: コードがあり、すぐにプロダクションで使える
   - 8-9: 具体的な実装方法が示されており、再現可能
   - 6-7: 概念は理解できるが、実装の詳細が不足
   - 0-5: 理論的すぎる、または実装コストが非常に高い

4. ragComponent: 以下から最も適切なものを1つ選択
   - "Chunking": テキスト分割・前処理
   - "Embedding": ベクトル化・エンコーディング
   - "Retrieval": 検索・取得
   - "Reranking": 再ランク付け
   - "Generation": 生成・応答
   - "Orchestration": 全体制御・エージェント
   - "Evaluation": 評価・品質測定
   - "Other": その他

【重要】
- 本当に革新的で実用的な論文のみを高得点にしてください
- 「RAGについて言及している」程度では不十分です
- ベンチマーク結果の報告のみの論文は低評価です
- サーベイ論文は基本的に選定対象外です

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

    // 権威性スコアは機関・著者から自動計算（ベース3点、最大6点）
    const authorityScore = Math.min(3 + authorityBonus, 6);

    // 総合スコア計算（重み付け: 関連性と新規性を重視）
    const overallScore = Math.round(
      result.relevanceScore * 0.40 +  // 関連性の重みを増加（0.35 → 0.40）
      result.noveltyScore * 0.30 +     // 新規性の重みを増加（0.25 → 0.30）
      authorityScore * 0.10 +          // 権威性の重みを減少（0.15 → 0.10）
      result.practicalScore * 0.20     // 実用性の重みを減少（0.25 → 0.20）
    );

    // 厳格な選定基準: 総合8以上 かつ 関連性8以上 かつ (新規性7以上 または 実用性8以上)
    const shouldSelect =
      overallScore >= 8 &&
      result.relevanceScore >= 8 &&
      (result.noveltyScore >= 7 || result.practicalScore >= 8);

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
