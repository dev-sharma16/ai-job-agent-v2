import { NextRequest, NextResponse } from 'next/server';
import { db, applications, applicationEvents } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { ApplicationStatus, ApplicationEventType } from '@job-agent/domain';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const application = await db.query.applications.findFirst({
      where: eq(applications.id, id),
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'ready_for_review') {
      return NextResponse.json({ error: 'Application not in review status' }, { status: 400 });
    }

    // Update application status
    await db
      .update(applications)
      .set({ status: ApplicationStatus.APPROVED, updatedAt: new Date() })
      .where(eq(applications.id, id));

    // Create event
    await db.insert(applicationEvents).values({
      applicationId: id,
      eventType: ApplicationEventType.APPROVED,
      metadataJson: { approvedAt: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, status: ApplicationStatus.APPROVED });
  } catch (error) {
    console.error('Failed to approve application:', error);
    return NextResponse.json({ error: 'Failed to approve application' }, { status: 500 });
  }
}
