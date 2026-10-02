import { db, jobs, jobAnalysis, jobEmbeddings } from '@job-agent/db';
import { eq, and, isNull } from 'drizzle-orm';
import { analyzeJob, getAnalysisMetadata } from '@job-agent/ai';
import { generateEmbedding } from '@job-agent/ai';
import { RawJob } from '@job-agent/domain';

export async function runAnalysis() {
  console.log('Starting job analysis...');

  // Find jobs that don't have analysis yet
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

      const rawJob: RawJob = {
        externalId: job.externalId,
        companyName: '', // We'd need to fetch company name
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

      // Map 'other' track to 'swe' as fallback
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

      // Generate embedding for the job
      const embedding = await generateEmbedding(job.description);
      if (embedding.length > 0) {
        await db.insert(jobEmbeddings).values({
          jobId: job.id,
          embedding: embedding as any,
          model: metadata.model,
          contentHash: job.contentHash,
        });
      }

      // Update job status
      await db
        .update(jobs)
        .set({ status: 'analyzed', updatedAt: new Date() })
        .where(eq(jobs.id, job.id));

      analyzed++;
      console.log(`  Analyzed: ${analysis.track} (fit: ${analysis.fitScore})`);
    } catch (error) {
      failed++;
      console.error(`Failed to analyze job ${job.id}:`, error);
    }
  }

  console.log(`Analysis complete. Analyzed: ${analyzed}, Failed: ${failed}`);
  return { analyzed, failed };
}

if (require.main === module) {
  runAnalysis()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Analysis failed:', error);
      process.exit(1);
    });
}
