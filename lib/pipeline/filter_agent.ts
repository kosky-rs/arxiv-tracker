import { ArxivPaper } from './arxiv_fetcher';
import { llmClient } from './llm_client';

export interface PaperScore {
    relevance: number; // 0-10
    novelty: number; // 0-10
    clarity: number; // 0-10
    overallScore: number; // 0-10
    reasoning: string;
    isRelevant: boolean; // Threshold based
}

export async function filterPaper(paper: ArxivPaper): Promise<PaperScore> {
    const systemPrompt = `You are an expert AI researcher specializing in RAG (Retrieval-Augmented Generation). 
  Your task is to evaluate the following research paper for its relevance to practical RAG implementation and its potential impact.
  
  Criteria:
  - Relevance: How directly does this apply to improving RAG systems?
  - Novelty: Does it propose a new technique or just a minor tweak?
  - Clarity: Is the abstract clear and promising?
  
  Output JSON format:
  {
    "relevance": number (0-10),
    "novelty": number (0-10),
    "clarity": number (0-10),
    "overallScore": number (0-10),
    "reasoning": "Short explanation",
    "isRelevant": boolean (true if overallScore >= 7)
  }`;

    const userPrompt = `Title: ${paper.title}
  Authors: ${paper.authors.join(', ')}
  Abstract: ${paper.summary}
  Categories: ${paper.category.join(', ')}`;

    try {
        // In a real scenario, we would use the LLM client
        // const result = await llmClient.generateJSON<PaperScore>(userPrompt, systemPrompt);

        // For now, return a mock score
        return {
            relevance: 8,
            novelty: 7,
            clarity: 9,
            overallScore: 8,
            reasoning: "Mock reasoning: This paper seems to address a key bottleneck in retrieval.",
            isRelevant: true
        };
    } catch (error) {
        console.error("Error filtering paper:", error);
        return {
            relevance: 0,
            novelty: 0,
            clarity: 0,
            overallScore: 0,
            reasoning: "Error during evaluation",
            isRelevant: false
        };
    }
}
