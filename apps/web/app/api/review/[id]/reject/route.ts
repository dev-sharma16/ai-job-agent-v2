import { NextRequest, NextResponse } from 'next/server';
import { db, applications, applicationEvents } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { ApplicationStatus, ApplicationEventType } from '@job-agent/domain';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { reason } = rejectSchema.parse(body);

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
      .set({ status: ApplicationStatus.REJECTED, updatedAt: new Date(), notes: reason })
      .where(eq(applications.id, id));

    // Create event
    await db.insert(applicationEvents).values({
      applicationId: id,
      eventType: ApplicationEventType.REJECTED,
      metadataJson: { reason, rejectedAt: new Date().toISOString() },
    });

    return NextResponse.json({ success: true, status: ApplicationStatus.REJECTED });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Failed to reject application:', error);
    return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 });
  }
}
