// @ts-nocheck - Complex types
import { runEmailIngestion } from '../ingestion/email';
import { getEnv } from '@job-agent/config';

export interface EmailIngestionInput {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
}

export interface EmailIngestionOutput {
  processed: number;
  classifications: Array<{
    type: string;
    confidence: number;
    companyName?: string;
    roleTitle?: string;
    requiresHumanReview: boolean;
  }>;
  errors: string[];
}

export async function runEmailIngestionJob(
  input: EmailIngestionInput = {}
): Promise<EmailIngestionOutput> {
  const env = getEnv();

  const config = {
    host: input.host || env.EMAIL_IMAP_HOST,
    port: input.port || parseInt(env.EMAIL_IMAP_PORT || '993'),
    user: input.user || env.EMAIL_IMAP_USER,
    password: input.password || env.EMAIL_IMAP_PASSWORD,
    tls: true,
    mailbox: 'INBOX',
    searchCriteria: ['UNSEEN'],
  };

  if (!config.host || !config.user || !config.password) {
    return {
      processed: 0,
      classifications: [],
      errors: ['Email configuration not complete'],
    };
  }

  const result = await runEmailIngestion(config);

  return {
    processed: result.processed,
    classifications: result.classifications.map((c) => ({
      type: c.type,
      confidence: c.confidence,
      companyName: c.companyName,
      roleTitle: c.roleTitle,
      requiresHumanReview: c.requiresHumanReview,
    })),
    errors: result.errors,
  };
}

if (require.main === module) {
  runEmailIngestionJob()
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}