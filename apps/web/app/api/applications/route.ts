import { NextRequest, NextResponse } from 'next/server';
import { db, applications, jobs, applicationEvents } from '@job-agent/db';
import { eq, desc, and } from 'drizzle-orm';
import { ApplicationStatus } from '@job-agent/domain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause = status ? eq(applications.status, status as ApplicationStatus) : undefined;

    const applicationsList = await db.query.applications.findMany({
      where: whereClause,
      orderBy: desc(applications.createdAt),
      limit,
      offset,
      with: {
        job: {
          with: {
            company: true,
            analysis: true,
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
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}