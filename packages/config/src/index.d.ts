import { z } from 'zod';
declare const envSchema: z.ZodObject<
  {
    DATABASE_URL: z.ZodString;
    GEMINI_API_KEY: z.ZodString;
    GEMINI_MODEL: z.ZodDefault<z.ZodString>;
    GEMINI_EMBEDDING_MODEL: z.ZodDefault<z.ZodString>;
    NEXT_PUBLIC_APP_URL: z.ZodDefault<z.ZodString>;
    PLAYWRIGHT_HEADLESS: z.ZodDefault<z.ZodBoolean>;
    PLAYWRIGHT_STORAGE_DIR: z.ZodDefault<z.ZodString>;
    CRON_SECRET: z.ZodString;
    ENCRYPTION_KEY: z.ZodString;
    NODE_ENV: z.ZodDefault<z.ZodEnum<['development', 'production', 'test']>>;
  },
  'strip',
  z.ZodTypeAny,
  {
    DATABASE_URL: string;
    GEMINI_API_KEY: string;
    GEMINI_MODEL: string;
    GEMINI_EMBEDDING_MODEL: string;
    NEXT_PUBLIC_APP_URL: string;
    PLAYWRIGHT_HEADLESS: boolean;
    PLAYWRIGHT_STORAGE_DIR: string;
    CRON_SECRET: string;
    ENCRYPTION_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  },
  {
    DATABASE_URL: string;
    GEMINI_API_KEY: string;
    CRON_SECRET: string;
    ENCRYPTION_KEY: string;
    GEMINI_MODEL?: string | undefined;
    GEMINI_EMBEDDING_MODEL?: string | undefined;
    NEXT_PUBLIC_APP_URL?: string | undefined;
    PLAYWRIGHT_HEADLESS?: boolean | undefined;
    PLAYWRIGHT_STORAGE_DIR?: string | undefined;
    NODE_ENV?: 'development' | 'production' | 'test' | undefined;
  }
>;
export type Env = z.infer<typeof envSchema>;
export declare function getEnv(): Env;
export declare function resetEnvCache(): void;
export {};
//# sourceMappingURL=index.d.ts.map
