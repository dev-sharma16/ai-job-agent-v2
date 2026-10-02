import { defineConfig } from 'drizzle-kit';
import { getEnv } from '@job-agent/config';

const env = getEnv();

export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
