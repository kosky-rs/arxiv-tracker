import { NextRequest, NextResponse } from 'next/server';
import { fetchMonthlyRAGPapers } from '@/lib/pipeline/arxiv_fetcher';
import { evaluatePaper } from '@/lib/pipeline/paper-evaluator';
import { extractKnowledge } from '@/lib/pipeline/knowledge-extractor';
import { prisma } from '@/lib/db';

export const maxDuration = 300; // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Backfill November] Starting backfill for November 2025...');

    // Fetch papers from November 2025
    const papers = await fetchMonthlyRAGPapers(2025, 11, 100); // Get up to 100 papers
    console.log(`[Backfill November] Fetched ${papers.length} papers from November 2025`);

    let evaluated = 0;
    let selected = 0;
    let errors = 0;

    for (const paper of papers) {
      try {
        // Check if paper already exists
        const existing = await prisma.paper.findUnique({
          where: { id: paper.id },
        });

        if (existing) {
          console.log(`[Backfill November] Paper ${paper.id} already exists, skipping...`);
          continue;
        }

        // Evaluate paper
        const evaluation = await evaluatePaper(paper);
        evaluated++;

        console.log(`[Backfill November] Paper ${paper.id}: Score=${evaluation.overallScore}, Selected=${evaluation.shouldSelect}`);

        if (!evaluation.shouldSelect) {
          // Save as non-selected to avoid re-evaluating
          await prisma.paper.create({
            data: {
              id: paper.id,
              title: paper.title,
              summary: paper.summary,
              authors: paper.authors,
              institutions: [],
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
              fetchedAt: new Date(),
              processedAt: new Date(),
            },
          });
          continue;
        }

        // Extract knowledge for selected papers
        const knowledge = await extractKnowledge(paper);
        selected++;

        // Save to database
        await prisma.paper.create({
          data: {
            id: paper.id,
            title: paper.title,
            summary: paper.summary,
            authors: paper.authors,
            institutions: knowledge.institutions || [],
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
            fetchedAt: new Date(),
            processedAt: new Date(),
          },
        });

        console.log(`[Backfill November] ✓ Selected and saved paper: ${paper.title}`);
      } catch (error) {
        console.error(`[Backfill November] Error processing paper ${paper.id}:`, error);
        errors++;
      }
    }

    console.log('[Backfill November] Backfill completed');

    return NextResponse.json({
      success: true,
      stats: {
        fetched: papers.length,
        evaluated,
        selected,
        errors,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Backfill November] Fatal error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
