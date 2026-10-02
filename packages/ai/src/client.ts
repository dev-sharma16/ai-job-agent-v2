import { GoogleGenAI } from '@google/genai';
import { getEnv } from '@job-agent/config';

const env = getEnv();

export const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export const GEMINI_MODEL = env.GEMINI_MODEL;
export const GEMINI_EMBEDDING_MODEL = env.GEMINI_EMBEDDING_MODEL;

export async function generateContent<T>(
  prompt: string,
  schema: any,
  options?: { temperature?: number; maxRetries?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: options?.temperature ?? 0.1,
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return JSON.parse(text) as T;
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error) {
        if (
          error.message.includes('429') ||
          error.message.includes('503') ||
          error.message.includes('500')
        ) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
          console.warn(
            `Gemini API error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
            error.message
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError ?? new Error('Failed to generate content after retries');
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: text,
      });

      if (!response.embeddings || response.embeddings.length === 0) {
        throw new Error('No embeddings returned');
      }

      return response.embeddings[0].values ?? [];
    } catch (error) {
      lastError = error as Error;

      if (error instanceof Error) {
        if (
          error.message.includes('429') ||
          error.message.includes('503') ||
          error.message.includes('500')
        ) {
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 30000);
          console.warn(
            `Gemini embedding error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
            error.message
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      throw error;
    }
  }

  throw lastError ?? new Error('Failed to generate embedding after retries');
}
