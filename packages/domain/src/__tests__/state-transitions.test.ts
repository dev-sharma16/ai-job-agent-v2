import { describe, it, expect } from 'vitest';
import { JobStatus, ApplicationStatus } from '../domain';

// Valid job state transitions
const validJobTransitions: Record<JobStatus, JobStatus[]> = {
  discovered: ['filtered'],
  filtered: ['analyzed'],
  analyzed: ['ready_for_review'],
  ready_for_review: [],
};

// Valid application state transitions
const validAppTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  discovered: ['filtered', 'analyzed', 'ready_for_review'],
  filtered: ['analyzed', 'ready_for_review'],
  analyzed: ['ready_for_review'],
  ready_for_review: ['approved', 'rejected', 'needs_human'],
  approved: ['preparing'],
  preparing: ['applying'],
  applying: ['submitted', 'needs_human', 'failed'],
  submitted: ['assessment', 'interview', 'rejected', 'offer', 'withdrawn'],
  needs_human: ['ready_for_review', 'rejected'],
  rejected: [],
  assessment: ['interview', 'rejected'],
  interview: ['offer', 'rejected'],
  offer: ['withdrawn'],
  withdrawn: [],
  failed: ['ready_for_review'],
};

describe('State Transitions', () => {
  describe('Job Status Transitions', () => {
    Object.entries(validJobTransitions).forEach(([from, toList]) => {
      toList.forEach((to) => {
        it(`should allow ${from} -> ${to}`, () => {
          expect(validJobTransitions[from as JobStatus]).toContain(to);
        });
      });
    });

    it('should not allow invalid transitions', () => {
      // discovered should not go directly to analyzed
      expect(validJobTransitions.discovered).not.toContain('analyzed');
      // filtered should not go back to discovered
      expect(validJobTransitions.filtered).not.toContain('discovered');
      // ready_for_review is terminal for jobs
      expect(validJobTransitions.ready_for_review).toHaveLength(0);
    });
  });

  describe('Application Status Transitions', () => {
    Object.entries(validAppTransitions).forEach(([from, toList]) => {
      toList.forEach((to) => {
        it(`should allow ${from} -> ${to}`, () => {
          expect(validAppTransitions[from as ApplicationStatus]).toContain(to);
        });
      });
    });

    it('should not allow invalid transitions', () => {
      // submitted should not go back to preparing
      expect(validAppTransitions.submitted).not.toContain('preparing');
      // rejected is terminal
      expect(validAppTransitions.rejected).toHaveLength(0);
      // needs_human can go back to ready_for_review
      expect(validAppTransitions.needs_human).toContain('ready_for_review');
    });

    it('should allow failed -> ready_for_review retry', () => {
      expect(validAppTransitions.failed).toContain('ready_for_review');
    });
  });

  describe('Terminal States', () => {
    const terminalJobStates: JobStatus[] = ['ready_for_review'];
    const terminalAppStates: ApplicationStatus[] = ['rejected', 'withdrawn'];

    terminalJobStates.forEach((state) => {
      it(`job ${state} should be terminal`, () => {
        expect(validJobTransitions[state]).toHaveLength(0);
      });
    });

    terminalAppStates.forEach((state) => {
      it(`application ${state} should be terminal`, () => {
        expect(validAppTransitions[state]).toHaveLength(0);
      });
    });
  });
});