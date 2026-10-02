'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReviewItem from './ReviewItem';
import ReviewDetail from './ReviewDetail';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  job: {
    id: string;
    title: string;
    company: { name: string };
    analysis?: {
      track: string;
      fitScore: number;
      matchedSkills: string[];
      missingSkills: string[];
    };
  };
  resume: {
    id: string;
    track: string;
    version: number;
    contentJson: {
      summary: string;
      coverNote: string;
      selectedBulletIds: string[];
    };
  };
}

export default function ReviewQueue() {
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [status, setStatus] = useState<'ready_for_review' | 'all'>('ready_for_review');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [status]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ status, limit: '50' });
      const res = await fetch(`/api/review?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (app: any) => {
    setSelectedApp(app);
  };

  const handleCloseDetail = () => {
    setSelectedApp(null);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'regenerate') => {
    try {
      let endpoint = '';
      let body: any = {};

      if (action === 'approve') {
        endpoint = '/approve';
      } else if (action === 'reject') {
        const reason = prompt('Rejection reason (required):');
        if (!reason) return;
        endpoint = '/reject';
        body = { reason };
      } else if (action === 'regenerate') {
        endpoint = '/regenerate';
      }

      const res = await fetch(`/api/review/${id}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Action failed');
      }

      // Refresh list
      fetchApplications();
      // Close detail if it was open
      if (selectedApp?.id === id) {
        setSelectedApp(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
  };

  if (selectedApp) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-800">
          <button
            onClick={handleCloseDetail}
            className="absolute right-4 top-4 z-10 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <ReviewDetail
            application={selectedApp}
            onClose={handleCloseDetail}
            onAction={handleAction}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Review Queue</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Review and approve application packages before submission
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ready_for_review' | 'all')}
              className="focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="ready_for_review">Ready for Review</option>
              <option value="all">All</option>
            </select>
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No applications
            </h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              No applications are currently awaiting review.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <ReviewItem key={app.id} application={app} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
