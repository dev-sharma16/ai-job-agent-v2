import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { generateContent } from '@job-agent/ai';
import { EmailClassificationSchema, EmailClassification as EmailClassificationType } from '@job-agent/ai';
import { db, applications, applicationEvents, jobs } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { ApplicationStatus, ApplicationEventType } from '@job-agent/domain';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
  mailbox: string;
  searchCriteria: string[];
}

export interface EmailClassification {
  type: 'rejection' | 'assessment' | 'interview' | 'confirmation' | 'other';
  confidence: number;
  applicationId?: string;
  companyName?: string;
  roleTitle?: string;
  details?: string;
  requiresHumanReview: boolean;
}

const DEFAULT_EMAIL_CONFIG: Partial<EmailConfig> = {
  port: 993,
  tls: true,
  mailbox: 'INBOX',
  searchCriteria: ['UNSEEN'],
};

async function connectImap(config: EmailConfig): Promise<Imap> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      tls: config.tls,
      tlsOptions: { rejectUnauthorized: false },
    });

    imap.once('ready', () => resolve(imap));
    imap.once('error', reject);
    imap.connect();
  });
}

async function fetchEmails(imap: Imap, criteria: string[]): Promise<ParsedMail[]> {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', true, (err: Error | null, box: any) => {
      if (err) return reject(err);

      const searchCriteria = criteria.length > 0 ? criteria : ['UNSEEN'];
      imap.search(searchCriteria, (err: Error | null, results: number[]) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return resolve([]);

        const fetch = imap.fetch(results, { bodies: '', struct: true });
        const emails: ParsedMail[] = [];

        fetch.on('message', (msg: any) => {
          msg.on('body', (stream: any) => {
            simpleParser(stream, (err: Error | null, parsed: ParsedMail | null) => {
              if (!err && parsed) {
                emails.push(parsed);
              }
            });
          });
        });

        fetch.once('error', reject);
        fetch.once('end', () => resolve(emails));
      });
    });
  });
}

export async function classifyEmail(email: ParsedMail): Promise<EmailClassification> {
  const subject = email.subject || '';
  const from = email.from?.text || '';
  const text = email.text || '';
  const html = email.html || '';

  const prompt = `Classify this job application email.

From: ${from}
Subject: ${subject}
Text: ${text.slice(0, 3000)}
HTML: ${html ? html.slice(0, 3000) : 'N/A'}

Classify as ONE of:
- rejection: Job application rejected
- assessment: Invitation to take assessment/test
- interview: Interview invitation or scheduling
- confirmation: Application received/submitted confirmation
- other: Not related to job application status

If classification is rejection, assessment, or interview, extract:
- company name
- role title (if mentioned)
- Any specific details (dates, links, etc.)

Confidence: 0-100
Requires human review if confidence < 80 or ambiguous.`;

  const result = await generateContent(prompt, EmailClassificationSchema, {
    temperature: 0.1,
  });

  const typedResult = result as EmailClassificationType;

  return {
    type: typedResult.type,
    confidence: typedResult.confidence,
    companyName: typedResult.companyName ?? undefined,
    roleTitle: typedResult.roleTitle ?? undefined,
    details: typedResult.details ?? undefined,
    requiresHumanReview: typedResult.requiresHumanReview,
  };
}

function findApplicationByEmail(
  applications: Array<{ id: string; job: { company: { name: string }; title: string } }>,
  email: EmailClassification
): string | null {
  if (!email.companyName || !email.roleTitle) return null;

  const companyMatch = applications.find((app) =>
    app.job.company.name.toLowerCase().includes(email.companyName!.toLowerCase())
  );
  if (companyMatch) return companyMatch.id;

  const titleMatch = applications.find((app) =>
    app.job.title.toLowerCase().includes(email.roleTitle!.toLowerCase())
  );
  if (titleMatch) return titleMatch.id;

  return null;
}

