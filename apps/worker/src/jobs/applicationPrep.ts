// @ts-nocheck - Complex Drizzle ORM types cause false positives
import { db, jobs, resumes, applicationQuestions, applications } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { generateContent } from '@job-agent/ai';
import { ApplicationAnswerSchema } from '@job-agent/ai';
import { getProvider } from '@job-agent/application';
import { ApplicationPackage, ResumeTrack } from '@job-agent/domain';
import { runPDFGeneration } from './pdfGeneration';

export interface ApplicationPrepInput {
  jobId: string;
  resumeTrack: ResumeTrack;
  resumeId: string;
  resumePdfPath?: string;
}

export interface ApplicationPrepOutput {
  success: boolean;
  error?: string;
  applicationPackage?: ApplicationPackage;
  applicationId?: string;
}

export async function runApplicationPrep(
  input: ApplicationPrepInput
): Promise<ApplicationPrepOutput> {
  try {
    // Load job data
    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, input.jobId),
      with: {
        company: true,
        analysis: true,
      },
    });

    if (!job || !job.analysis) {
      return { success: false, error: 'Job or analysis not found' };
    }

    const resume = await db.query.resumes.findFirst({
      where: eq(resumes.id, input.resumeId),
    });

    if (!resume) {
      return { success: false, error: 'Resume not found' };
    }

    const provider = getProvider(job.applicationUrl ?? job.url);
    if (!provider) {
      return { success: false, error: `No provider for URL: ${job.applicationUrl ?? job.url}` };
    }

    // Load profile data
    const profile = await db.query.profile.findFirst();
    const experiences = await db.query.experienceEntries.findMany();
    const projects = await db.query.projects.findMany();

    // Generate answers for standard questions
    const standardQuestions = [
      { question: 'Full Name', fieldType: 'NAME' as const, required: true },
      { question: 'Email', fieldType: 'EMAIL' as const, required: true },
      { question: 'Phone', fieldType: 'PHONE' as const, required: true },
      { question: 'Location', fieldType: 'LOCATION' as const, required: false },
      { question: 'LinkedIn URL', fieldType: 'LINKEDIN' as const, required: false },
      { question: 'GitHub URL', fieldType: 'GITHUB' as const, required: false },
      { question: 'Portfolio URL', fieldType: 'PORTFOLIO' as const, required: false },
      { question: 'Resume', fieldType: 'RESUME' as const, required: true },
      { question: 'Cover Letter', fieldType: 'COVER_LETTER' as const, required: false },
      { question: 'Work Authorization', fieldType: 'WORK_AUTHORIZATION' as const, required: true },
      { question: 'Notice Period', fieldType: 'NOTICE_PERIOD' as const, required: false },
      { question: 'Salary Expectations', fieldType: 'SALARY' as const, required: false },
    ];

    // Generate answers
    const answers = [];

    for (const q of standardQuestions) {
      const prompt = `Answer this job application question based on the candidate's profile.

Question: ${q.question}
Field Type: ${q.fieldType}
Required: ${q.required}

Candidate Profile:
- Name: ${profile?.name ?? ''}
- Email: ${profile?.email ?? ''}
- Phone: ${profile?.phone ?? ''}
- Location: ${profile?.location ?? ''}
- LinkedIn: ${profile?.linkedinUrl ?? ''}
- GitHub: ${profile?.githubUrl ?? ''}
- Portfolio: ${profile?.portfolioUrl ?? ''}
- Notice Period: ${profile?.noticePeriod ?? ''}
- Work Authorization: ${profile?.workAuthorization ?? ''}
- Expected Salary: ${profile?.expectedSalary ?? ''}

Experience:
${experiences.map((e) => `- ${e.role} at ${e.company} (${e.startDate} to ${e.endDate ?? 'Present'}): ${e.description ?? ''}`).join('\n')}

Projects:
${projects.map((p) => `- ${p.name}: ${p.description} (${p.technologiesJson.join(', ')})`).join('\n')}

Selected Resume Summary: ${resume.contentJson.summary ?? ''}
Selected Resume Bullets: ${((resume.contentJson.selectedBullets as any[]) ?? []).map((b: any) => b.text).join('\n')}
Cover Note: ${resume.contentJson.coverNote ?? ''}

Provide a concise, truthful answer. If information is not available, indicate that human review is needed.`;

      const result = await generateContent(prompt, ApplicationAnswerSchema, { temperature: 0.1 });
      answers.push({ ...result, fieldType: q.fieldType, required: q.required });
    }

    // Generate PDF if not provided
    let pdfPath = input.resumePdfPath;
    if (!pdfPath) {
      const pdfResult = await runPDFGeneration({ resumeId: input.resumeId });
      if (pdfResult.success && pdfResult.pdfPath) {
        pdfPath = pdfResult.pdfPath;
      } else {
        return { success: false, error: 'Failed to generate resume PDF' };
      }
    }

    // Create application record
    const [application] = await db.insert(applications).values({
      jobId: input.jobId,
      resumeId: input.resumeId,
      status: 'ready_for_review',
      applicationUrl: job.applicationUrl ?? job.url,
      coverNote: (resume.contentJson.coverNote as string) ?? '',
      answersJson: answers.map((a) => ({
        question: a.question,
        fieldType: a.fieldType,
        answer: a.answer,
        answerSource: a.answerSource,
        confidence: a.confidence,
        requiresHuman: a.requiresHuman,
      })),
      browserProvider: provider.constructor.name.replace('Provider', '').toLowerCase(),
    }).returning();

    // Save answers with applicationId
    for (const answer of answers) {
      await db.insert(applicationQuestions).values({
        applicationId: application.id,
        question: answer.question,
        fieldType: answer.fieldType,
        answer: answer.answer,
        answerSource: answer.answerSource,
        confidence: answer.confidence,
        requiresHuman: answer.requiresHuman,
      });
    }

    // Create application package
    const pkg: ApplicationPackage = {
      job: {
        id: input.jobId,
        title: job.title,
        company: job.company?.name ?? '',
        url: job.url,
        applicationUrl: job.applicationUrl ?? job.url,
      },
      resume: {
        id: input.resumeId,
        track: input.resumeTrack,
        pdfPath: pdfPath!,
        contentHash: resume.contentHash,
      },
      coverNote: (resume.contentJson.coverNote as string) ?? '',
      answers: answers.map((a) => ({
        question: a.question,
        fieldType: a.fieldType,
        answer: a.answer,
        answerSource: a.answerSource,
        confidence: a.confidence,
        requiresHuman: a.requiresHuman,
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        jobAnalysisTrack: job.analysis.track,
        resumeTrack: input.resumeTrack,
        applicationId: application.id,
      },
    };

    return { success: true, applicationPackage: pkg, applicationId: application.id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

if (require.main === module) {
  const jobId = process.argv[2];
  const track = process.argv[3] as 'ai_swe' | 'swe';
  const resumeId = process.argv[4];
  const resumePdfPath = process.argv[5];

  if (!jobId || !track || !resumeId || !resumePdfPath) {
    console.error('Usage: pnpm app:prep <jobId> <ai_swe|swe> <resumeId> <resumePdfPath>');
    process.exit(1);
  }

  runApplicationPrep({ jobId, resumeTrack: track, resumeId, resumePdfPath })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
