'use client';

import { ApplicationEventType, ApplicationStatus } from '@job-agent/domain';

interface TimelineEvent {
  id: string;
  eventType: ApplicationEventType | string;
  metadataJson: {
    oldStatus?: string;
    newStatus?: string;
    notes?: string;
    changedAt?: string;
    reason?: string;
    checkedAt?: string;
  };
  createdAt: string;
}

interface ApplicationTimelineProps {
  events: TimelineEvent[];
  currentStatus: ApplicationStatus | string;
}

const statusOrder: (ApplicationStatus | string)[] = [
  'discovered',
  'filtered',
  'analyzed',
  'ready_for_review',
  'approved',
  'preparing',
  'applying',
  'submitted',
  'assessment',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
  'needs_human',
  'failed',
];

const eventLabels: Record<string, string> = {
  DISCOVERED: 'Discovered',
  FILTERED: 'Filtered',
  ANALYZED: 'Analyzed',
  RESUME_SELECTED: 'Resume Selected',
  RESUME_GENERATED: 'Resume Generated',
  ANSWER_GENERATED: 'Answers Generated',
  READY_FOR_REVIEW: 'Ready for Review',
  APPROVED: 'Approved',
  APPLICATION_STARTED: 'Application Started',
  FORM_FILLED: 'Form Filled',
  SUBMITTED: 'Submitted',
  FAILED: 'Failed',
  NEEDS_HUMAN: 'Needs Human',
  REJECTED: 'Rejected',
  STATUS_CHANGED: 'Status Changed',
};

const statusLabels: Record<string, string> = {
  discovered: 'Discovered',
  filtered: 'Filtered',
  analyzed: 'Analyzed',
  ready_for_review: 'Ready for Review',
  approved: 'Approved',
  preparing: 'Preparing',
  applying: 'Applying',
  submitted: 'Submitted',
  needs_human: 'Needs Human',
  rejected: 'Rejected',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  withdrawn: 'Withdrawn',
  failed: 'Failed',
};

const statusColors: Record<string, string> = {
  discovered: 'bg-gray-500',
  filtered: 'bg-gray-500',
  analyzed: 'bg-blue-500',
  ready_for_review: 'bg-yellow-500',
  approved: 'bg-green-500',
  preparing: 'bg-blue-500',
  applying: 'bg-indigo-500',
  submitted: 'bg-purple-500',
  needs_human: 'bg-orange-500',
  rejected: 'bg-red-500',
  assessment: 'bg-cyan-500',
  interview: 'bg-pink-500',
  offer: 'bg-emerald-500',
  withdrawn: 'bg-gray-500',
  failed: 'bg-red-500',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case 'DISCOVERED':
    case 'FILTERED':
    case 'ANALYZED':
      return '🔍';
    case 'RESUME_SELECTED':
    case 'RESUME_GENERATED':
      return '📄';
    case 'ANSWER_GENERATED':
      return '✏️';
    case 'READY_FOR_REVIEW':
      return '⏳';
    case 'APPROVED':
      return '✅';
    case 'APPLICATION_STARTED':
    case 'FORM_FILLED':
      return '🚀';
    case 'SUBMITTED':
      return '📤';
    case 'FAILED':
      return '❌';
    case 'NEEDS_HUMAN':
      return '👤';
    case 'REJECTED':
      return '🚫';
    case 'STATUS_CHANGED':
      return '🔄';
    default:
      return '📌';
  }
}

export default function ApplicationTimeline({
  events,
  currentStatus,
}: ApplicationTimelineProps) {
  const currentStatusIndex = statusOrder.indexOf(currentStatus);

  // Sort events by date (newest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Status Progress Bar */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center justify-between">
          {statusOrder.slice(0, currentStatusIndex + 1).map((status, index) => (
            <div key={status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  statusColors[status]
                } ${index <= currentStatusIndex ? 'bg-white dark:bg-gray-900' : 'bg-gray-200 dark:bg-gray-700'}`}
              />
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center max-w-[80px]">
                {statusLabels[status]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Events */}
      <div className="relative ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-6">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative pb-6 last:pb-0">
            <div className="absolute left-[-22px] top-0 w-4 h-4 rounded-full border-2 bg-white dark:bg-gray-900 flex items-center justify-center">
              <span className="text-lg">{getEventIcon(event.eventType)}</span>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {eventLabels[event.eventType] ?? event.eventType}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                  {event.metadataJson.oldStatus && event.metadataJson.newStatus && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          statusColors[event.metadataJson.oldStatus as ApplicationStatus] ?? 'bg-gray-500'
                        } text-white`}
                      >
                        {statusLabels[event.metadataJson.oldStatus as ApplicationStatus] ?? event.metadataJson.oldStatus}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          statusColors[event.metadataJson.newStatus as ApplicationStatus] ?? 'bg-gray-500'
                        } text-white`}
                      >
                        {statusLabels[event.metadataJson.newStatus as ApplicationStatus] ?? event.metadataJson.newStatus}
                      </span>
                    </div>
                  )}
                  {event.metadataJson.reason && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                      Reason: {event.metadataJson.reason}
                    </p>
                  )}
                  {event.metadataJson.notes && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {event.metadataJson.notes}
                    </p>
                  )}
                  {event.metadataJson.checkedAt && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Checked: {formatDate(event.metadataJson.checkedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No timeline events yet
          </div>
        )}
      </div>
    </div>
  );
}