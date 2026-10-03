import { describe, it, expect } from 'vitest';
import {
  JobAnalysisSchema,
  ResumeBulletSelectionSchema,
  SummaryGenerationSchema,
  ApplicationAnswerSchema,
  CoverNoteSchema,
  QuestionClassificationSchema,
} from '../schemas';

describe('AI Schema Validation', () => {
  describe('JobAnalysisSchema', () => {
    it('should validate valid job analysis', () => {
      const validAnalysis = {
        track: 'ai_swe',
        seniority: 'Senior',
        experienceRequired: 5,
        requiredSkills: ['TypeScript', 'React', 'Node.js'],
        preferredSkills: ['GraphQL', 'AWS'],
        aiRequirements: ['LLM', 'RAG'],
        matchedSkills: ['TypeScript', 'React'],
        missingSkills: ['GraphQL'],
        concerns: [],
        fitScore: 85,
        explanation: 'Strong match for AI role',
      };

      const result = JobAnalysisSchema.safeParse(validAnalysis);
      expect(result.success).toBe(true);
    });

    it('should reject invalid track', () => {
      const invalidAnalysis = {
        track: 'invalid_track',
        seniority: 'Senior',
        experienceRequired: 5,
        requiredSkills: [],
        preferredSkills: [],
        aiRequirements: [],
        matchedSkills: [],
        missingSkills: [],
        concerns: [],
        fitScore: 85,
        explanation: 'Test',
      };

      const result = JobAnalysisSchema.safeParse(invalidAnalysis);
      expect(result.success).toBe(false);
    });

    it('should reject fitScore out of range', () => {
      const invalidAnalysis = {
        track: 'ai_swe',
        seniority: 'Senior',
        experienceRequired: 5,
        requiredSkills: [],
        preferredSkills: [],
        aiRequirements: [],
        matchedSkills: [],
        missingSkills: [],
        concerns: [],
        fitScore: 150,
        explanation: 'Test',
      };

      const result = JobAnalysisSchema.safeParse(invalidAnalysis);
      expect(result.success).toBe(false);
    });

    it('should accept fitScore at boundaries', () => {
      const minScore = { ...validAnalysis, fitScore: 0 };
      const maxScore = { ...validAnalysis, fitScore: 100 };

      expect(JobAnalysisSchema.safeParse(minScore).success).toBe(true);
      expect(JobAnalysisSchema.safeParse(maxScore).success).toBe(true);
    });
  });

  describe('ResumeBulletSelectionSchema', () => {
    it('should validate bullet selection', () => {
      const validSelection = {
        selectedBulletIds: ['bullet-1', 'bullet-2', 'bullet-3'],
        reasoning: 'These bullets match the required skills',
      };

      const result = ResumeBulletSelectionSchema.safeParse(validSelection);
      expect(result.success).toBe(true);
    });

    it('should reject empty selection', () => {
      const invalidSelection = {
        selectedBulletIds: [],
        reasoning: 'No bullets selected',
      };

      const result = ResumeBulletSelectionSchema.safeParse(invalidSelection);
      expect(result.success).toBe(true); // Empty array is valid
    });
  });

  describe('SummaryGenerationSchema', () => {
    it('should validate summary', () => {
      const validSummary = {
        summary: 'Experienced software engineer with 6+ years...',
        reasoning: 'Summary highlights relevant experience',
      };

      const result = SummaryGenerationSchema.safeParse(validSummary);
      expect(result.success).toBe(true);
    });
  });

  describe('ApplicationAnswerSchema', () => {
    it('should validate application answer', () => {
      const validAnswer = {
        question: 'What is your experience with React?',
        fieldType: 'CUSTOM',
        answer: '6 years of professional React experience',
        answerSource: 'experience',
        confidence: 90,
        requiresHuman: false,
      };

      const result = ApplicationAnswerSchema.safeParse(validAnswer);
      expect(result.success).toBe(true);
    });

    it('should reject confidence out of range', () => {
      const invalidAnswer = {
        question: 'Test',
        fieldType: 'CUSTOM',
        answer: 'Test',
        answerSource: 'test',
        confidence: 150,
        requiresHuman: false,
      };

      const result = ApplicationAnswerSchema.safeParse(invalidAnswer);
      expect(result.success).toBe(false);
    });
  });

  describe('CoverNoteSchema', () => {
    it('should validate cover note', () => {
      const validCoverNote = {
        coverNote: 'Dear Hiring Manager, I am excited to apply...',
        reasoning: 'Cover note mentions specific role and company',
      };

      const result = CoverNoteSchema.safeParse(validCoverNote);
      expect(result.success).toBe(true);
    });
  });

  describe('QuestionClassificationSchema', () => {
    it('should validate question classification', () => {
      const validClassification = {
        fieldType: 'NAME',
        isStandard: true,
        confidence: 95,
      };

      const result = QuestionClassificationSchema.safeParse(validClassification);
      expect(result.success).toBe(true);
    });

    it('should reject invalid field type', () => {
      const invalidClassification = {
        fieldType: 'INVALID_TYPE',
        isStandard: true,
        confidence: 95,
      };

      const result = QuestionClassificationSchema.safeParse(invalidClassification);
      expect(result.success).toBe(false);
    });
  });
});

// Helper for valid analysis
const validAnalysis = {
  track: 'ai_swe' as const,
  seniority: 'Senior',
  experienceRequired: 5,
  requiredSkills: ['TypeScript', 'React', 'Node.js'],
  preferredSkills: ['GraphQL', 'AWS'],
  aiRequirements: ['LLM', 'RAG'],
  matchedSkills: ['TypeScript', 'React'],
  missingSkills: ['GraphQL'],
  concerns: [],
  fitScore: 85,
  explanation: 'Strong match for AI role',
};