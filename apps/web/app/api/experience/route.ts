import { NextRequest, NextResponse } from 'next/server';
import { db, experienceEntries } from '@job-agent/db';
import { eq, desc } from 'drizzle-orm';
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

export async function GET() {
  try {
    const result = await db.query.experienceEntries.findMany({
      orderBy: desc(experienceEntries.startDate),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
    };

    const result = await db.insert(experienceEntries).values(data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create experience:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