export async function updateApplicationStatusFromEmail(
  applicationId: string,
  classification: EmailClassification
): Promise<void> {
  const statusMap: Record<string, ApplicationStatus> = {
    rejection: 'rejected' as ApplicationStatus,
    assessment: 'assessment' as ApplicationStatus,
    interview: 'interview' as ApplicationStatus,
    confirmation: 'submitted' as ApplicationStatus,
    other: 'submitted' as ApplicationStatus,
  };

  const eventMap: Record<string, ApplicationEventType> = {
    rejection: 'REJECTED' as ApplicationEventType,
    assessment: 'ASSESSMENT' as ApplicationEventType,
    interview: 'INTERVIEW' as ApplicationEventType,
    confirmation: 'STATUS_CHANGED' as ApplicationEventType,
    other: 'STATUS_CHANGED' as ApplicationEventType,
  };

  const newStatus = statusMap[classification.type];
  const eventType = eventMap[classification.type];

  if (!newStatus || newStatus === 'submitted') return;

  await db.transaction(async (tx) => {
    const app = await tx.query.applications.findFirst({
      where: eq(applications.id, applicationId),
      columns: { status: true },
    });

    if (!app) return;

    const oldStatus = app.status;

    await tx
      .update(applications)
      .set({
        status: newStatus,
        lastCheckedAt: new Date(),
        ...(newStatus === 'rejected' && { rejectionAt: new Date() }),
      })
      .where(eq(applications.id, applicationId));

    await tx.insert(applicationEvents).values({
      applicationId,
      eventType,
      metadataJson: {
        oldStatus,
        newStatus,
        source: 'email',
        emailSubject: classification.details,
        confidence: classification.confidence,
        requiresHumanReview: classification.requiresHumanReview,
        checkedAt: new Date().toISOString(),
      },
    });
  });
}

export async function runEmailIngestion(config: EmailConfig): Promise<{
  processed: number;
  classifications: EmailClassification[];
  errors: string[];
}> {
  const classifications: EmailClassification[] = [];
  const errors: string[] = [];

  try {
    const imap = await connectImap({ ...DEFAULT_EMAIL_CONFIG, ...config });
    const emails = await fetchEmails(imap, config.searchCriteria);

    // Get pending applications for matching
    const pendingApps = await db.query.applications.findMany({
      where: (applications, { inArray }) =>
        inArray(applications.status, ['submitted', 'assessment', 'interview', 'ready_for_review', 'approved']),
      with: {
        job: {
          with: { company: true },
        },
      },
    });

    for (const email of emails) {
      try {
        const classification = await classifyEmail(email);
        classifications.push(classification);

        // Find matching application
        const applicationId = findApplicationByEmail(pendingApps, classification);

        if (applicationId && classification.type !== 'other') {
          await updateApplicationStatusFromEmail(applicationId, classification);
        }

        if (classification.requiresHumanReview) {
          errors.push(`Human review needed for email from ${email.from?.text}: ${classification.type} (confidence: ${classification.confidence})`);
        }
      } catch (err) {
        errors.push(`Failed to process email: ${(err as Error).message}`);
      }
    }

    imap.end();
  } catch (err) {
    errors.push(`Email ingestion failed: ${(err as Error).message}`);
  }

  return { processed: classifications.length, classifications, errors };
}

if (require.main === module) {
  const config: EmailConfig = {
    host: process.env.EMAIL_IMAP_HOST || '',
    port: parseInt(process.env.EMAIL_IMAP_PORT || '993'),
    user: process.env.EMAIL_IMAP_USER || '',
    password: process.env.EMAIL_IMAP_PASSWORD || '',
    tls: true,
    mailbox: 'INBOX',
    searchCriteria: ['UNSEEN'],
  };

  if (!config.host || !config.user || !config.password) {
    console.error('Missing email configuration');
    process.exit(1);
  }

  runEmailIngestion(config)
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}