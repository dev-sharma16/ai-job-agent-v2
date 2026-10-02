import { NextRequest, NextResponse } from 'next/server';
import { db, projects } from '@job-agent/db';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  technologiesJson: z.array(z.string()).default([]),
  verified: z.boolean().default(true),
});

export async function GET() {
  try {
    const result = await db.query.projects.findMany({
      orderBy: desc(projects.createdAt),
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await db.insert(projects).values(parsed.data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
