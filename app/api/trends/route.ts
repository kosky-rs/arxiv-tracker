import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const RAG_COMPONENTS = [
  'Chunking',
  'Embedding',
  'Retrieval',
  'Reranking',
  'Generation',
  'Orchestration',
  'Evaluation',
];

export async function GET() {
  try {
    // 過去30日のトレンドデータを取得
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const papers = await prisma.paper.findMany({
      where: {
        isSelected: true,
        published: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        ragComponent: true,
        overallScore: true,
        published: true,
      },
    });

    // コンポーネント別統計
    const componentStats = RAG_COMPONENTS.map((component) => {
      const componentPapers = papers.filter((p) => p.ragComponent === component);
      return {
        component,
        count: componentPapers.length,
        avgScore:
          componentPapers.length > 0
            ? Math.round(
                componentPapers.reduce((sum, p) => sum + p.overallScore, 0) /
                  componentPapers.length * 10
              ) / 10
            : 0,
      };
    });

    // 週次トレンド（過去4週間）
    const weeklyTrends = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekPapers = papers.filter((p) => {
        const pubDate = new Date(p.published);
        return pubDate >= weekStart && pubDate < weekEnd;
      });

      weeklyTrends.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        total: weekPapers.length,
        byComponent: RAG_COMPONENTS.reduce((acc, comp) => {
          acc[comp] = weekPapers.filter((p) => p.ragComponent === comp).length;
          return acc;
        }, {} as Record<string, number>),
      });
    }

    // ホットトピック（スコア高い順）
    const topPapers = await prisma.paper.findMany({
      where: {
        isSelected: true,
        published: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { overallScore: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        overallScore: true,
        ragComponent: true,
        published: true,
      },
    });

    return NextResponse.json({
      componentStats,
      weeklyTrends: weeklyTrends.reverse(),
      topPapers,
      summary: {
        totalPapers: papers.length,
        avgScore:
          papers.length > 0
            ? Math.round(
                papers.reduce((sum, p) => sum + p.overallScore, 0) /
                  papers.length * 10
              ) / 10
            : 0,
        mostActiveComponent: componentStats.reduce(
          (max, c) => (c.count > max.count ? c : max),
          componentStats[0]
        )?.component || 'なし',
      },
    });
  } catch (error) {
    console.error('トレンド取得エラー:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trends' },
      { status: 500 }
    );
  }
}
