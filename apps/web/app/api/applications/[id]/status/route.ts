import { NextRequest, NextResponse } from 'next/server';
import { db, applications, applicationEvents } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ApplicationStatus, ApplicationEventType } from '@job-agent/domain';

const statusSchema = z.object({
  status: z.enum([
    'ready_for_review',
    'approved',
    'preparing',
    'applying',
    'submitted',
    'needs_human',
    'rejected',
    'assessment',
    'interview',
    'offer',
    'withdrawn',
    'failed',
  ]),
  notes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes } = z.object({
      status: z.enum([
        'ready_for_review',
        'approved',
        'preparing',
        'applying',
        'submitted',
        'needs_human',
        'rejected',
        'assessment',
        'interview',
        'offer',
        'withdrawn',
        'failed',
      ]),
      notes: z.string().optional(),
    }).parse(body);

    const application = await db.query.applications.findFirst({
      where: (applications, { eq }) => eq(applications.id, id),
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const oldStatus = application.status;

    // Update application status
    await db
      .update(applications)
      .set({
        status: status as any,
        notes,
        updatedAt: new Date(),
        ...(status === 'submitted' && { submittedAt: new Date() }),
      })
      .where(eq(applications.id, id));

    // Create event
    await db.insert(applicationEvents).values({
      applicationId: id,
      eventType: 'STATUS_CHANGED',
      metadataJson: {
        oldStatus,
        newStatus: status,
        notes,
        changedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Failed to update application status:', error);
    return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
  }
}