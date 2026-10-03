import { describe, it, expect } from 'vitest';
import { normalizeJob, hashContent } from '../ingest';
import { RawJob } from '@job-agent/domain';

describe('Job Ingestion', () => {
  describe('normalizeJob', () => {
    it('should normalize job title correctly', async () => {
      const rawJob: RawJob = {
        externalId: '123',
        companyName: 'Test Corp',
        title: 'Senior Software Engineer',
        description: 'Great job opportunity',
        location: 'San Francisco, CA',
        locations: ['San Francisco, CA'],
        remoteType: 'remote',
        employmentType: 'full_time',
        url: 'https://example.com/job/123',
        applicationUrl: 'https://example.com/apply/123',
        postedAt: new Date('2024-01-15'),
        raw: {},
      };

      const normalized = await normalizeJob(rawJob, 'company-id', 'source-id');

      expect(normalized.title).toBe('Senior Software Engineer');
      expect(normalized.normalizedTitle).toBe('senior software engineer');
      expect(normalized.companyId).toBe('company-id');
      expect(normalized.sourceId).toBe('source-id');
      expect(normalized.status).toBe('discovered');
    });

    it('should handle special characters in title', async () => {
      const rawJob: RawJob = {
        externalId: '456',
        companyName: 'Test Corp',
        title: 'Software Engineer (Frontend) - React TypeScript',
        description: 'Job description',
        location: 'Remote',
        locations: ['Remote'],
        remoteType: 'remote',
        employmentType: 'full_time',
        url: 'https://example.com/job/456',
        applicationUrl: 'https://example.com/apply/456',
        postedAt: new Date('2024-01-15'),
        raw: {},
      };

      const normalized = await normalizeJob(rawJob, 'company-id', 'source-id');

      expect(normalized.normalizedTitle).toBe('software engineer frontend react typescript');
    });
  });

  describe('hashContent', () => {
    it('should generate consistent SHA-256 hash', async () => {
      const content = 'Test job description content';
      const hash1 = await hashContent(content);
      const hash2 = await hashContent(content);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 hex length
    });

    it('should generate different hashes for different content', async () => {
      const hash1 = await hashContent('Content A');
      const hash2 = await hashContent('Content B');

      expect(hash1).not.toBe(hash2);
    });
  });
});