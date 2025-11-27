import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateText } from '@/lib/gemini';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📰 週次ダイジェスト生成開始...');

    // 今週の期間を計算
    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // 既に今週のダイジェストがあるか確認
    const existing = await prisma.weeklyDigest.findFirst({
      where: {
        weekStart: { gte: weekStart },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: '今週のダイジェストは既に生成済みです',
        digestId: existing.id,
      });
    }

    // 今週の選定論文を取得
    const papers = await prisma.paper.findMany({
      where: {
        isSelected: true,
        published: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: { overallScore: 'desc' },
    });

    if (papers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '今週は選定された論文がありませんでした',
      });
    }

    // Geminiでダイジェストを生成
    const paperSummaries = papers
      .map(
        (p, i) =>
          `${i + 1}. 「${p.title}」(スコア: ${p.overallScore}, カテゴリ: ${p.ragComponent})\n` +
          `   要点: ${p.scoreReasoning}`
      )
      .join('\n\n');

    const prompt = `
以下は今週のRAG関連の重要論文リストです。
AIエンジニア・AIコンサルタント向けに、3分で読める週次ダイジェストを作成してください。

【論文リスト】
${paperSummaries}

【出力形式】
## タイトル（キャッチーな1行）

### 今週のハイライト
（3-4文で今週の傾向をまとめる）

### トレンド分析
（技術トレンドの変化や注目すべき動きを2-3文で）

### 各論文の一言コメント
（各論文について、ビジネスパーソンでもわかる1-2文のコメント）
`;

    const digestContent = await generateText(prompt);

    // タイトルとサマリーを抽出
    const lines = digestContent.split('\n').filter((l) => l.trim());
    const title = lines[0]?.replace(/^#+\s*/, '') || `今週のRAGトレンド（${papers.length}本）`;

    // ハイライト部分を抽出
    const highlightMatch = digestContent.match(
      /今週のハイライト[\s\S]*?(?=###|$)/
    );
    const summary = highlightMatch
      ? highlightMatch[0].replace(/.*今週のハイライト\s*/, '').trim()
      : `今週は${papers.length}本の重要論文が選定されました。`;

    // トレンド分析を抽出
    const trendMatch = digestContent.match(
      /トレンド分析[\s\S]*?(?=###|$)/
    );
    const trendAnalysis = trendMatch
      ? trendMatch[0].replace(/.*トレンド分析\s*/, '').trim()
      : '';

    // ダイジェストを保存
    const digest = await prisma.weeklyDigest.create({
      data: {
        weekStart,
        weekEnd,
        title,
        summary,
        trendAnalysis,
        papers: {
          create: papers.map((p) => ({
            paperId: p.id,
            highlight: p.scoreReasoning,
          })),
        },
      },
      include: { papers: true },
    });

    console.log('📰 週次ダイジェスト生成完了:', digest.id);

    return NextResponse.json({
      success: true,
      digestId: digest.id,
      title: digest.title,
      paperCount: papers.length,
    });
  } catch (error) {
    console.error('週次ダイジェスト生成エラー:', error);
    return NextResponse.json(
      { error: 'Failed to generate digest', details: String(error) },
      { status: 500 }
    );
  }
}
