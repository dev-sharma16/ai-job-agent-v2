import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.CRON_SECRET = 'test-secret';
  process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long';
});

afterAll(() => {
  // Cleanup
});
