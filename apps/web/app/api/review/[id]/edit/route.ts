import { NextRequest, NextResponse } from 'next/server';
import { db, applications, resumes } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createHash } from 'crypto';

const editSchema = z.object({
  contentJson: z.any(),
  track: z.enum(['ai_swe', 'swe']).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { contentJson, track } = editSchema.parse(body);

    const application = await db.query.applications.findFirst({
      where: eq(applications.id, id),
      with: { resume: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Update resume content
    const resumeId = application.resumeId;
    const contentHash = createHash('sha256')
      .update(JSON.stringify(contentJson))
      .digest('hex');

    const [updatedResume] = await db
      .update(resumes)
      .set({
        contentJson,
        contentHash,
        ...(track && { track: track as 'ai_swe' | 'swe' }),
      })
      .where(eq(resumes.id, resumeId))
      .returning();

    if (!updatedResume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Update application
    await db.update(applications).set({ updatedAt: new Date() }).where(eq(applications.id, id));

    return NextResponse.json({ success: true, resume: updatedResume });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Failed to edit resume:', error);
    return NextResponse.json({ error: 'Failed to edit resume' }, { status: 500 });
  }
}
