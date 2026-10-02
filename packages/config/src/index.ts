import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-flash-latest'),
  GEMINI_EMBEDDING_MODEL: z.string().default('text-embedding-004'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  PLAYWRIGHT_HEADLESS: z.coerce.boolean().default(false),
  PLAYWRIGHT_STORAGE_DIR: z.string().default('.playwright'),
  CRON_SECRET: z.string().min(1).optional(),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function resetEnvCache(): void {
  cachedEnv = null;
}
