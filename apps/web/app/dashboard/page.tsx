import Link from 'next/link';

const stats = [
  { label: 'Jobs Discovered Today', value: '0', icon: '📋' },
  { label: 'Relevant Jobs', value: '0', icon: '🎯' },
  { label: 'Ready for Review', value: '0', icon: '⏳' },
  { label: 'Applications Submitted', value: '0', icon: '📤' },
  { label: 'Interviews', value: '0', icon: '🤝' },
  { label: 'Failed', value: '0', icon: '❌' },
];

export default function Dashboard() {
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
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 text-3xl">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
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
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              No recent activity. Start by discovering jobs or configuring sources.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
