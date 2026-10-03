import { db, jobs, sources, companies } from '@job-agent/db';
import { eq, and } from 'drizzle-orm';
import { fetchGreenhouseJobs } from '../ingestion/greenhouse';
import { fetchLeverJobs } from '../ingestion/lever';
import { fetchAshbyJobs } from '../ingestion/ashby';
import { RawJob } from '@job-agent/domain';

interface SourceConfig {
  companyId?: string;
  boardToken?: string;
  companyName?: string;
  organization?: string;
  boards?: string[];
  companies?: string[];
  organizations?: string[];
}

export async function normalizeJob(rawJob: RawJob, companyId: string, sourceId: string) {
  const normalizedTitle = rawJob.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const contentHash = await hashContent(rawJob.description);

  return {
    companyId,
    sourceId,
    externalId: rawJob.externalId,
    title: rawJob.title,
    normalizedTitle,
    description: rawJob.description,
    location: rawJob.location,
    locationsJson: rawJob.locations ?? [],
    remoteType: rawJob.remoteType,
    employmentType: rawJob.employmentType,
    url: rawJob.url,
    applicationUrl: rawJob.applicationUrl,
    postedAt: rawJob.postedAt,
    contentHash,
    status: 'discovered' as const,
    rawJson: rawJob.raw,
  };
}

export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function ingestSource(source: typeof sources.$inferSelect) {
  const config = source.configJson as SourceConfig;
  const company = await db.query.companies.findFirst({
    where: eq(companies.id, config.companyId as string),
  });

  if (!company) {
    console.warn(`No company found for source ${source.name}`);
    return { inserted: 0, updated: 0 };
  }

  let rawJobs: RawJob[] = [];

  switch (source.type) {
    case 'greenhouse': {
      const boardToken = config.boardToken as string;
      if (!boardToken) {
        console.warn(`No boardToken for Greenhouse source ${source.name}`);
        return { inserted: 0, updated: 0 };
      }
      rawJobs = await fetchGreenhouseJobs(boardToken);
      break;
    }
    case 'lever': {
      const companyName = config.companyName as string;
      if (!companyName) {
        console.warn(`No companyName for Lever source ${source.name}`);
        return { inserted: 0, updated: 0 };
      }
      rawJobs = await fetchLeverJobs(companyName);
      break;
    }
    case 'ashby': {
      const organization = config.organization as string;
      if (!organization) {
        console.warn(`No organization for Ashby source ${source.name}`);
        return { inserted: 0, updated: 0 };
      }
      rawJobs = await fetchAshbyJobs(organization);
      break;
    }
    default:
      console.warn(`Unknown source type: ${source.type}`);
      return { inserted: 0, updated: 0 };
  }

  let inserted = 0;
  let updated = 0;

  for (const rawJob of rawJobs) {
    rawJob.companyName = company.name;

    const normalized = await normalizeJob(rawJob, company.id, source.id);

    const existing = await db.query.jobs.findFirst({
      where: and(eq(jobs.sourceId, source.id), eq(jobs.externalId, rawJob.externalId)),
    });

    if (existing) {
      if (existing.contentHash !== normalized.contentHash) {
        await db
          .update(jobs)
          .set({ ...normalized, updatedAt: new Date() })
          .where(eq(jobs.id, existing.id));
        updated++;
      }
    } else {
      await db.insert(jobs).values(normalized);
      inserted++;
    }
  }

  await db.update(sources).set({ lastRunAt: new Date() }).where(eq(sources.id, source.id));

  return { inserted, updated };
}

export async function runIngestion() {
  console.log('Starting job ingestion...');

  const enabledSources = await db.query.sources.findMany({
    where: eq(sources.enabled, true),
  });

  let totalInserted = 0;
  let totalUpdated = 0;

  for (const source of enabledSources) {
    try {
      console.log(`Ingesting from ${source.name} (${source.type})...`);
      const result = await ingestSource(source);
      totalInserted += result.inserted;
      totalUpdated += result.updated;
      console.log(`  Inserted: ${result.inserted}, Updated: ${result.updated}`);
    } catch (error) {
      console.error(`Failed to ingest from ${source.name}:`, error);
    }
  }

  console.log(
    `Ingestion complete. Total inserted: ${totalInserted}, Total updated: ${totalUpdated}`
  );
  return { inserted: totalInserted, updated: totalUpdated };
}

if (require.main === module) {
  runIngestion()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Ingestion failed:', error);
      process.exit(1);
    });
}
