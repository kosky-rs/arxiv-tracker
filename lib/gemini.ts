import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export function getGeminiModel(modelName: string = 'gemini-2.5-flash'): GenerativeModel {
  return genAI.getGenerativeModel({ model: modelName });
}

export async function generateJSON<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  const model = getGeminiModel('gemini-2.5-flash');

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt}\n\nRespond with valid JSON only, no markdown code blocks.`
    : `${prompt}\n\nRespond with valid JSON only, no markdown code blocks.`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  const text = response.text();

  // Clean up potential markdown code blocks
  const cleanedText = text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  return JSON.parse(cleanedText) as T;
}

export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const model = getGeminiModel('gemini-2.5-flash');

  const fullPrompt = systemPrompt
    ? `${systemPrompt}\n\n${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = result.response;
  return response.text();
}
