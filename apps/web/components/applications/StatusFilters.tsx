'use client';

import { ApplicationStatus } from '@job-agent/domain';

interface StatusFiltersProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function StatusFilters({ currentFilter, onFilterChange }: StatusFiltersProps) {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'ready_for_review', label: 'Ready for Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'applying', label: 'Applying' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'needs_human', label: 'Needs Human' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'withdrawn', label: 'Withdrawn' },
    { value: 'failed', label: 'Failed' },
  ];

  return (
    <select
      value={currentFilter}
      onChange={(e) => onFilterChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}