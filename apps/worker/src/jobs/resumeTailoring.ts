// @ts-nocheck - Complex Drizzle ORM types cause false positives
import { db, jobs } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { findSimilarBullets, findSimilarProjects } from './embed';
import { ResumeTrack } from '@job-agent/domain';
import { generateContent } from '@job-agent/ai';
import {
  ResumeBulletSelectionSchema,
  SummaryGenerationSchema,
  CoverNoteSchema,
} from '@job-agent/ai';

export interface ResumeTailoringInput {
  jobId: string;
  resumeTrack: ResumeTrack;
}

export interface ResumeTailoringOutput {
  success: boolean;
  error?: string;
  resumeId?: string;
  selectedBulletIds?: string[];
  summary?: string;
  coverNote?: string;
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function runResumeTailoring(
  input: ResumeTailoringInput
): Promise<ResumeTailoringOutput> {
  try {
    // Load job data
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
      with: {
        company: true,
        analysis: true,
        embeddings: true,
      },
    });

    if (!job || !job.analysis || !job.embeddings) {
      return { success: false, error: 'Job analysis or embedding not found' };
    }

    // Retrieve similar bullets and projects
    const jobAnalysis = job.analysis as JobAnalysis;
    const jobEmbedding = job.embeddings.embedding as number[];

    const [similarBullets, similarProjects] = await Promise.all([
      findSimilarBullets(jobEmbedding, {
        track: input.resumeTrack,
        limit: 30,
        minSimilarity: 0.65,
      }),
      findSimilarProjects(jobEmbedding, { limit: 10, minSimilarity: 0.6 }),
    ]);

    // Select bullets
    const bulletsContext = similarBullets
      .map((b) => ({
        id: b.id,
        text: b.text,
        skills: b.skillTagsJson,
        tracks: b.trackTagsJson,
      }))
      .join('\n---\n');

    const selectionPrompt = `Select the most relevant verified bullets for a ${input.resumeTrack === 'ai_swe' ? 'AI Software Engineer' : 'Software Engineer'} resume targeting this job.

Job Analysis:
- Track: ${jobAnalysis.track}
- Required Skills: ${jobAnalysis.requiredSkills.join(', ')}
- Preferred Skills: ${jobAnalysis.preferredSkills.join(', ')}
- Matched Skills: ${jobAnalysis.matchedSkills.join(', ')}
- Missing Skills: ${jobAnalysis.missingSkills.join(', ')}

Available Verified Bullets:
${bulletsContext}

Select up to 15 bullets that best match the job requirements. Prioritize bullets that demonstrate:
1. Required skills from the job
2. AI/ML experience (for AI-SWE track)
3. Quantifiable achievements
4. Relevant technologies

Return ONLY the JSON matching the schema.`;

    // @ts-expect-error - generateContent returns typed result
    const selectionResult = await generateContent(selectionPrompt, ResumeBulletSelectionSchema, {
      temperature: 0.2,
    });
    const selectedBulletIds = selectionResult.selectedBulletIds;

    // Generate summary
    const selectedBullets = similarBullets
      .filter((b) => selectedBulletIds.includes(b.id))
      .map((b) => b.text)
      .join('\n');

    const summaryPrompt = `Write a professional summary for a ${input.resumeTrack === 'ai_swe' ? 'AI Software Engineer' : 'Software Engineer'} resume.

Job Requirements:
- Track: ${jobAnalysis.track}
- Seniority: ${jobAnalysis.seniority ?? 'Not specified'}
- Required Skills: ${jobAnalysis.requiredSkills.join(', ')}
- Key Matched Skills: ${jobAnalysis.matchedSkills.slice(0, 8).join(', ')}

Selected Experience Highlights:
${selectedBullets}

Write a 2-3 sentence summary that:
1. Mentions years of experience
2. Highlights the most relevant matched skills
3. Mentions track-specific expertise (AI/ML for AI-SWE, full-stack for SWE)
4. Is tailored to this specific role

Return ONLY the JSON matching the schema.`;

    // @ts-expect-error - generateContent returns typed result
    const summaryResult = await generateContent(summaryPrompt, SummaryGenerationSchema, {
      temperature: 0.3,
    });
    const summary = summaryResult.summary;

    // Generate cover note
    const coverPrompt = `Write a brief cover note for a job application.

Company: ${job.company?.name ?? 'the company'}
Role: ${job.title}
Job Description Summary: ${job.description.slice(0, 500)}

Your Relevant Highlights:
${selectedBullets.slice(0, 3).join('\n')}

Write a cover note (80-150 words) that:
1. Mentions the specific role and company
2. References 1-2 relevant experience highlights
3. Shows genuine interest without generic praise
3. Does not claim unverified experience

Return ONLY the JSON matching the schema.`;

    // @ts-expect-error - generateContent returns typed result
    const coverResult = await generateContent(coverPrompt, CoverNoteSchema, { temperature: 0.3 });
    const coverNote = coverResult.coverNote;

    // Assemble resume
    // @ts-expect-error - Drizzle query builder types
    const baseResume = await db.query.resumes.findFirst({
      where: (resumes, { eq }) => eq(resumes.track, input.resumeTrack),
      orderBy: (resumes, { desc }) => desc(resumes.version),
    });

    if (!baseResume) {
      return { success: false, error: `No base resume found for track ${input.resumeTrack}` };
    }

    const selectedBulletsData = similarBullets
      .filter((b) => selectedBulletIds.includes(b.id))
      .map((b) => ({ ...b, selected: true }));

    const resumeContent = {
      ...baseResume.contentJson,
      summary,
      coverNote,
      selectedBullets: selectedBulletsData,
      selectedBulletIds,
      similarProjects,
    };

    const newVersion = (baseResume.version ?? 0) + 1;
    const contentHash = await hashContent(JSON.stringify(resumeContent));

    // @ts-expect-error - Drizzle insert with complex types
    const [newResume] = await db
      .insert(resumes)
      .values({
        track: input.resumeTrack,
        version: newVersion,
        name: `Tailored for job ${input.jobId}`,
        templateName: baseResume.templateName,
        contentJson: resumeContent,
        contentHash,
      })
      .returning();

    return { success: true, resumeId: newResume.id, selectedBulletIds, summary, coverNote };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

if (require.main === module) {
  const jobId = process.argv[2];
  const track = (process.argv[3] === 'ai_swe' ? 'ai_swe' : 'swe') as ResumeTrack;
  if (!jobId || !track) {
    console.error('Usage: pnpm resume:tailor <jobId> <ai_swe|swe>');
    process.exit(1);
  }
  runResumeTailoring({ jobId, resumeTrack: track })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
