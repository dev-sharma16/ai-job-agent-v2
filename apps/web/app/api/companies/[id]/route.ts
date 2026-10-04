import { NextRequest, NextResponse } from 'next/server';
import { db } from '@job-agent/db';
import { companies } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const companySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  website: z.string().url().optional().or(z.literal('')).optional(),
  atsType: z.enum(['greenhouse', 'lever', 'ashby', 'other']).optional(),
  enabled: z.boolean().optional(),
  blocked: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await db.select().from(companies).where(eq(companies.id, id));

    if (data.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Failed to fetch company:', error);
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      updatedAt: new Date(),
    };

    const result = await db
      .update(companies)
      .set(data)
      .where(eq(companies.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update company:', error);
    return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(companies).where(eq(companies.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete company:', error);
    return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
  }
}