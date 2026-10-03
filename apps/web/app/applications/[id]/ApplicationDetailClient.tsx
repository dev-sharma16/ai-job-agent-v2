'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Application, ApplicationEventType, ApplicationStatus } from '@job-agent/domain';
import ApplicationTimeline from '@/components/applications/ApplicationTimeline';
import { formatDate } from '@/lib/utils';

interface ApplicationDetailClientProps {
  application: {
    id: string;
    status: ApplicationStatus | string;
    createdAt: string;
    updatedAt: string;
    submittedAt?: string;
    rejectedAt?: string;
    lastCheckedAt?: string;
    notes?: string;
    applicationUrl?: string;
    coverNote?: string;
    answersJson: Array<{
      question: string;
      fieldType: string;
      answer: string;
      answerSource: string;
      confidence: number;
      requiresHuman: boolean;
    }>;
    job: {
      id: string;
      title: string;
      company: { name: string };
      url: string;
      applicationUrl?: string;
      location?: string;
      analysis?: {
        track: string;
        fitScore: number;
        matchedSkills: string[];
        missingSkills: string[];
        requiredSkills: string[];
        preferredSkills: string[];
        concerns: string[];
        explanation: string;
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
  };
  events: Array<{
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
  }>;
}

export default function ApplicationDetailClient({
  application,
  events,
}: ApplicationDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'resume' | 'answers'>('overview');

  const handleAction = async (action: 'approve' | 'reject' | 'regenerate' | 'submit') => {
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
      } else if (action === 'submit') {
        endpoint = '/submit';
      }

      const res = await fetch(`/api/applications/${application.id}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Action failed');
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    }
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
    discovered: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    filtered: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    analyzed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    ready_for_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    applying: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    submitted: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    needs_human: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    assessment: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    interview: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    offer: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    withdrawn: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    failed: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {application.job.title}
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              {application.job.company.name}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status]}`}>
              {statusLabels[application.status]}
            </span>
            <a
              href={application.job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Job
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-1" aria-label="Application sections">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'resume', label: 'Resume' },
              { id: 'answers', label: 'Answers' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Job Details */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Location</label>
                  <p className="text-gray-900 dark:text-white">{application.job.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Application URL</label>
                  <p className="text-gray-900 dark:text-white">
                    <a href={application.applicationUrl ?? application.job.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {application.applicationUrl ?? application.job.url}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Cover Note</label>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{application.coverNote || 'No cover note'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Browser Provider</label>
                  <p className="text-gray-900 dark:text-white capitalize">
                    {application.job.analysis?.track === 'ai_swe' ? 'AI-SWE' : 'SWE'}
                  </p>
                </div>
              </div>
            </section>

            {/* AI Analysis */}
            {application.job.analysis && (
              <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Track</label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {application.job.analysis.track === 'ai_swe' ? 'AI Software Engineer' : 'Software Engineer'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Fit Score</label>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{application.job.analysis.fitScore}%</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Matched Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.job.analysis.matchedSkills.slice(0, 10).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                          {skill}
                        </span>
                      ))}
                      {application.job.analysis.matchedSkills.length > 10 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{application.job.analysis.matchedSkills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Missing Skills</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {application.job.analysis.missingSkills.slice(0, 10).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                          {skill}
                        </span>
                      ))}
                      {application.job.analysis.missingSkills.length > 10 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{application.job.analysis.missingSkills.length - 10} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-500 dark:text-gray-400">Analysis</label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap mt-1">{application.job.analysis.explanation}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Actions */}
            <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {application.status === 'ready_for_review' && (
                  <>
                    <button
                      onClick={() => handleAction('approve')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve & Submit
                    </button>
                    <button
                      onClick={() => handleAction('reject')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction('regenerate')}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Regenerate
                    </button>
                  </>
                )}
                {application.status === 'approved' && (
                  <button
                    onClick={() => handleAction('submit')}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Submit Application
                  </button>
                )}
                {['submitted', 'assessment', 'interview'].includes(application.status) && (
                  <button
                    onClick={() => handleAction('submit')}
                    disabled
                    className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
                  >
                    Already Submitted
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Timeline</h2>
            <ApplicationTimeline events={events} currentStatus={application.status} />
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generated Resume</h2>
            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Summary</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{application.resume.contentJson.summary}</p>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Cover Note</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{application.resume.contentJson.coverNote}</p>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Selected Bullet IDs</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                {application.resume.contentJson.selectedBulletIds?.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>

              <div className="mt-4">
                <a
                  href={application.job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  View Job Posting
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'answers' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Answers</h2>
            <div className="space-y-4">
              {application.answersJson.map((answer, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{answer.question}</h4>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        {answer.fieldType}
                      </span>
                      {answer.requiresHuman && (
                        <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded">
                          Needs Human
                        </span>
                      )}
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                        Confidence: {answer.confidence}%
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{answer.answer}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Source: {answer.answerSource}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}