import { NextRequest, NextResponse } from 'next/server';
import { db, applications, jobs, applicationEvents } from '@job-agent/db';
import { eq, desc } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await db.query.applications.findFirst({
      where: (applications, { eq }) => eq(applications.id, id),
      with: {
        job: {
          with: {
            company: true,
            analysis: true,
          },
        },
        resume: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch events/timeline
    const events = await db.query.applicationEvents.findMany({
      where: (events, { eq }) => eq(events.applicationId, id),
      orderBy: desc(applicationEvents.createdAt),
    });

    return NextResponse.json({
      application,
      events,
    });
  } catch (error) {
    console.error('Failed to fetch application:', error);
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}