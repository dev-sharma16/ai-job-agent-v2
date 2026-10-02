import { generateContent } from './client';
import { JobAnalysisSchema, JobAnalysis, JobAnalysisPromptVersion } from './schemas';
import { RawJob } from '@job-agent/domain';
import { getEnv } from '@job-agent/config';

const env = getEnv();

const SYSTEM_PROMPT = `You are an expert technical recruiter analyzing software engineering job descriptions. 
Your task is to analyze a job description against a candidate's profile and provide structured output.

Candidate Profile:
- Name: Dev Sharma
- Experience: 6+ years software engineering, 2+ years AI/ML engineering
- Core Skills: TypeScript, React, Next.js, Node.js, Python, PostgreSQL, MongoDB, AWS, Docker, Kubernetes
- AI/ML Skills: LLM integration, RAG systems, LangChain/LangGraph, vector databases, embeddings, prompt engineering, AI agents, MCP
- Education: BS Computer Science
- Work Authorization: US Citizen
- Notice Period: 2 weeks

Analyze the job description and return ONLY the JSON matching the schema.`;

function buildAnalysisPrompt(job: RawJob): string {
  return `${SYSTEM_PROMPT}

Job Description:
Title: ${job.title}
Company: ${job.companyName}
Location: ${job.location ?? 'Not specified'}
Remote Type: ${job.remoteType ?? 'Not specified'}
Employment Type: ${job.employmentType ?? 'Not specified'}
Description:
${job.description}

URL: ${job.url}
Application URL: ${job.applicationUrl ?? 'Not provided'}

Analyze this job and provide:
1. Track classification (ai_swe, swe, or other)
2. Seniority level
3. Years of experience required
4. Required skills (explicitly mentioned)
5. Preferred skills (nice-to-have)
6. AI-specific requirements
7. Skills that match candidate profile
8. Skills missing from candidate profile
9. Concerns (overqualification, visa, location mismatch, etc.)
10. Fit score (0-100)
11. Explanation of your analysis`;
}

export async function analyzeJob(job: RawJob): Promise<JobAnalysis> {
  const prompt = buildAnalysisPrompt(job);

  const result = await generateContent<JobAnalysis>(prompt, JobAnalysisSchema, {
    temperature: 0.1,
    maxRetries: 3,
  });

  return {
    ...result,
    track: result.track as 'ai_swe' | 'swe' | 'other',
  };
}

export function getAnalysisMetadata() {
  return {
    model: env.GEMINI_MODEL,
    promptVersion: JobAnalysisPromptVersion,
  };
}
