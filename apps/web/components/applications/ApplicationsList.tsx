'use client';

import { Application, ApplicationStatus } from '@job-agent/domain';

interface ApplicationsListProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  formatDate: (dateStr: string) => string;
}

const badgeConfig: Record<string, { label: string; color: string }> = {
  ready_for_review: { label: 'Ready for Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  applying: { label: 'Applying', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  submitted: { label: 'Submitted', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  needs_human: { label: 'Needs Human', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  assessment: { label: 'Assessment', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200' },
  interview: { label: 'Interview', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
  offer: { label: 'Offer', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
  failed: { label: 'Failed', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-300' },
};

export default function ApplicationsList({
  applications,
  onSelect,
  formatDate,
}: ApplicationsListProps) {
  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const statusConfig = badgeConfig[app.status] || badgeConfig.ready_for_review;
        const analysis = app.job.analysis;

        return (
          <div
            key={app.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-primary-500/50 transition-colors cursor-pointer"
            onClick={() => onSelect(app)}
          >
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {app.job.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        badgeConfig[app.status]?.color || badgeConfig.ready_for_review.color
                      }`}
                    >
                      {badgeConfig[app.status]?.label || badgeConfig.ready_for_review.label}
                    </span>
                    {app.job.analysis && (
                      <span className={`px-2 py-0.5 text-xs font-mono rounded-full ${
                        app.job.analysis!.fitScore >= 80
                          ? 'text-green-600 dark:text-green-400'
                          : app.job.analysis!.fitScore >= 60
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Fit: {app.job.analysis!.fitScore}%
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                    {app.job.company.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {app.job.location || 'Remote'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(app.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Match Details</div>
                    <div className="flex flex-wrap gap-1">
                      {app.job.analysis?.matchedSkills?.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-2 py-0.5 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                          {skill}
                        </span>
                      ))}
                      {app.job.analysis?.matchedSkills.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{app.job.analysis!.matchedSkills.length - 3} more
                        </span>
                      )}
                    </div>
                    {app.job.analysis?.missingSkills.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {app.job.analysis!.missingSkills.slice(0, 2).map((skill: string) => (
                          <span key={skill} className="px-2 py-0.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                            {skill}
                          </span>
                        ))}
                        {app.job.analysis!.missingSkills.length > 2 && (
                          <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            +{app.job.analysis!.missingSkills.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });
}
}
