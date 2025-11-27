import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // 最新の週次ダイジェストを取得
    const latestDigest = await prisma.weeklyDigest.findFirst({
      orderBy: { weekStart: 'desc' },
      include: {
        papers: {
          include: {
            paper: {
              select: {
                id: true,
                title: true,
                summary: true,
                authors: true,
                overallScore: true,
                ragComponent: true,
                published: true,
              },
            },
          },
        },
      },
    });

    // ダイジェストがない場合は、最新の選定論文からサマリーを生成
    if (!latestDigest) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const recentPapers = await prisma.paper.findMany({
        where: {
          isSelected: true,
          published: {
            gte: weekStart,
          },
        },
        orderBy: { overallScore: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          summary: true,
          authors: true,
          overallScore: true,
          ragComponent: true,
          published: true,
          scoreReasoning: true,
        },
      });

      return NextResponse.json({
        weekStart: weekStart.toISOString(),
        weekEnd: new Date().toISOString(),
        title: '今週のRAGナレッジ',
        summary: recentPapers.length > 0
          ? `今週は${recentPapers.length}本の重要論文を選定しました。`
          : 'まだ論文が登録されていません。',
        trendAnalysis: '',
        papers: recentPapers.map((p) => ({
          paper: p,
          highlight: p.scoreReasoning,
        })),
      });
    }

    return NextResponse.json(latestDigest);
  } catch (error) {
    console.error('ダイジェスト取得エラー:', error);
    return NextResponse.json(
      { error: 'Failed to fetch digest' },
      { status: 500 }
    );
  }
}
