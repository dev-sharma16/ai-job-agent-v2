import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { getEnv } from '@job-agent/config';

const env = getEnv();

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;

export async function closePool(): Promise<void> {
  await pool.end();
}
