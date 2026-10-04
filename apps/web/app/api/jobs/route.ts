import { NextRequest, NextResponse } from 'next/server';
import { db } from '@job-agent/db';
import { jobs, companies, jobAnalysis, sources, systemRuns, jobEmbeddings } from '@job-agent/db';
import { eq, and, desc, sql, count, or, isNull } from 'drizzle-orm';
import { analyzeJob, getAnalysisMetadata } from '@job-agent/ai';
import { generateEmbedding } from '@job-agent/ai';
import { fetchGreenhouseJobs } from 'worker/ingestion';
import { fetchLeverJobs } from 'worker/ingestion';
import { fetchAshbyJobs } from 'worker/ingestion';
import { RawJob } from '@job-agent/domain';

export const dynamic = 'force-dynamic';

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function normalizeJob(rawJob: RawJob, companyId: string, sourceId: string) {
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

async function ingestAllSources() {
  console.log('Starting job ingestion...');

  const enabledSources = await db.query.sources.findMany({
    where: eq(sources.enabled, true),
  });

  let totalInserted = 0;
  let totalUpdated = 0;

  for (const source of enabledSources) {
    try {
      console.log(`Ingesting from ${source.name} (${source.type})...`);
      const config = source.configJson as any;
      const company = await db.query.companies.findFirst({
        where: eq(companies.id, config.companyId as string),
      });

      if (!company) {
        console.warn(`No company found for source ${source.name}`);
        continue;
      }

      let rawJobs: RawJob[] = [];

      switch (source.type) {
        case 'greenhouse': {
          const boardToken = config.boardToken as string;
          if (!boardToken) {
            console.warn(`No boardToken for Greenhouse source ${source.name}`);
            continue;
          }
          rawJobs = await fetchGreenhouseJobs(boardToken);
          break;
        }
        case 'lever': {
          const companyName = config.companyName as string;
          if (!companyName) {
            console.warn(`No companyName for Lever source ${source.name}`);
            continue;
          }
          rawJobs = await fetchLeverJobs(companyName);
          break;
        }
        case 'ashby': {
          const organization = config.organization as string;
          if (!organization) {
            console.warn(`No organization for Ashby source ${source.name}`);
            continue;
          }
          rawJobs = await fetchAshbyJobs(organization);
          break;
        }
        default:
          console.warn(`Unknown source type: ${source.type}`);
          continue;
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

      totalInserted += inserted;
      totalUpdated += updated;
      console.log(`  Inserted: ${inserted}, Updated: ${updated}`);
    } catch (error) {
      console.error(`Failed to ingest from ${source.name}:`, error);
    }
  }

  console.log(
    `Ingestion complete. Total inserted: ${totalInserted}, Total updated: ${totalUpdated}`
  );
  return { inserted: totalInserted, updated: totalUpdated };
}

async function runAnalysis() {
  console.log('Starting job analysis...');

  const jobsWithoutAnalysis = await db
    .select()
    .from(jobs)
    .leftJoin(jobAnalysis, eq(jobAnalysis.jobId, jobs.id))
    .where(and(eq(jobs.status, 'filtered'), isNull(jobAnalysis.id)))
    .limit(50);

  console.log(`Found ${jobsWithoutAnalysis.length} jobs to analyze`);

  let analyzed = 0;
  let failed = 0;

  for (const row of jobsWithoutAnalysis) {
    const job = row.jobs;

    try {
      console.log(`Analyzing: ${job.title} at ${job.companyId}`);

      const company = await db.query.companies.findFirst({
        where: eq(companies.id, job.companyId),
      });

      const rawJob: RawJob = {
        externalId: job.externalId,
        companyName: company?.name ?? '',
        title: job.title,
        description: job.description,
        location: job.location ?? undefined,
        locations: job.locationsJson as string[],
        remoteType: job.remoteType as any,
        employmentType: job.employmentType as any,
        url: job.url,
        applicationUrl: job.applicationUrl ?? undefined,
        postedAt: job.postedAt ?? undefined,
        raw: job.rawJson,
      };

      const analysis = await analyzeJob(rawJob);
      const metadata = getAnalysisMetadata();

      const track = analysis.track === 'other' ? 'swe' : analysis.track;

      await db.insert(jobAnalysis).values({
        jobId: job.id,
        track: track as 'ai_swe' | 'swe',
        fitScore: analysis.fitScore,
        experienceRequired: analysis.experienceRequired,
        seniority: analysis.seniority,
        requiredSkillsJson: analysis.requiredSkills,
        preferredSkillsJson: analysis.preferredSkills,
        matchedSkillsJson: analysis.matchedSkills,
        missingSkillsJson: analysis.missingSkills,
        concernsJson: analysis.concerns,
        reasoning: analysis.explanation,
        model: metadata.model,
        promptVersion: metadata.promptVersion,
      });

      const embedding = await generateEmbedding(job.description);
      if (embedding.length > 0) {
        await db.insert(jobEmbeddings).values({
          jobId: job.id,
          embedding: embedding as any,
          model: metadata.model,
          contentHash: job.contentHash,
        });
      }

      await db
        .update(jobs)
        .set({ status: 'analyzed', updatedAt: new Date() })
        .where(eq(jobs.id, job.id));

      analyzed++;
    } catch (error) {
      console.error(`Failed to analyze ${job.title}:`, error);
      failed++;
    }
  }

  console.log(`Analysis complete. Analyzed: ${analyzed}, Failed: ${failed}`);
  return { analyzed, failed };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const track = searchParams.get('track');
    const search = searchParams.get('search');
    const minFitScore = searchParams.get('minFitScore') ? parseInt(searchParams.get('minFitScore')!) : null;

    const offset = (page - 1) * limit;

    const whereConditions = [];

    if (status) {
      whereConditions.push(eq(jobs.status, status as any));
    }
    if (track) {
      whereConditions.push(eq(jobAnalysis.track, track as any));
    }
    if (minFitScore !== null) {
      whereConditions.push(sql`${jobAnalysis.fitScore} >= ${minFitScore}`);
    }
    if (search) {
      whereConditions.push(
        or(
          sql`${jobs.title} ILIKE ${`%${search}%`}`,
          sql`${jobs.description} ILIKE ${`%${search}%`}`,
          sql`${companies.name} ILIKE ${`%${search}%`}`
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [jobsData, totalResult] = await Promise.all([
      db
        .select({
          id: jobs.id,
          externalId: jobs.externalId,
          title: jobs.title,
          description: jobs.description,
          location: jobs.location,
          locationsJson: jobs.locationsJson,
          remoteType: jobs.remoteType,
          employmentType: jobs.employmentType,
          url: jobs.url,
          applicationUrl: jobs.applicationUrl,
          postedAt: jobs.postedAt,
          discoveredAt: jobs.discoveredAt,
          status: jobs.status,
          companyId: companies.id,
          companyName: companies.name,
          companySlug: companies.slug,
          companyWebsite: companies.website,
          sourceId: sources.id,
          sourceName: sources.name,
          sourceType: sources.type,
          fitScore: jobAnalysis.fitScore,
          track: jobAnalysis.track,
          seniority: jobAnalysis.seniority,
          experienceRequired: jobAnalysis.experienceRequired,
          requiredSkillsJson: jobAnalysis.requiredSkillsJson,
          preferredSkillsJson: jobAnalysis.preferredSkillsJson,
          matchedSkillsJson: jobAnalysis.matchedSkillsJson,
          missingSkillsJson: jobAnalysis.missingSkillsJson,
          concernsJson: jobAnalysis.concernsJson,
        })
        .from(jobs)
        .leftJoin(companies, eq(jobs.companyId, companies.id))
        .leftJoin(sources, eq(jobs.sourceId, sources.id))
        .leftJoin(jobAnalysis, eq(jobAnalysis.jobId, jobs.id))
        .where(whereClause)
        .orderBy(desc(jobs.discoveredAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(jobs)
        .leftJoin(jobAnalysis, eq(jobAnalysis.jobId, jobs.id))
        .where(whereClause),
    ]);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      jobs: jobsData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, sourceId } = await request.json();

    if (action === 'discover') {
      const run = await db
        .insert(systemRuns)
        .values({
          type: 'ingest',
          status: 'running',
          startedAt: new Date(),
          itemsProcessed: 0,
          itemsFailed: 0,
        })
        .returning();

      const result = await ingestAllSources();

      await db
        .update(systemRuns)
        .set({
          status: 'completed',
          finishedAt: new Date(),
          itemsProcessed: result.inserted,
          itemsFailed: 0,
        })
        .where(eq(systemRuns.id, run[0].id));

      return NextResponse.json({ success: true, run: run[0], result });
    }

    if (action === 'analyze') {
      const run = await db
        .insert(systemRuns)
        .values({
          type: 'analyze',
          status: 'running',
          startedAt: new Date(),
          itemsProcessed: 0,
          itemsFailed: 0,
        })
        .returning();

      const result = await runAnalysis();

      await db
        .update(systemRuns)
        .set({
          status: 'completed',
          finishedAt: new Date(),
          itemsProcessed: result.analyzed,
          itemsFailed: result.failed,
        })
        .where(eq(systemRuns.id, run[0].id));

      return NextResponse.json({ success: true, run: run[0], result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Job action failed:', error);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}