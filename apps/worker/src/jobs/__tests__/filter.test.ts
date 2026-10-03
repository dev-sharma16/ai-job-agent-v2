import { describe, it, expect } from 'vitest';
import { parseExperience, matchesExcludedTerms, matchesBlockedCompanies, isRemoteCompatible } from '../filter';
import { RemoteType, EmploymentType, ResumeTrack } from '@job-agent/domain';

describe('Job Filtering', () => {
  describe('parseExperience', () => {
    it('should parse "0-2 years" as 2', () => {
      expect(parseExperience('0-2 years')).toBe(2);
    });

    it('should parse "1+ years" as 1', () => {
      expect(parseExperience('1+ years')).toBe(1);
    });

    it('should parse "2 years" as 2', () => {
      expect(parseExperience('2 years')).toBe(2);
    });

    it('should parse "3+ years experience" as 3', () => {
      expect(parseExperience('3+ years experience')).toBe(3);
    });

    it('should parse "freshers" as 0', () => {
      expect(parseExperience('freshers')).toBe(0);
    });

    it('should parse "entry level" as 0', () => {
      expect(parseExperience('entry level')).toBe(0);
    });

    it('should parse "junior" as 0', () => {
      expect(parseExperience('junior')).toBe(0);
    });

    it('should return null for ambiguous text', () => {
      expect(parseExperience('some experience required')).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(parseExperience(null)).toBeNull();
      expect(parseExperience(undefined)).toBeNull();
    });
  });

  describe('matchesExcludedTerms', () => {
    it('should match excluded terms in title', () => {
      const excludedTerms = ['senior', 'staff', 'lead'];
      expect(matchesExcludedTerms('Senior Software Engineer', excludedTerms)).toBe(true);
      expect(matchesExcludedTerms('Staff Engineer', excludedTerms)).toBe(true);
      expect(matchesExcludedTerms('Lead Developer', excludedTerms)).toBe(true);
    });

    it('should not match when term not present', () => {
      const excludedTerms = ['senior', 'staff', 'lead'];
      expect(matchesExcludedTerms('Software Engineer', excludedTerms)).toBe(false);
      expect(matchesExcludedTerms('Junior Developer', excludedTerms)).toBe(false);
    });

    it('should be case insensitive', () => {
      const excludedTerms = ['SENIOR'];
      expect(matchesExcludedTerms('senior engineer', excludedTerms)).toBe(true);
      expect(matchesExcludedTerms('Senior Engineer', excludedTerms)).toBe(true);
    });
  });

  describe('matchesBlockedCompanies', () => {
    it('should match blocked companies', () => {
      const blocked = ['badcorp', 'evilinc'];
      expect(matchesBlockedCompanies('BadCorp Inc', blocked)).toBe(true);
      expect(matchesBlockedCompanies('EvilInc Technologies', blocked)).toBe(true);
    });

    it('should not match when not blocked', () => {
      const blocked = ['badcorp'];
      expect(matchesBlockedCompanies('GoodCorp Inc', blocked)).toBe(false);
    });
  });

  describe('isRemoteCompatible', () => {
    it('should allow remote when allowRemote is true', () => {
      expect(isRemoteCompatible(RemoteType.REMOTE, true, [])).toBe(true);
      expect(isRemoteCompatible(RemoteType.HYBRID, true, [])).toBe(true);
    });

    it('should allow onsite when allowedLocations is empty', () => {
      expect(isRemoteCompatible(RemoteType.ONSITE, false, [])).toBe(true);
    });

    it('should reject onsite when allowRemote false and locations specified', () => {
      expect(isRemoteCompatible(RemoteType.ONSITE, false, ['San Francisco'])).toBe(false);
    });
  });
});