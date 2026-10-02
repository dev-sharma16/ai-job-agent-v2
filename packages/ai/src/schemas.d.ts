import { z } from 'zod';
export declare const JobAnalysisSchema: z.ZodObject<
  {
    track: z.ZodEnum<['ai_swe', 'swe', 'other']>;
    seniority: z.ZodNullable<z.ZodString>;
    experienceRequired: z.ZodNullable<z.ZodNumber>;
    requiredSkills: z.ZodArray<z.ZodString, 'many'>;
    preferredSkills: z.ZodArray<z.ZodString, 'many'>;
    aiRequirements: z.ZodArray<z.ZodString, 'many'>;
    matchedSkills: z.ZodArray<z.ZodString, 'many'>;
    missingSkills: z.ZodArray<z.ZodString, 'many'>;
    concerns: z.ZodArray<z.ZodString, 'many'>;
    fitScore: z.ZodNumber;
    explanation: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    track: 'ai_swe' | 'swe' | 'other';
    seniority: string | null;
    experienceRequired: number | null;
    requiredSkills: string[];
    preferredSkills: string[];
    aiRequirements: string[];
    matchedSkills: string[];
    missingSkills: string[];
    concerns: string[];
    fitScore: number;
    explanation: string;
  },
  {
    track: 'ai_swe' | 'swe' | 'other';
    seniority: string | null;
    experienceRequired: number | null;
    requiredSkills: string[];
    preferredSkills: string[];
    aiRequirements: string[];
    matchedSkills: string[];
    missingSkills: string[];
    concerns: string[];
    fitScore: number;
    explanation: string;
  }
>;
export type JobAnalysis = z.infer<typeof JobAnalysisSchema>;
export declare const ResumeBulletSelectionSchema: z.ZodObject<
  {
    selectedBulletIds: z.ZodArray<z.ZodString, 'many'>;
    reasoning: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    selectedBulletIds: string[];
    reasoning: string;
  },
  {
    selectedBulletIds: string[];
    reasoning: string;
  }
>;
export type ResumeBulletSelection = z.infer<typeof ResumeBulletSelectionSchema>;
export declare const SummaryGenerationSchema: z.ZodObject<
  {
    summary: z.ZodString;
    reasoning: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    reasoning: string;
    summary: string;
  },
  {
    reasoning: string;
    summary: string;
  }
>;
export type SummaryGeneration = z.infer<typeof SummaryGenerationSchema>;
export declare const ApplicationAnswerSchema: z.ZodObject<
  {
    question: z.ZodString;
    fieldType: z.ZodString;
    answer: z.ZodString;
    answerSource: z.ZodString;
    confidence: z.ZodNumber;
    requiresHuman: z.ZodBoolean;
  },
  'strip',
  z.ZodTypeAny,
  {
    question: string;
    fieldType: string;
    answer: string;
    answerSource: string;
    confidence: number;
    requiresHuman: boolean;
  },
  {
    question: string;
    fieldType: string;
    answer: string;
    answerSource: string;
    confidence: number;
    requiresHuman: boolean;
  }
>;
export type ApplicationAnswer = z.infer<typeof ApplicationAnswerSchema>;
export declare const CoverNoteSchema: z.ZodObject<
  {
    coverNote: z.ZodString;
    reasoning: z.ZodString;
  },
  'strip',
  z.ZodTypeAny,
  {
    reasoning: string;
    coverNote: string;
  },
  {
    reasoning: string;
    coverNote: string;
  }
>;
export type CoverNote = z.infer<typeof CoverNoteSchema>;
export declare const QuestionClassificationSchema: z.ZodObject<
  {
    fieldType: z.ZodEnum<
      [
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
      ]
    >;
    isStandard: z.ZodBoolean;
    confidence: z.ZodNumber;
  },
  'strip',
  z.ZodTypeAny,
  {
    fieldType:
      | 'NAME'
      | 'EMAIL'
      | 'PHONE'
      | 'LOCATION'
      | 'LINKEDIN'
      | 'GITHUB'
      | 'PORTFOLIO'
      | 'RESUME'
      | 'COVER_LETTER'
      | 'WORK_AUTHORIZATION'
      | 'NOTICE_PERIOD'
      | 'SALARY'
      | 'CUSTOM';
    confidence: number;
    isStandard: boolean;
  },
  {
    fieldType:
      | 'NAME'
      | 'EMAIL'
      | 'PHONE'
      | 'LOCATION'
      | 'LINKEDIN'
      | 'GITHUB'
      | 'PORTFOLIO'
      | 'RESUME'
      | 'COVER_LETTER'
      | 'WORK_AUTHORIZATION'
      | 'NOTICE_PERIOD'
      | 'SALARY'
      | 'CUSTOM';
    confidence: number;
    isStandard: boolean;
  }
>;
export type QuestionClassification = z.infer<typeof QuestionClassificationSchema>;
export declare const JobAnalysisPromptVersion = 'v1';
export declare const ResumeSelectionPromptVersion = 'v1';
export declare const SummaryPromptVersion = 'v1';
export declare const AnswersPromptVersion = 'v1';
export declare const CoverNotePromptVersion = 'v1';
export declare const ClassificationPromptVersion = 'v1';
//# sourceMappingURL=schemas.d.ts.map
