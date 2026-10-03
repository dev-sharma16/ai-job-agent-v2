import { getEnv } from '@job-agent/config';
import { db, closePool } from '@job-agent/db';
import { sql } from 'drizzle-orm';
import PgBoss from 'pg-boss';
import { runIngestion } from './jobs/ingest';
import { runHardFilters } from './jobs/filter';
import { runAnalysis } from './jobs/analyze';
import { runEmbeddingGeneration } from './jobs/embed';
import { runResumeTailoring } from './jobs/resumeTailoring';
import { runPDFGeneration } from './jobs/pdfGeneration';
import { runApplicationPrep } from './jobs/applicationPrep';
import { runStatusCheck } from './jobs/statusCheck';
import { runEmailIngestionJob } from './jobs/emailIngestion';
import { ResumeTrack } from '@job-agent/domain';

const env = getEnv();

let boss: PgBoss | null = null;

async function initializeQueue() {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  boss = new PgBoss(databaseUrl);
  await boss.start();
  console.log('pg-boss queue started');

  // Define job handlers
  boss.work('discover-jobs', { teamSize: 1 }, async () => {
    console.log('[discover-jobs] Starting job ingestion...');
    const result = await runIngestion();
    console.log('[discover-jobs] Completed:', result);
    return result;
  });

  boss.work('filter-jobs', { teamSize: 1 }, async () => {
    console.log('[filter-jobs] Running hard filters...');
    const result = await runHardFilters();
    console.log('[filter-jobs] Completed:', result);
    return result;
  });

  boss.work('analyze-jobs', { teamSize: 2 }, async () => {
    console.log('[analyze-jobs] Running AI analysis...');
    const result = await runAnalysis();
    console.log('[analyze-jobs] Completed:', result);
    return result;
  });

  boss.work('generate-embeddings', { teamSize: 2 }, async () => {
    console.log('[generate-embeddings] Generating embeddings...');
    const result = await runEmbeddingGeneration();
    console.log('[generate-embeddings] Completed:', result);
    return result;
  });

  boss.work('tailor-resume', { teamSize: 2 }, async (job: PgBoss.Job) => {
    const { jobId, track } = job.data as { jobId: string; track: ResumeTrack };
    console.log(`[tailor-resume] Tailoring resume for job ${jobId} (${track})...`);
    const result = await runResumeTailoring({ jobId, resumeTrack: track });
    console.log('[tailor-resume] Completed:', result);
    return result;
  });

  boss.work('generate-pdf', { teamSize: 1 }, async (job: PgBoss.Job) => {
    const { resumeId } = job.data as { resumeId: string };
    console.log(`[generate-pdf] Generating PDF for resume ${resumeId}...`);
    const result = await runPDFGeneration({ resumeId });
    console.log('[generate-pdf] Completed:', result);
    return result;
  });

  boss.work('prepare-application', { teamSize: 1 }, async (job: PgBoss.Job) => {
    const { jobId, resumeId, resumeTrack, resumePdfPath } = job.data as {
      jobId: string;
      resumeId: string;
      resumeTrack: ResumeTrack;
      resumePdfPath: string;
    };
    console.log(`[prepare-application] Preparing application for job ${jobId} with resume ${resumeId}...`);
    const result = await runApplicationPrep({ jobId, resumeId, resumeTrack, resumePdfPath });
    console.log('[prepare-application] Completed:', result);
    return result;
  });

  boss.work('check-application-status', { teamSize: 2 }, async (job: PgBoss.Job) => {
    const { applicationId } = job.data as { applicationId: string };
    console.log(`[check-application-status] Checking status for application ${applicationId}...`);
    const result = await runStatusCheck({ applicationId });
    console.log('[check-application-status] Completed:', result);
    return result;
  });

  boss.work('check-all-application-statuses', { teamSize: 1 }, async () => {
    console.log('[check-all-application-statuses] Checking all pending applications...');
    const pendingApps = await db.query.applications.findMany({
      where: (applications, { inArray }) =>
        inArray(applications.status, ['preparing', 'applying', 'ready_for_review', 'approved']),
      columns: { id: true },
    });

    let queued = 0;
    for (const app of pendingApps) {
      await boss!.send('check-application-status', { applicationId: app.id });
      queued++;
    }

    console.log(`[check-all-application-statuses] Queued ${queued} status checks`);
    return { success: true, queued };
  });

  boss.work('cleanup', { teamSize: 1 }, async () => {
    console.log('[cleanup] Running cleanup...');
    // TODO: Implement cleanup logic (old logs, failed jobs, etc.)
    console.log('[cleanup] Completed');
    return { success: true };
  });

  boss.work('email-ingestion', { teamSize: 1 }, async () => {
    console.log('[email-ingestion] Checking for status update emails...');
    const result = await runEmailIngestionJob();
    console.log('[email-ingestion] Completed:', result);
    return result;
  });

  // Schedule recurring jobs
  await boss.schedule('discover-jobs', '0 */2 * * *', {}, { tz: 'UTC' }); // Every 2 hours
  await boss.schedule('filter-jobs', '*/30 * * * *', {}, { tz: 'UTC' }); // Every 30 minutes
  await boss.schedule('analyze-jobs', '*/15 * * * *', {}, { tz: 'UTC' }); // Every 15 minutes
  await boss.schedule('generate-embeddings', '*/20 * * * *', {}, { tz: 'UTC' }); // Every 20 minutes
  await boss.schedule('check-application-status', '0 */6 * * *', {}, { tz: 'UTC' }); // Every 6 hours
  await boss.schedule('check-all-application-statuses', '0 */6 * * *', {}, { tz: 'UTC' }); // Every 6 hours
  await boss.schedule('email-ingestion', '*/15 * * * *', {}, { tz: 'UTC' }); // Every 15 minutes
  await boss.schedule('cleanup', '0 3 * * *', {}, { tz: 'UTC' }); // Daily at 3 AM

  console.log('Scheduled jobs configured');
}

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

  try {
    await initializeQueue();
  } catch (error) {
    console.error('Failed to initialize queue:', error);
    process.exit(1);
  }

  console.log('Worker started successfully');

  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    if (boss) await boss.stop();
    await closePool();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    if (boss) await boss.stop();
    await closePool();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Worker failed:', error);
  process.exit(1);
});
