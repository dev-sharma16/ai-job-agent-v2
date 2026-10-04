'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Job {
  id: string;
  externalId: string;
  title: string;
  description: string;
  location: string | null;
  locationsJson: string[];
  remoteType: string | null;
  employmentType: string | null;
  url: string;
  applicationUrl: string | null;
  postedAt: string | null;
  discoveredAt: string;
  status: string;
  companyId: string | null;
  companyName: string | null;
  companySlug: string | null;
  companyWebsite: string | null;
  sourceId: string | null;
  sourceName: string | null;
  sourceType: string | null;
  fitScore: number | null;
  track: string | null;
  seniority: string | null;
  experienceRequired: number | null;
  requiredSkillsJson: string[];
  preferredSkillsJson: string[];
  matchedSkillsJson: string[];
  missingSkillsJson: string[];
  concernsJson: string[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  discovered: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  filtered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  analyzed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ready_for_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

const trackColors: Record<string, string> = {
  ai_swe: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  swe: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    track: '',
    search: '',
    minFitScore: '',
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.track && { track: filters.track }),
        ...(filters.search && { search: filters.search }),
        ...(filters.minFitScore && { minFitScore: filters.minFitScore }),
      });
      const res = await fetch(`/api/jobs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleAction = async (action: 'discover' | 'analyze') => {
    setActionLoading(action);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${action === 'discover' ? 'Job discovery' : 'Job analysis'} completed! ${data.result?.inserted ?? data.result?.analyzed ?? 0} jobs processed.`);
        fetchJobs();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  const truncate = (str: string, len: number) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jobs</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Browse and manage discovered job postings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleAction('discover')}
              disabled={actionLoading !== null}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
            >
              {actionLoading === 'discover' ? 'Discovering...' : 'Discover Jobs'}
            </button>
            <button
              onClick={() => handleAction('analyze')}
              disabled={actionLoading !== null}
              className="bg-green-600 hover:bg-green-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
            >
              {actionLoading === 'analyze' ? 'Analyzing...' : 'Analyze Jobs'}
            </button>
          </div>
        </header>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <input
                type="text"
                placeholder="Title, company, description..."
                value={filters.search}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="discovered">Discovered</option>
                <option value="filtered">Filtered</option>
                <option value="analyzed">Analyzed</option>
                <option value="ready_for_review">Ready for Review</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Track</label>
              <select
                value={filters.track}
                onChange={(e) => setFilters((prev) => ({ ...prev, track: e.target.value, page: 1 }))}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All</option>
                <option value="ai_swe">AI SWE</option>
                <option value="swe">SWE</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Min Fit Score</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0-100"
                value={filters.minFitScore}
                onChange={(e) => setFilters((prev) => ({ ...prev, minFitScore: e.target.value, page: 1 }))}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: '', track: '', search: '', minFitScore: '' })}
                className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg px-4 py-2 text-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 dark:border-gray-700 dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-4 text-6xl">📋</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No jobs found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.status || filters.track || filters.search ? 'Try adjusting your filters' : 'Click "Discover Jobs" to fetch jobs from configured sources'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                        {job.companyName && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            @ {job.companyName}
                          </span>
                        )}
                        {job.fitScore !== null && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            Fit: {job.fitScore}%
                          </span>
                        )}
                        {job.track && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${trackColors[job.track] || trackColors.other}`}>
                            {job.track.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[job.status] || statusColors.discovered}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {job.location && <span>📍 {job.location}</span>}
                        {job.remoteType && <span>🏠 {job.remoteType}</span>}
                        {job.employmentType && <span>💼 {job.employmentType.replace('_', ' ')}</span>}
                        {job.postedAt && <span>📅 Posted: {formatDate(job.postedAt)}</span>}
                        {job.sourceName && <span>🔗 Source: {job.sourceName} ({job.sourceType})</span>}
                      </div>
                      {job.seniority && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Seniority: {job.seniority}
                        </div>
                      )}
                      {job.experienceRequired !== null && job.experienceRequired > 0 && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Experience: {job.experienceRequired}+ years
                        </div>
                      )}
                      {(job.matchedSkillsJson?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Matched: </span>
                          {job.matchedSkillsJson.slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded dark:bg-green-900 dark:text-green-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {(job.missingSkillsJson?.length ?? 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Missing: </span>
                          {job.missingSkillsJson.slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded dark:bg-red-900 dark:text-red-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:ml-4">
                      <Link
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-sm text-white transition-colors"
                      >
                        View Job
                      </Link>
                      {job.applicationUrl && (
                        <a
                          href={job.applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 hover:bg-green-700 rounded-lg px-4 py-2 text-sm text-white transition-colors"
                        >
                          Apply
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
                <span className="px-4 text-gray-600 dark:text-gray-400">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}