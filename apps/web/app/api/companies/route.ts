import { NextRequest, NextResponse } from 'next/server';
import { db } from '@job-agent/db';
import { companies } from '@job-agent/db';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  website: z.string().url().optional().or(z.literal('')),
  atsType: z.enum(['greenhouse', 'lever', 'ashby', 'other']).optional(),
  enabled: z.boolean().default(true),
  blocked: z.boolean().default(false),
});

export async function GET() {
  try {
    const data = await db
      .select()
      .from(companies)
      .orderBy(desc(companies.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = companySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
      website: parsed.data.website || null,
      atsType: parsed.data.atsType || null,
    };

    const result = await db.insert(companies).values(data).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to create company:', error);
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json({ error: 'Company slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}