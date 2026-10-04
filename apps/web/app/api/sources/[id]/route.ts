import { NextRequest, NextResponse } from 'next/server';
import { db } from '@job-agent/db';
import { sources, companies } from '@job-agent/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const sourceSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['greenhouse', 'lever', 'ashby', 'email', 'manual']).optional(),
  configJson: z.record(z.unknown()).optional(),
  enabled: z.boolean().optional(),
  companyId: z.string().uuid().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await db.select().from(sources).where(eq(sources.id, id));

    if (data.length === 0) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const source = data[0];
    const config = source.configJson as Record<string, unknown>;
    const companyId = config.companyId as string | undefined;

    let company = null;
    if (companyId) {
      const companyData = await db.select().from(companies).where(eq(companies.id, companyId));
      company = companyData[0] || null;
    }

    return NextResponse.json({
      ...source,
      companyId: companyId || null,
      companyName: company?.name || null,
      companySlug: company?.slug || null,
      companyWebsite: company?.website || null,
      companyAtsType: company?.atsType || null,
    });
  } catch (error) {
    console.error('Failed to fetch source:', error);
    return NextResponse.json({ error: 'Failed to fetch source' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = sourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
      configJson: parsed.data.configJson,
      companyId: parsed.data.companyId ?? undefined,
      updatedAt: new Date(),
    };

    const result = await db
      .update(sources)
      .set(data)
      .where(eq(sources.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to update source:', error);
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(sources).where(eq(sources.id, id)).returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete source:', error);
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}