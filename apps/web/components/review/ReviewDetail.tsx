'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ReviewDetailProps {
  application: any;
  onClose: () => void;
  onAction: (id: string, action: 'approve' | 'reject' | 'regenerate') => void;
}

export default function ReviewDetail({ application, onClose, onAction }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'job' | 'resume' | 'cover' | 'bullets' | 'similar'>(
    'job'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    fetchDetail();
  }, [application.id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/review/${application.id}`);
      if (!res.ok) throw new Error('Failed to fetch detail');
      const data = await res.json();
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load detail');
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'regenerate') => {
    setLoading(true);
    setError(null);
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

      const res = await fetch(`/api/review/${application.id}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Action failed');
      }

      onAction(application.id, action);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
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

  if (!detail) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="border-primary-600 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  const app = detail.application;
  const job = app.job;
  const resume = detail.resume;
  const analysis = job.analysis;
  const selectedBullets = detail.selectedBullets || [];
  const similarBullets = detail.similarBullets || [];

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
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                {detail.application.job.title}
              </h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  resume.track === 'ai_swe'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}
              >
                {resume.track === 'ai_swe' ? 'AI-SWE' : 'SWE'}
              </span>
              {analysis && (
                <span
                  className={`rounded-full px-3 py-1 font-mono text-sm ${getScoreColor(analysis.fitScore)}`}
                >
                  Fit: {analysis.fitScore}%
                </span>
              )}
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
              {detail.application.job.company.name}
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
                {detail.application.job.location || 'Remote'}
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
                {formatDate(detail.application.createdAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={loading}
              className="rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
            >
              Reject
            </button>
            <button
              onClick={() => handleAction('regenerate')}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Regenerate
            </button>
            <button
              onClick={() => handleAction('approve')}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? 'Approving...' : 'Approve & Continue'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex gap-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('job')}
              className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === 'job'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Job Analysis
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === 'resume'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Resume
            </button>
            <button
              onClick={() => setActiveTab('cover')}
              className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === 'cover'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab('bullets')}
              className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === 'bullets'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Bullets ({selectedBullets.length})
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`border-b-2 pb-4 text-sm font-medium transition-colors ${
                activeTab === 'similar'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Similar Bullets ({similarBullets.length})
            </button>
          </nav>
        </div>

        <div className="py-6">
          {activeTab === 'job' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Job Analysis
                </h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Track
                    </h4>
                    <p className="capitalize text-gray-900 dark:text-white">{analysis?.track}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Seniority
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {analysis?.seniority || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Experience Required
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {analysis?.experienceRequired || 'Not specified'} years
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Fit Score
                    </h4>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis?.fitScore || 0)}`}>
                      {analysis?.fitScore}%
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Explanation
                </h3>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {analysis?.explanation}
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Concerns
                </h3>
                <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                  {analysis?.concerns.map((c: string) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>

              <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.requiredSkills.map((s: string) => (
                      <span
                        key={s}
                        className="rounded bg-blue-50 px-2 py-1 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Preferred Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.preferredSkills.map((s: string) => (
                      <span
                        key={s}
                        className="rounded bg-purple-50 px-2 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.matchedSkills.map((s: string) => (
                      <span
                        key={s}
                        className="rounded bg-green-50 px-2 py-1 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.missingSkills.map((s: string) => (
                      <span
                        key={s}
                        className="rounded bg-red-50 px-2 py-1 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-6">
              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Summary
                </h3>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {resume.contentJson.summary}
                </p>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Experience
                </h3>
                <div className="space-y-4">
                  {resume.contentJson.experience?.map((exp: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {exp.role}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {exp.startDate} - {exp.endDate || 'Present'}
                          {exp.location && ` · ${exp.location}`}
                        </div>
                      </div>
                      <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                        {exp.bullets?.map((bullet: string, j: number) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Projects
                </h3>
                <div className="space-y-4">
                  {resume.contentJson.projects?.map((proj: any, i: number) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{proj.name}</h4>
                        {proj.technologies && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {proj.technologies.join(', ')}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className="mb-2 text-gray-700 dark:text-gray-300">{proj.description}</p>
                      )}
                      <ul className="list-inside list-disc space-y-1 text-gray-700 dark:text-gray-300">
                        {proj.bullets?.map((bullet: string, j: number) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.contentJson.skills?.map((skillGroup: any) => (
                    <div
                      key={skillGroup.category}
                      className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                    >
                      <h4 className="mb-1 font-medium text-gray-900 dark:text-white">
                        {skillGroup.category}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {skillGroup.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Education
                </h3>
                <div className="space-y-2">
                  {resume.contentJson.education?.map((edu: any, i: number) => (
                    <div
                      key={i}
                      className="flex flex-col border-b border-gray-200 py-2 last:border-0 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{edu.degree}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {edu.institution}
                        </p>
                      </div>
                      <p className="text-right text-sm text-gray-500 sm:text-left dark:text-gray-400">
                        {edu.graduationDate}, {edu.location}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'cover' && (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{resume.contentJson.coverNote}</p>
            </div>
          )}

          {activeTab === 'bullets' && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Selected Bullets ({selectedBullets.length})
                </h3>
              </div>
              <div className="space-y-3">
                {selectedBullets.map((bullet: any, i: number) => (
                  <div
                    key={bullet.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <p className="text-gray-900 dark:text-white">{bullet.text}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {bullet.trackTagsJson.map((t: string) => (
                        <span
                          key={t}
                          className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full px-2 py-0.5 text-xs capitalize"
                        >
                          {t}
                        </span>
                      ))}
                      {bullet.skillTagsJson.map((s: string) => (
                        <span
                          key={s}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Source: {bullet.sourceReference}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'similar' && (
            <div className="space-y-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Similar Verified Bullets ({similarBullets.length})
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  These bullets from your verified experience are semantically similar to the job
                  requirements.
                </p>
              </div>
              <div className="space-y-3">
                {similarBullets.map((bullet: any, i: number) => (
                  <div
                    key={bullet.id}
                    className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <p className="text-gray-900 dark:text-white">{bullet.text}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {bullet.trackTagsJson.map((t: string) => (
                        <span
                          key={t}
                          className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full px-2 py-0.5 text-xs capitalize"
                        >
                          {t}
                        </span>
                      ))}
                      {bullet.skillTagsJson.map((s: string) => (
                        <span
                          key={s}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Source: {bullet.sourceReference}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}
