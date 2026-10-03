import { db } from '@job-agent/db';
import { applications, applicationEvents, jobs, jobAnalysis, resumes, companies } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import ApplicationDetailClient from './ApplicationDetailClient';
import { ApplicationEventType, ApplicationStatus } from '@job-agent/domain';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface TypedApplication {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  rejectedAt?: string;
  lastCheckedAt?: string;
  notes?: string;
  applicationUrl?: string;
  coverNote?: string;
  answersJson: Array<{
    question: string;
    fieldType: string;
    answer: string;
    answerSource: string;
    confidence: number;
    requiresHuman: boolean;
  }>;
  job: {
    id: string;
    title: string;
    company: { name: string };
    url: string;
    applicationUrl?: string;
    location?: string;
    analysis?: {
      track: string;
      fitScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      requiredSkills: string[];
      preferredSkills: string[];
      concerns: string[];
      explanation: string;
    };
  };
  resume: {
    id: string;
    track: string;
    version: number;
    contentJson: {
      summary: string;
      coverNote: string;
      selectedBulletIds: string[];
    };
  };
}

interface TypedEvent {
  id: string;
  eventType: ApplicationEventType;
  metadataJson: {
    oldStatus?: string;
    newStatus?: string;
    notes?: string;
    changedAt?: string;
    reason?: string;
    checkedAt?: string;
  };
  createdAt: string;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Cast to any to bypass Drizzle's type limitations with `with` clause
  const application = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: {
      job: {
        with: {
          company: true,
          analysis: true,
        },
      },
      resume: true,
    },
  }) as any;

  if (!application) {
    notFound();
  }

  const events = await db.query.applicationEvents.findMany({
    where: eq(applicationEvents.applicationId, id),
    orderBy: (applicationEvents, { desc }) => desc(applicationEvents.createdAt),
  });

  // Map to typed application
  const typedApplication: TypedApplication = {
    id: application.id,
    status: application.status as ApplicationStatus,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    submittedAt: application.submittedAt?.toISOString(),
    rejectedAt: application.rejectedAt?.toISOString(),
    lastCheckedAt: application.lastCheckedAt?.toISOString(),
    notes: application.notes ?? undefined,
    applicationUrl: application.applicationUrl ?? undefined,
    coverNote: application.coverNote ?? undefined,
    answersJson: (application.answersJson as TypedApplication['answersJson']) ?? [],
    job: {
      id: application.job.id,
      title: application.job.title,
      company: { name: application.job.company.name },
      url: application.job.url,
      applicationUrl: application.job.applicationUrl ?? undefined,
      location: application.job.location ?? undefined,
      analysis: application.job.analysis ? {
        track: application.job.analysis.track as 'ai_swe' | 'swe' | 'other',
        fitScore: application.job.analysis.fitScore,
        matchedSkills: application.job.analysis.matchedSkills as string[],
        missingSkills: application.job.analysis.missingSkills as string[],
        requiredSkills: application.job.analysis.requiredSkills as string[],
        preferredSkills: application.job.analysis.preferredSkills as string[],
        concerns: application.job.analysis.concerns as string[],
        explanation: application.job.analysis.reasoning ?? '',
      } : undefined,
    },
    resume: {
      id: application.resume.id,
      track: application.resume.track,
      version: application.resume.version,
      contentJson: {
        summary: (application.resume.contentJson as any).summary ?? '',
        coverNote: (application.resume.contentJson as any).coverNote ?? '',
        selectedBulletIds: ((application.resume.contentJson as any).selectedBulletIds ?? []) as string[],
      },
    },
  };

  // Map events
  const typedEvents: TypedEvent[] = events.map(event => ({
    id: event.id,
    eventType: event.eventType as ApplicationEventType,
    metadataJson: event.metadataJson as TypedEvent['metadataJson'],
    createdAt: event.createdAt.toISOString(),
  }));

  return <ApplicationDetailClient application={typedApplication} events={typedEvents} />;
}