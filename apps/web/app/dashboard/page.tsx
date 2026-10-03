import Link from 'next/link';
import { db } from '@job-agent/db';
import { jobs, jobAnalysis, applications, systemRuns } from '@job-agent/db';
import { eq, and, gte, sql, desc, count, inArray } from 'drizzle-orm';
import { startOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const today = startOfDay(new Date());

  const [jobsToday, relevantJobs, readyForReview, submitted, interviews, failed, recentRuns] = await Promise.all([
    db.select({ count: count() }).from(jobs).where(gte(jobs.discoveredAt, today)),
    db
      .select({ count: count() })
      .from(jobs)
      .innerJoin(jobAnalysis, eq(jobAnalysis.jobId, jobs.id))
      .where(and(eq(jobs.status, 'analyzed'), gte(jobAnalysis.fitScore, 60))),
    db.select({ count: count() }).from(applications).where(eq(applications.status, 'ready_for_review')),
    db.select({ count: count() }).from(applications).where(eq(applications.status, 'submitted')),
    db.select({ count: count() }).from(applications).where(eq(applications.status, 'interview')),
    db.select({ count: count() }).from(applications).where(eq(applications.status, 'failed')),
    db
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
      .limit(10),
  ]);

  return {
    stats: {
      jobsDiscoveredToday: jobsToday[0]?.count ?? 0,
      relevantJobs: relevantJobs[0]?.count ?? 0,
      readyForReview: readyForReview[0]?.count ?? 0,
      applicationsSubmitted: submitted[0]?.count ?? 0,
      interviews: interviews[0]?.count ?? 0,
      failed: failed[0]?.count ?? 0,
    },
    recentRuns,
  };
}

const statConfig = [
  { label: 'Jobs Discovered Today', key: 'jobsDiscoveredToday', icon: '📋' },
  { label: 'Relevant Jobs', key: 'relevantJobs', icon: '🎯' },
  { label: 'Ready for Review', key: 'readyForReview', icon: '⏳' },
  { label: 'Applications Submitted', key: 'applicationsSubmitted', icon: '📤' },
  { label: 'Interviews', key: 'interviews', icon: '🤝' },
  { label: 'Failed', key: 'failed', icon: '❌' },
];

export default async function Dashboard() {
  const { stats, recentRuns } = await getDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Overview of your job application pipeline
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statConfig.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 text-3xl">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats[stat.key as keyof typeof stats] ?? 0}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/jobs?action=discover"
                className="hover:border-primary-500 block rounded-lg border border-gray-200 p-4 transition-colors dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-white">Discover New Jobs</span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Run ingestion from configured sources
                </p>
              </Link>
              <Link
                href="/jobs?action=analyze"
                className="hover:border-primary-500 block rounded-lg border border-gray-200 p-4 transition-colors dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  Analyze Pending Jobs
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Run AI analysis on filtered jobs
                </p>
              </Link>
              <Link
                href="/review"
                className="hover:border-primary-500 block rounded-lg border border-gray-200 p-4 transition-colors dark:border-gray-700"
              >
                <span className="font-medium text-gray-900 dark:text-white">
                  Review Applications
                </span>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Approve or reject prepared applications
                </p>
              </Link>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h2>
            {recentRuns.length > 0 ? (
              <div className="space-y-3">
                {recentRuns.map((run) => (
                  <div
                    key={`${run.type}-${run.startedAt}`}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          run.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : run.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {run.status}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {run.type.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {run.itemsProcessed} processed
                      {(run.itemsFailed ?? 0) > 0 && `, ${run.itemsFailed} failed`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                No recent activity. Start by discovering jobs or configuring sources.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
