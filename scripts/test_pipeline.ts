import { fetchDailyRAGPapers } from '../lib/pipeline/arxiv_fetcher';
import { filterPaper } from '../lib/pipeline/filter_agent';
import { extractKnowledge } from '../lib/pipeline/knowledge_extractor';

async function runPipeline() {
    console.log("1. Fetching papers...");
    const papers = await fetchDailyRAGPapers(3); // Fetch top 3 for testing
    console.log(`Fetched ${papers.length} papers.`);

    for (const paper of papers) {
        console.log(`\nProcessing: ${paper.title}`);

        console.log("2. Filtering...");
        const score = await filterPaper(paper);
        console.log(`Score: ${score.overallScore}/10 (Relevant: ${score.isRelevant})`);

        if (score.isRelevant) {
            console.log("3. Extracting Knowledge...");
            const knowledge = await extractKnowledge(paper);
            console.log("Blueprint Language:", knowledge.blueprint.language);
            console.log("Pitch Deck Value:", knowledge.pitchDeck.businessValue);
            console.log("RAG Component:", knowledge.ragComponent);
        } else {
            console.log("Skipping extraction (not relevant enough).");
        }
    }
}

runPipeline().catch(console.error);
