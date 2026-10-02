import { NextRequest, NextResponse } from 'next/server';
import { db, verifiedBullets, experienceEntries, projects } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ResumeTrack } from '@job-agent/domain';

const bulletSchema = z.object({
  experienceId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  text: z.string().min(1),
  trackTagsJson: z.array(z.nativeEnum(ResumeTrack)).default([]),
  skillTagsJson: z.array(z.string()).default([]),
  sourceReference: z.string().min(1),
  verified: z.boolean().default(true),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = bulletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Validate references
    if (parsed.data.experienceId) {
      const exp = await db.query.experienceEntries.findFirst({
        where: eq(experienceEntries.id, parsed.data.experienceId),
      });
      if (!exp) {
        return NextResponse.json({ error: 'Experience not found' }, { status: 400 });
      }
    }
    if (parsed.data.projectId) {
      const proj = await db.query.projects.findFirst({
        where: eq(projects.id, parsed.data.projectId),
      });
      if (!proj) {
        return NextResponse.json({ error: 'Project not found' }, { status: 400 });
      }
    }

    const result = await db
      .update(verifiedBullets)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(verifiedBullets.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update bullet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(verifiedBullets).where(eq(verifiedBullets.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete bullet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
