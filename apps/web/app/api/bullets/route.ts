import { NextRequest, NextResponse } from 'next/server';
import { db, verifiedBullets, experienceEntries, projects } from '@job-agent/db';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { ResumeTrack } from '@job-agent/domain';

interface BulletRecord {
  id: string;
  experienceId: string | null;
  projectId: string | null;
  text: string;
  trackTagsJson: ResumeTrack[];
  skillTagsJson: string[];
  sourceReference: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bulletSchema = z.object({
  experienceId: z.string().uuid().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  text: z.string().min(1),
  trackTagsJson: z.array(z.nativeEnum(ResumeTrack)).default([]),
  skillTagsJson: z.array(z.string()).default([]),
  sourceReference: z.string().min(1),
  verified: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track') as ResumeTrack | null;
    const skill = searchParams.get('skill');

    let result: BulletRecord[];
    if (track) {
      result = (await db.query.verifiedBullets.findMany({
        orderBy: desc(verifiedBullets.createdAt),
      })) as BulletRecord[];
      result = result.filter((b) => b.trackTagsJson.includes(track));
    } else if (skill) {
      result = (await db.query.verifiedBullets.findMany({
        orderBy: desc(verifiedBullets.createdAt),
      })) as BulletRecord[];
      result = result.filter((b) => b.skillTagsJson.includes(skill));
    } else {
      result = (await db.query.verifiedBullets.findMany({
        orderBy: desc(verifiedBullets.createdAt),
      })) as BulletRecord[];
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch bullets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const result = await db.insert(verifiedBullets).values(parsed.data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create bullet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
