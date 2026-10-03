import { db } from '@job-agent/db';
import { jobs, jobAnalysis, applications, systemRuns } from '@job-agent/db';
import { eq, and, gte, sql, desc, count, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { subDays, startOfDay } from 'date-fns';

export async function GET() {
  try {
    const today = startOfDay(new Date());

    // Jobs discovered today
    const jobsToday = await db
      .select({ count: count() })
      .from(jobs)
      .where(gte(jobs.discoveredAt, today));

    // Relevant jobs (analyzed with fit score >= 60)
    const relevantJobs = await db
      .select({ count: count() })
      .from(jobs)
      .innerJoin(jobAnalysis, eq(jobAnalysis.jobId, jobs.id))
      .where(and(
        eq(jobs.status, 'analyzed'),
        gte(jobAnalysis.fitScore, 60)
      ));

    // Ready for review applications
    const readyForReview = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'ready_for_review'));

    // Applications submitted
    const submitted = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'submitted'));

    // Interview applications
    const interviews = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'interview'));

    // Failed applications
    const failed = await db
      .select({ count: count() })
      .from(applications)
      .where(eq(applications.status, 'failed'));

    // Recent system runs
    const recentRuns = await db
      .select({
        type: systemRuns.type,
        status: systemRuns.status,
        startedAt: systemRuns.startedAt,
        finishedAt: systemRuns.finishedAt,
        itemsProcessed: systemRuns.itemsProcessed,
        itemsFailed: systemRuns.itemsFailed,
      })
      .from(systemRuns)
      .orderBy(desc(systemRuns.startedAt))
      .limit(10);

    return NextResponse.json({
      stats: {
        jobsDiscoveredToday: jobsToday[0]?.count ?? 0,
        relevantJobs: relevantJobs[0]?.count ?? 0,
        readyForReview: readyForReview[0]?.count ?? 0,
        applicationsSubmitted: submitted[0]?.count ?? 0,
        interviews: interviews[0]?.count ?? 0,
        failed: failed[0]?.count ?? 0,
      },
      recentRuns,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}