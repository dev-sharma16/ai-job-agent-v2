import { describe, it, expect } from 'vitest';
import { SourceType, JobStatus, ApplicationStatus, ResumeTrack, RemoteType, EmploymentType, ApplicationEventType } from '../domain';

describe('Domain Types', () => {
  describe('SourceType', () => {
    it('should have all required source types', () => {
      expect(SourceType.GREENHOUSE).toBe('greenhouse');
      expect(SourceType.LEVER).toBe('lever');
      expect(SourceType.ASHBY).toBe('ashby');
      expect(SourceType.EMAIL).toBe('email');
      expect(SourceType.MANUAL).toBe('manual');
    });
  });

  describe('JobStatus', () => {
    it('should have all required job statuses', () => {
      expect(JobStatus.DISCOVERED).toBe('discovered');
      expect(JobStatus.FILTERED).toBe('filtered');
      expect(JobStatus.ANALYZED).toBe('analyzed');
      expect(JobStatus.READY_FOR_REVIEW).toBe('ready_for_review');
    });
  });

  describe('ApplicationStatus', () => {
    it('should have all required application statuses', () => {
      expect(ApplicationStatus.DISCOVERED).toBe('discovered');
      expect(ApplicationStatus.READY_FOR_REVIEW).toBe('ready_for_review');
      expect(ApplicationStatus.APPROVED).toBe('approved');
      expect(ApplicationStatus.SUBMITTED).toBe('submitted');
      expect(ApplicationStatus.NEEDS_HUMAN).toBe('needs_human');
      expect(ApplicationStatus.REJECTED).toBe('rejected');
      expect(ApplicationStatus.INTERVIEW).toBe('interview');
      expect(ApplicationStatus.OFFER).toBe('offer');
      expect(ApplicationStatus.FAILED).toBe('failed');
    });
  });

  describe('ResumeTrack', () => {
    it('should have both tracks', () => {
      expect(ResumeTrack.AI_SWE).toBe('ai_swe');
      expect(ResumeTrack.SWE).toBe('swe');
    });
  });

  describe('RemoteType', () => {
    it('should have all remote types', () => {
      expect(RemoteType.REMOTE).toBe('remote');
      expect(RemoteType.HYBRID).toBe('hybrid');
      expect(RemoteType.ONSITE).toBe('onsite');
    });
  });

  describe('EmploymentType', () => {
    it('should have all employment types', () => {
      expect(EmploymentType.FULL_TIME).toBe('full_time');
      expect(EmploymentType.PART_TIME).toBe('part_time');
      expect(EmploymentType.CONTRACT).toBe('contract');
      expect(EmploymentType.INTERNSHIP).toBe('internship');
    });
  });

  describe('ApplicationEventType', () => {
    it('should have all event types', () => {
      expect(ApplicationEventType.DISCOVERED).toBe('DISCOVERED');
      expect(ApplicationEventType.FILTERED).toBe('FILTERED');
      expect(ApplicationEventType.ANALYZED).toBe('ANALYZED');
      expect(ApplicationEventType.READY_FOR_REVIEW).toBe('READY_FOR_REVIEW');
      expect(ApplicationEventType.APPROVED).toBe('APPROVED');
      expect(ApplicationEventType.SUBMITTED).toBe('SUBMITTED');
      expect(ApplicationEventType.NEEDS_HUMAN).toBe('NEEDS_HUMAN');
      expect(ApplicationEventType.FAILED).toBe('FAILED');
    });
  });
});