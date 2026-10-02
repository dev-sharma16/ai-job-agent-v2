import { NextRequest, NextResponse } from 'next/server';
import { db, applications, jobs, resumes, jobAnalysis, jobEmbeddings } from '@job-agent/db';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ready_for_review';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const applicationsList = await db.query.applications.findMany({
      where: eq(applications.status, status as any),
      orderBy: desc(applications.createdAt),
      limit,
      offset,
      with: {
        job: {
          with: {
            company: true,
            analysis: true,
            embeddings: true,
          },
        },
        resume: true,
      },
    });

    return NextResponse.json({
      applications: applicationsList,
      total: applicationsList.length,
    });
  } catch (error) {
    console.error('Failed to fetch review queue:', error);
    return NextResponse.json({ error: 'Failed to fetch review queue' }, { status: 500 });
  }
}
