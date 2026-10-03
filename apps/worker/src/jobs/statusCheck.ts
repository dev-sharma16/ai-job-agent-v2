// @ts-nocheck - Complex Drizzle ORM types cause false positives
import { db, applications, applicationEvents, jobs } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { getProvider } from '@job-agent/application';
import { ApplicationStatus, ApplicationEventType } from '@job-agent/domain';
import { chromium } from 'playwright';

export interface StatusCheckInput {
  applicationId: string;
}

export interface StatusCheckOutput {
  success: boolean;
  error?: string;
  statusChanged?: boolean;
  newStatus?: ApplicationStatus;
  details?: string;
}

export async function runStatusCheck(
  input: StatusCheckInput
): Promise<StatusCheckOutput> {
  try {
    const application = await db.query.applications.findFirst({
      where: eq(applications.id, input.applicationId),
      with: {
        job: {
          with: {
            company: true,
          },
        },
        resume: true,
      },
    });

    if (!application) {
      return { success: false, error: 'Application not found' };
    }

    // Don't check terminal states
    const terminalStatuses: ApplicationStatus[] = [
      'submitted',
      'rejected',
      'withdrawn',
      'offer',
      'interview',
      'assessment',
      'needs_human',
    ];

    if (terminalStatuses.includes(application.status)) {
      return { success: true, details: `Application in terminal state: ${application.status}` };
    }

    const provider = getProvider(application.applicationUrl ?? application.job?.url);
    if (!provider) {
      return { success: false, error: `No provider for URL: ${application.applicationUrl}` };
    }

    // Check status via provider
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Navigate to application URL
      await page.goto(application.applicationUrl ?? application.job?.url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      // Check for status indicators on the page
      const status = await checkApplicationStatus(page, provider);

      if (status && status !== application.status) {
        // Update status
        const oldStatus = application.status;
        await updateApplicationStatus(application.id, status, oldStatus);

        return {
          success: true,
          statusChanged: true,
          newStatus: status,
          details: `Status changed from ${oldStatus} to ${status}`,
        };
      }

      // Update last_checked_at
      await db
        .update(applications)
        .set({ lastCheckedAt: new Date() })
        .where(eq(applications.id, application.id));

      return {
        success: true,
        statusChanged: false,
        details: `Status unchanged: ${application.status}`,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

async function checkApplicationStatus(
  page: any,
  provider: any
): Promise<ApplicationStatus | null> {
  try {
    // Provider-specific status checks
    if (provider.constructor.name.includes('Greenhouse')) {
      return await checkGreenhouseStatus(page);
    }
    // Add Lever, Ashby checks as needed
    return null;
  } catch {
    return null;
  }
}

async function checkGreenhouseStatus(page: any): Promise<ApplicationStatus | null> {
  try {
    // Check for status indicators on Greenhouse application page
    const statusSelectors = [
      { selector: 'text=/application submitted/i', status: 'submitted' as ApplicationStatus },
      { selector: 'text=/thank you for applying/i', status: 'submitted' as ApplicationStatus },
      { selector: 'text=/confirmation/i', status: 'submitted' as ApplicationStatus },
      { selector: 'text=/under review/i', status: 'submitted' as ApplicationStatus },
      { selector: 'text=/reviewing/i', status: 'submitted' as ApplicationStatus },
      { selector: 'text=/assessment/i', status: 'assessment' as ApplicationStatus },
      { selector: 'text=/interview/i', status: 'interview' as ApplicationStatus },
      { selector: 'text=/rejected/i', status: 'rejected' as ApplicationStatus },
      { selector: 'text=/declined/i', status: 'rejected' as ApplicationStatus },
      { selector: 'text=/not selected/i', status: 'rejected' as ApplicationStatus },
    ];

    for (const { selector, status } of statusSelectors) {
      const element = await page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        return status;
      }
    }

    // Check for specific status elements
    const statusElement = await page
      .locator('[data-status], .application-status, .status-badge, [class*="status"]')
      .first()
      .textContent()
      .catch(() => '');

    if (statusElement) {
      const text = statusElement.toLowerCase();
      if (text.includes('submitted') || text.includes('applied')) return 'submitted';
      if (text.includes('review') || text.includes('under review')) return 'submitted';
      if (text.includes('assessment') || text.includes('test')) return 'assessment';
      if (text.includes('interview')) return 'interview';
      if (text.includes('offer')) return 'offer';
      if (text.includes('reject') || text.includes('decline')) return 'rejected';
    }

    return null;
  } catch {
    return null;
  }
}

async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus,
  oldStatus: ApplicationStatus
): Promise<void> {
  // Use transaction for atomicity
  await db.transaction(async (tx) => {
    // Update application status
    await tx
      .update(applications)
      .set({
        status: newStatus,
        lastCheckedAt: new Date(),
        ...(newStatus === 'submitted' && { submittedAt: new Date() }),
        ...(newStatus === 'rejected' && { rejectionAt: new Date() }),
      })
      .where(eq(applications.id, applicationId));

    // Log event
    await tx.insert(applicationEvents).values({
      applicationId,
      eventType: 'STATUS_CHANGED' as ApplicationEventType,
      metadataJson: {
        oldStatus,
        newStatus,
        checkedAt: new Date().toISOString(),
      },
    });

    // Add specific event types for certain transitions
    const specificEvents: Record<string, ApplicationEventType> = {
      submitted: 'SUBMITTED',
      rejected: 'REJECTED',
      interview: 'INTERVIEW',
      assessment: 'ASSESSMENT',
      offer: 'STATUS_CHANGED',
      needs_human: 'NEEDS_HUMAN',
    };

    if (specificEvents[newStatus]) {
      await tx.insert(applicationEvents).values({
        applicationId,
        eventType: specificEvents[newStatus],
        metadataJson: {
          oldStatus,
          newStatus,
          checkedAt: new Date().toISOString(),
        },
      });
    }
  });
}

if (require.main === module) {
  const applicationId = process.argv[2];

  if (!applicationId) {
    console.error('Usage: pnpm status:check <applicationId>');
    process.exit(1);
  }

  runStatusCheck({ applicationId })
    .then((result) => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}