'use client';

import { useState, useEffect } from 'react';
import { ApplicationStatus } from '@job-agent/domain';
import ApplicationsList from '@/components/applications/ApplicationsList';
import StatusFilters from '@/components/applications/StatusFilters';

interface Application {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  rejectedAt?: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    company: { name: string };
    location?: string;
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
  };
}

interface ApplicationEvent {
  id: string;
  eventType: string;
  metadataJson: {
    oldStatus?: string;
    newStatus?: string;
    notes?: string;
    changedAt?: string;
    reason?: string;
  };
  createdAt: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      const res = await fetch(`/api/applications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      setApplications(data.applications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      fetchApplications();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const configs: Record<ApplicationStatus, { label: string; color: string }> = {
      discovered: { label: 'Discovered', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
      filtered: { label: 'Filtered', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' },
      analyzed: { label: 'Analyzed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
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
    return configs[status] || configs.discovered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Applications</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Track and manage your job applications</p>
          </div>
          <StatusFilters
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No applications</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">No applications found. Start by discovering jobs!</p>
          </div>
        ) : (
          <ApplicationsList
            applications={applications}
            onSelect={setSelectedApp}
            getStatusBadge={getStatusBadge}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
}