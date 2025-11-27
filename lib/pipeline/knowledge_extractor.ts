import { ArxivPaper } from './arxiv_fetcher';
import { llmClient } from './llm_client';

export interface ImplementationBlueprint {
    codeSnippet: string; // Python/LangChain code
    language: string;
    description: string;
    prerequisites: string[];
}

export interface PitchDeck {
    businessValue: string;
    targetIndustries: string[];
    roiPotential: string;
    hypeVsRealityScore: number; // 0-10
    keyTakeaways: string[];
}

export interface ExtractedKnowledge {
    blueprint: ImplementationBlueprint;
    pitchDeck: PitchDeck;
    ragComponent: string; // e.g., "Retriever", "Generator", "Reranker"
}

export async function extractKnowledge(paper: ArxivPaper): Promise<ExtractedKnowledge> {
    const systemPrompt = `You are a dual-expert: a Senior AI Engineer and a Strategy Consultant.
  
  Task 1 (Engineer): Extract a practical implementation blueprint from this paper. Provide pseudo-code or Python code (using LangChain/LlamaIndex concepts) that demonstrates the core idea.
  Task 2 (Consultant): Analyze the business value. Who needs this? What is the ROI?
  Task 3 (Classifier): Where does this fit in the RAG pipeline? (Chunking, Embedding, Retrieval, Reranking, Generation, Orchestration)
  
  Output JSON format:
  {
    "blueprint": {
      "codeSnippet": "code string...",
      "language": "python",
      "description": "Short tech description",
      "prerequisites": ["List of libs"]
    },
    "pitchDeck": {
      "businessValue": "High-level value prop",
      "targetIndustries": ["Industry 1", "Industry 2"],
      "roiPotential": "High/Medium/Low and why",
      "hypeVsRealityScore": number (0-10, 10=Real Deal),
      "keyTakeaways": ["Point 1", "Point 2"]
    },
    "ragComponent": "Component Name"
  }`;

    const userPrompt = `Title: ${paper.title}
  Abstract: ${paper.summary}`;

    try {
        // const result = await llmClient.generateJSON<ExtractedKnowledge>(userPrompt, systemPrompt);

        // Mock response
        return {
            blueprint: {
                codeSnippet: `
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import LLMChainExtractor

# Example usage of the concept from ${paper.title.substring(0, 20)}...
def improved_retrieval(query):
    # This is a placeholder for the actual implementation derived from the paper
    pass
        `.trim(),
                language: "python",
                description: "Implements the contextual compression technique proposed in the paper.",
                prerequisites: ["langchain", "openai"]
            },
            pitchDeck: {
                businessValue: "Reduces hallucination by 30% in finance applications.",
                targetIndustries: ["Finance", "Legal"],
                roiPotential: "High - reduces manual verification time.",
                hypeVsRealityScore: 9,
                keyTakeaways: ["Novel reranking method", "Easy to integrate"]
            },
            ragComponent: "Reranking"
        };
    } catch (error) {
        console.error("Error extracting knowledge:", error);
        return {
            blueprint: { codeSnippet: "", language: "", description: "Error", prerequisites: [] },
            pitchDeck: { businessValue: "Error", targetIndustries: [], roiPotential: "", hypeVsRealityScore: 0, keyTakeaways: [] },
            ragComponent: "Unknown"
        };
    }
}
