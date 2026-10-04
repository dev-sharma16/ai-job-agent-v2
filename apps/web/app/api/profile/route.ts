import { NextRequest, NextResponse } from 'next/server';
import { db, profile } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  noticePeriod: z.string().optional(),
  workAuthorization: z.string().optional(),
  expectedSalary: z.string().optional(),
  otherVerifiedDataJson: z.record(z.unknown()).optional(),
});

export async function GET() {
  try {
    const result = await db.query.profile.findFirst();
    if (!result) {
      return NextResponse.json({});
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await db.query.profile.findFirst();

    const data = {
      ...parsed.data,
      linkedinUrl: parsed.data.linkedinUrl || null,
      githubUrl: parsed.data.githubUrl || null,
      portfolioUrl: parsed.data.portfolioUrl || null,
      otherVerifiedDataJson: parsed.data.otherVerifiedDataJson || {},
      updatedAt: new Date(),
    };

    let result;
    if (existing) {
      result = await db.update(profile).set(data).where(eq(profile.id, existing.id)).returning();
    } else {
      result = await db.insert(profile).values(data).returning();
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
