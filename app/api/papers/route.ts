import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const component = searchParams.get('component');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const selectedOnly = searchParams.get('selected') !== 'false';

  try {
    const papers = await prisma.paper.findMany({
      where: {
        isSelected: selectedOnly ? true : undefined,
        ragComponent: component || undefined,
      },
      orderBy: [
        { overallScore: 'desc' },
        { published: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    const total = await prisma.paper.count({
      where: {
        isSelected: selectedOnly ? true : undefined,
        ragComponent: component || undefined,
      },
    });

    return NextResponse.json({
      papers,
      total,
      hasMore: offset + papers.length < total,
    });
  } catch (error) {
    console.error('論文取得エラー:', error);
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    );
  }
}
