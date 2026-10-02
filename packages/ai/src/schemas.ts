import { z } from 'zod';

export const JobAnalysisSchema = z.object({
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
