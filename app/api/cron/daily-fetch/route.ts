import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchDailyRAGPapers } from '@/lib/pipeline/arxiv_fetcher';
import { evaluatePaper } from '@/lib/pipeline/paper-evaluator';
import { extractKnowledge } from '@/lib/pipeline/knowledge-extractor';

export const maxDuration = 300; // 5分タイムアウト
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Vercel Cron認証
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('📚 日次論文取得バッチ開始...');

    // 1. arXivから最新論文を取得（多めに取得して厳選）
    const papers = await fetchDailyRAGPapers(30);
    console.log(`取得した論文数: ${papers.length}`);

    if (papers.length === 0) {
      return NextResponse.json({
        success: true,
        message: '新しい論文が見つかりませんでした',
        stats: { fetched: 0, selected: 0 },
      });
    }

    // 2. 各論文を評価
    const results = {
      fetched: papers.length,
      evaluated: 0,
      selected: 0,
      errors: 0,
    };

    for (const paper of papers) {
      try {
        // 既に処理済みか確認
        const existing = await prisma.paper.findUnique({
          where: { id: paper.id },
        });

        if (existing) {
          console.log(`スキップ（処理済み）: ${paper.title.slice(0, 50)}...`);
          continue;
        }

        // 論文を評価
        const evaluation = await evaluatePaper(paper);
        results.evaluated++;

        console.log(
          `評価完了: ${paper.title.slice(0, 40)}... ` +
          `[総合: ${evaluation.overallScore}, 関連性: ${evaluation.relevanceScore}] ` +
          `${evaluation.shouldSelect ? '✅ 選定' : '❌ 非選定'}`
        );

        if (!evaluation.shouldSelect) {
          // 選定されなかった論文も記録（次回スキップ用）
          await prisma.paper.create({
            data: {
              id: paper.id,
              title: paper.title,
              summary: paper.summary,
              authors: paper.authors,
              institutions: evaluation.institutions,
              published: new Date(paper.published),
              updated: new Date(paper.updated),
              link: paper.link,
              categories: paper.category,
              relevanceScore: evaluation.relevanceScore,
              noveltyScore: evaluation.noveltyScore,
              authorityScore: evaluation.authorityScore,
              practicalScore: evaluation.practicalScore,
              overallScore: evaluation.overallScore,
              scoreReasoning: evaluation.reasoning,
              ragComponent: evaluation.ragComponent,
              blueprint: {},
              businessAnalysis: {},
              implementationChecklist: {},
              isSelected: false,
              processedAt: new Date(),
            },
          });
          continue;
        }

        // 3. 選定された論文から知識を抽出
        const knowledge = await extractKnowledge(paper);
        results.selected++;

        // 4. DBに保存
        await prisma.paper.create({
          data: {
            id: paper.id,
            title: paper.title,
            summary: paper.summary,
            authors: paper.authors,
            institutions: evaluation.institutions,
            published: new Date(paper.published),
            updated: new Date(paper.updated),
            link: paper.link,
            categories: paper.category,
            relevanceScore: evaluation.relevanceScore,
            noveltyScore: evaluation.noveltyScore,
            authorityScore: evaluation.authorityScore,
            practicalScore: evaluation.practicalScore,
            overallScore: evaluation.overallScore,
            scoreReasoning: evaluation.reasoning,
            ragComponent: evaluation.ragComponent,
            blueprint: JSON.parse(JSON.stringify(knowledge.blueprint)),
            businessAnalysis: JSON.parse(JSON.stringify(knowledge.businessAnalysis)),
            implementationChecklist: JSON.parse(JSON.stringify(knowledge.implementationChecklist)),
            isSelected: true,
            processedAt: new Date(),
          },
        });

        console.log(`💾 保存完了: ${paper.title.slice(0, 50)}...`);

        // API制限対策のため少し待機
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`論文処理エラー (${paper.id}):`, error);
        results.errors++;
      }
    }

    console.log('📚 日次バッチ完了:', results);

    return NextResponse.json({
      success: true,
      stats: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('日次バッチエラー:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
