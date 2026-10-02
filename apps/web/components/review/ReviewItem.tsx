'use client';

import { Application } from '@/types/application';

interface ReviewItemProps {
  application: Application;
  onSelect: (app: Application) => void;
}

export default function ReviewItem({ application, onSelect }: ReviewItemProps) {
  const { job, resume, createdAt } = application;
  const analysis = job.analysis;
  const track = analysis?.track || resume.track;
  const fitScore = analysis?.fitScore || 0;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTrackBadge = (track: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      ai_swe: {
        label: 'AI-SWE',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      },
      swe: { label: 'SWE', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      other: {
        label: 'Other',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      },
    };
    return configs[track] || configs.other;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div
      className="hover:border-primary-500/50 cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors dark:border-gray-700 dark:bg-gray-800"
      onClick={() => onSelect(application)}
    >
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                {application.job.title}
              </h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  getTrackBadge(application.resume.track).color
                }`}
              >
                {getTrackBadge(application.resume.track).label}
              </span>
              {application.job.analysis && (
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-xs ${getScoreColor(application.job.analysis.fitScore)}`}
                >
                  Fit: {application.job.analysis.fitScore}%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {application.job.company.name}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {application.job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatDate(createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 text-xs text-gray-500 dark:text-gray-400">Match Details</div>
              <div className="flex flex-wrap gap-1">
                {analysis?.matchedSkills?.slice(0, 3).map((skill: string) => (
                  <span
                    key={skill}
                    className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {skill}
                  </span>
                ))}
                {analysis?.matchedSkills && analysis.matchedSkills.length > 3 && (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    +{analysis.matchedSkills.length - 3} more
                  </span>
                )}
              </div>
              {analysis?.missingSkills && analysis.missingSkills.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {analysis.missingSkills.slice(0, 2).map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    >
                      {skill}
                    </span>
                  ))}
                  {analysis?.missingSkills && analysis.missingSkills.length > 2 && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      +{analysis.missingSkills.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="bg-primary-600 hover:bg-primary-700 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
              >
                Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
