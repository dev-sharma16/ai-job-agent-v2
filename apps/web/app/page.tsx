import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Job Application Agent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Personal job discovery and application assistant
          </p>
        </header>

        <nav className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard"
            className="hover:border-primary-500 dark:hover:border-primary-500 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Overview of jobs, applications, and pipeline status
            </p>
          </Link>

          <Link
            href="/jobs"
            className="hover:border-primary-500 dark:hover:border-primary-500 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Jobs</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Browse discovered and analyzed job postings
            </p>
          </Link>

          <Link
            href="/review"
            className="hover:border-primary-500 dark:hover:border-primary-500 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Review Queue
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Review and approve application packages
            </p>
          </Link>

          <Link
            href="/applications"
            className="hover:border-primary-500 dark:hover:border-primary-500 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Applications
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track submitted applications and status
            </p>
          </Link>

          <Link
            href="/profile"
            className="hover:border-primary-500 dark:hover:border-primary-500 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Manage profile, experience, and verified bullets
            </p>
          </Link>

          <Link
            href="/settings"
            className="hover:border-primary-500 dark:hover:border-primary-500 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configure sources, filters, and preferences
            </p>
          </Link>
        </nav>

        <div className="border-t border-gray-200 pt-8 text-center dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            Built with Next.js, Neon PostgreSQL, Gemini AI, and Playwright
          </p>
        </div>
      </div>
    </main>
  );
}
