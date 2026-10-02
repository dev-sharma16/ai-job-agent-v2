import { NextRequest, NextResponse } from 'next/server';
import { db, experienceEntries } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { EmploymentType } from '@job-agent/domain';

const experienceSchema = z.object({
  company: z.string().min(1),
  role: z.string().min(1),
  employmentType: z.nativeEnum(EmploymentType),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  verified: z.boolean().default(true),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = experienceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      updatedAt: new Date(),
    };

    const result = await db
      .update(experienceEntries)
      .set(data)
      .where(eq(experienceEntries.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(experienceEntries)
      .where(eq(experienceEntries.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
