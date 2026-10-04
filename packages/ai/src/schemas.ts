import { z } from 'zod';

const jobAnalysisSchema = z.object({
  track: z.enum(['ai_swe', 'swe', 'other']),
  seniority: z.string().nullable(),
  experienceRequired: z.number().nullable(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  aiRequirements: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  concerns: z.array(z.string()),
  fitScore: z.number().min(0).max(100),
  explanation: z.string(),
});

export const JobAnalysisSchema = jobAnalysisSchema;

export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;

export const ResumeBulletSelectionSchema = z.object({
  selectedBulletIds: z.array(z.string()),
  reasoning: z.string(),
});

export type ResumeBulletSelection = z.infer<typeof ResumeBulletSelectionSchema>;

export const SummaryGenerationSchema = z.object({
  summary: z.string(),
  reasoning: z.string(),
});

export type SummaryGeneration = z.infer<typeof SummaryGenerationSchema>;

export const ApplicationAnswerSchema = z.object({
  question: z.string(),
  fieldType: z.string(),
  answer: z.string(),
  answerSource: z.string(),
  confidence: z.number().min(0).max(100),
  requiresHuman: z.boolean(),
});

export type ApplicationAnswer = z.infer<typeof ApplicationAnswerSchema>;

export const CoverNoteSchema = z.object({
  coverNote: z.string(),
  reasoning: z.string(),
});

export type CoverNote = z.infer<typeof CoverNoteSchema>;

export const QuestionClassificationSchema = z.object({
  fieldType: z.enum([
    'NAME',
    'EMAIL',
    'PHONE',
    'LOCATION',
    'LINKEDIN',
    'GITHUB',
    'PORTFOLIO',
    'RESUME',
    'COVER_LETTER',
    'WORK_AUTHORIZATION',
    'NOTICE_PERIOD',
    'SALARY',
    'CUSTOM',
  ]),
  isStandard: z.boolean(),
  confidence: z.number().min(0).max(100),
});

export type QuestionClassification = z.infer<typeof QuestionClassificationSchema>;

export const JobAnalysisPromptVersion = 'v1';
export const ResumeSelectionPromptVersion = 'v1';
export const SummaryPromptVersion = 'v1';
export const AnswersPromptVersion = 'v1';
export const CoverNotePromptVersion = 'v1';
export const ClassificationPromptVersion = 'v1';

export const EmailClassificationSchema = z.object({
  type: z.enum(['rejection', 'assessment', 'interview', 'confirmation', 'other']),
  confidence: z.number().min(0).max(100),
  companyName: z.string().nullable(),
  roleTitle: z.string().nullable(),
  details: z.string().nullable(),
  requiresHumanReview: z.boolean(),
});

export type EmailClassification = z.infer<typeof EmailClassificationSchema>;

export const ParsedResumeSchema: any = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        location: { type: 'string' },
        linkedin: { type: 'string', format: 'uri' },
        github: { type: 'string', format: 'uri' },
        portfolio: { type: 'string', format: 'uri' },
      },
      required: ['name'],
    },
    summary: { type: 'string' },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company: { type: 'string' },
          role: { type: 'string' },
          employmentType: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          location: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['company', 'role', 'startDate', 'bullets'],
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
          bullets: { type: 'array', items: { type: 'string' } },
          url: { type: 'string', format: 'uri' },
        },
        required: ['name', 'technologies', 'bullets'],
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          skills: { type: 'array', items: { type: 'string' } },
        },
        required: ['category', 'skills'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          degree: { type: 'string' },
          institution: { type: 'string' },
          graduationDate: { type: 'string' },
          location: { type: 'string' },
        },
        required: ['degree', 'institution'],
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          issuer: { type: 'string' },
          date: { type: 'string' },
        },
        required: ['name'],
      },
    },
    track: { type: 'string', enum: ['ai_swe', 'swe', 'other'] },
  },
  required: ['header', 'experience', 'projects', 'skills', 'education', 'certifications', 'track'],
};

export type ParsedResume = {
  header: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    role: string;
    employmentType?: string;
    startDate: string;
    endDate?: string;
    location?: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description?: string;
    technologies: string[];
    bullets: string[];
    url?: string;
  }>;
  skills: Array<{ category: string; skills: string[] }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationDate?: string;
    location?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
  }>;
  track: 'ai_swe' | 'swe' | 'other';
};

export const ResumeParsePromptVersion = 'v1';
