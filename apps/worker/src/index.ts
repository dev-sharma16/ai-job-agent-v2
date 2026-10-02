import { getEnv } from '@job-agent/config';
import { db, closePool } from '@job-agent/db';
import { sql } from 'drizzle-orm';

const env = getEnv();

async function main() {
  console.log('Starting worker...');
  console.log('Environment:', env.NODE_ENV);

  try {
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('Database connection:', result.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  console.log('Worker started successfully');

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await closePool();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await closePool();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Worker failed:', error);
  process.exit(1);
});
