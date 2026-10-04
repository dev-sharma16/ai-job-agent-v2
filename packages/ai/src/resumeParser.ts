import { generateContent } from './client';
import { ParsedResumeSchema, ParsedResume, ResumeParsePromptVersion } from './schemas';

const SYSTEM_PROMPT = `You are an expert resume parser. Extract structured data from the provided resume text (Markdown or plain text).

Extract the following information:
1. Header: name, email, phone, location, LinkedIn, GitHub, portfolio URLs
2. Professional summary
3. Work experience: company, role, employment type, start/end dates, location, bullet points
4. Projects: name, description, technologies, bullet points, URL
5. Skills: categorized skills
6. Education: degree, institution, graduation date, location
7. Certifications: name, issuer, date
8. Track classification: ai_swe (AI/ML focused), swe (general software engineering), or other

Return ONLY valid JSON matching the schema.`;

function buildParsePrompt(resumeText: string): string {
  return `${SYSTEM_PROMPT}

Resume Text:
${resumeText}

Parse this resume and return structured JSON.`;
}

export async function parseResume(resumeText: string): Promise<ParsedResume> {
  const prompt = buildParsePrompt(resumeText);

  const result = await generateContent<ParsedResume>(prompt, ParsedResumeSchema, {
    temperature: 0.1,
    maxRetries: 3,
  });

  return {
    ...result,
    track: result.track as 'ai_swe' | 'swe' | 'other',
  };
}

export function getParseMetadata() {
  return {
    promptVersion: ResumeParsePromptVersion,
  };
}