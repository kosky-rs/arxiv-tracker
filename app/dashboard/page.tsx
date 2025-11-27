import { TrendRadar } from '@/components/dashboard/trend-radar';
import { BlueprintCard } from '@/components/dashboard/blueprint-card';
import { PitchDeckCard } from '@/components/dashboard/pitch-deck-card';
import { fetchDailyRAGPapers } from '@/lib/pipeline/arxiv_fetcher';
import { filterPaper } from '@/lib/pipeline/filter_agent';
import { extractKnowledge } from '@/lib/pipeline/knowledge_extractor';

export const revalidate = 3600; // Revalidate every hour

export default async function DashboardPage() {
    // 1. Fetch Papers
    const papers = await fetchDailyRAGPapers(5); // Fetch top 5 for demo

    // 2. Process Papers (Filter & Extract)
    // In a real app, this would be done by a background worker and stored in DB.
    // For this MVP, we do it on-the-fly (slow, but works for demo).
    const processedPapers = await Promise.all(
        papers.map(async (paper) => {
            const score = await filterPaper(paper);
            if (!score.isRelevant) return null;

            const knowledge = await extractKnowledge(paper);
            return { paper, score, knowledge };
        })
    );

    const relevantPapers = processedPapers.filter((p): p is NonNullable<typeof p> => p !== null);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-8">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        Knowledge Hub Dashboard
                    </h1>
                    <p className="text-slate-400">Daily intelligence briefing for {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">{relevantPapers.length}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider">New Insights</div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column: Radar & Trends */}
                <div className="lg:col-span-1 space-y-6">
                    <TrendRadar />

                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6 backdrop-blur-sm">
                        <h3 className="text-lg font-semibold mb-4 text-slate-200">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Total Papers Scanned</span>
                                <span className="font-mono text-white">{papers.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Relevance Rate</span>
                                <span className="font-mono text-green-400">
                                    {Math.round((relevantPapers.length / papers.length) * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Paper Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-xl font-semibold text-slate-200">Latest High-Impact Papers</h3>

                    {relevantPapers.map(({ paper, score, knowledge }) => (
                        <div key={paper.id} className="bg-slate-900/30 rounded-xl border border-slate-800 p-6 hover:border-slate-700 transition-colors">
                            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            {knowledge.ragComponent}
                                        </span>
                                        <span className="text-xs text-slate-500">{new Date(paper.published).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2 leading-tight">{paper.title}</h2>
                                    <p className="text-slate-400 text-sm line-clamp-2 mb-3">{paper.summary}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {paper.authors.slice(0, 3).map(author => (
                                            <span key={author} className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                                                {author}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center justify-center min-w-[80px] bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                                    <span className="text-2xl font-bold text-white">{score.overallScore}</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Impact</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <BlueprintCard
                                    language={knowledge.blueprint.language}
                                    code={knowledge.blueprint.codeSnippet}
                                    description={knowledge.blueprint.description}
                                />
                                <PitchDeckCard
                                    businessValue={knowledge.pitchDeck.businessValue}
                                    roiPotential={knowledge.pitchDeck.roiPotential}
                                    targetIndustries={knowledge.pitchDeck.targetIndustries}
                                    hypeScore={knowledge.pitchDeck.hypeVsRealityScore}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
