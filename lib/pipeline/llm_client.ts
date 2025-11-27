export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMClient {
    generate(prompt: string, systemPrompt?: string): Promise<LLMResponse>;
    generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T>;
}

// Placeholder for OpenAI or Gemini implementation
export class MockLLMClient implements LLMClient {
    async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
        console.log(`[MockLLM] Generating for prompt: ${prompt.slice(0, 50)}...`);
        return {
            content: "Mock response",
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
        };
    }

    async generateJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
        console.log(`[MockLLM] Generating JSON for prompt: ${prompt.slice(0, 50)}...`);
        // Return a mock object based on expected type - this is just a placeholder
        return {} as T;
    }
}

// Export a singleton or factory
export const llmClient = new MockLLMClient();
