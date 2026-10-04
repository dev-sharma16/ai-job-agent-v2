import { NextRequest, NextResponse } from 'next/server';
import { db } from '@job-agent/db';
import { sources, companies } from '@job-agent/db';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const sourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['greenhouse', 'lever', 'ashby', 'email', 'manual']),
  configJson: z.record(z.unknown()),
  enabled: z.boolean().default(true),
  companyId: z.string().uuid().nullable().optional(),
});

export async function GET() {
  try {
    const sourcesData = await db
      .select()
      .from(sources)
      .orderBy(desc(sources.createdAt));

    // Enrich with company info from configJson
    const companiesData = await db.select().from(companies);
    const companyMap = new Map(companiesData.map(c => [c.id, c]));

    const enriched = sourcesData.map(s => {
      const config = s.configJson as Record<string, unknown>;
      const companyId = config.companyId as string | undefined;
      const company = companyId ? companyMap.get(companyId) : null;
      return {
        ...s,
        companyId: companyId || null,
        companyName: company?.name || null,
        companySlug: company?.slug || null,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Failed to fetch sources:', error);
    return NextResponse.json({ error: 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      companyId: parsed.data.companyId || null,
    };

    const result = await db.insert(sources).values(data).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to create source:', error);
    return NextResponse.json({ error: 'Failed to create source' }, { status: 500 });
  }
}