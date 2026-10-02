import { GoogleGenAI } from '@google/genai';
export declare const ai: GoogleGenAI;
export declare const GEMINI_MODEL: string;
export declare const GEMINI_EMBEDDING_MODEL: string;
export declare function generateContent<T>(
  prompt: string,
  schema: any,
  options?: {
    temperature?: number;
    maxRetries?: number;
  }
): Promise<T>;
export declare function generateEmbedding(text: string): Promise<number[]>;
//# sourceMappingURL=client.d.ts.map
