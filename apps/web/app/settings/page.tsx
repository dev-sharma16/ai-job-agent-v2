'use client';

import { useState, useEffect } from 'react';
import { JobFilterPolicy, EmploymentType, ResumeTrack } from '@job-agent/domain';

type FilterPolicy = JobFilterPolicy & {
  excludedEmploymentTypes: EmploymentType[];
};

const DEFAULT_POLICY: FilterPolicy = {
  allowedTracks: [ResumeTrack.AI_SWE, ResumeTrack.SWE],
  maxExperienceYears: 8,
  allowedLocations: [],
  allowRemote: true,
  excludedTitleTerms: [
    'senior',
    'staff',
    'lead',
    'principal',
    'manager',
    'director',
    'architect',
    'vp',
    'vice president',
    'head of',
    'chief',
    'cto',
    'cfo',
    'ceo',
    'intern',
    'internship',
    'co-op',
    'coop',
    'apprentice',
    'trainee',
    'entry level',
    'junior',
    'associate',
    'fellow',
  ],
  blockedCompanies: [],
  excludedEmploymentTypes: [EmploymentType.INTERNSHIP, EmploymentType.CONTRACT],
};

export default function SettingsPage() {
  const [policy, setPolicy] = useState<FilterPolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ filtered: number; kept: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [excludedTitleTermsText, setExcludedTitleTermsText] = useState('');
  const [blockedCompaniesText, setBlockedCompaniesText] = useState('');
  const [allowedLocationsText, setAllowedLocationsText] = useState('');

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await fetch('/api/filters');
      if (res.ok) {
        const data = await res.json();
        setPolicy(data);
        setExcludedTitleTermsText(data.excludedTitleTerms.join('\n'));
        setBlockedCompaniesText(data.blockedCompanies.join('\n'));
        setAllowedLocationsText(data.allowedLocations.join('\n'));
      }
    } catch (err) {
      setError('Failed to load filter policy');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: FilterPolicy = {
      ...policy,
      excludedTitleTerms: excludedTitleTermsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      blockedCompanies: blockedCompaniesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      allowedLocations: allowedLocationsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setPolicy(data.policy);
        setResult(data.result);
        setSuccess('Filter policy saved and applied successfully');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save filter policy');
      }
    } catch (err) {
      setError('Failed to save filter policy');
    } finally {
      setSaving(false);
    }
  };

  const handleTrackChange = (track: ResumeTrack) => {
    setPolicy((prev) => ({
      ...prev,
      allowedTracks: prev.allowedTracks.includes(track)
        ? prev.allowedTracks.filter((t) => t !== track)
        : [...prev.allowedTracks, track],
    }));
  };

  const handleEmploymentTypeChange = (type: EmploymentType) => {
    setPolicy((prev) => ({
      ...prev,
      excludedEmploymentTypes: prev.excludedEmploymentTypes.includes(type)
        ? prev.excludedEmploymentTypes.filter((t) => t !== type)
        : [...prev.excludedEmploymentTypes, type],
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Configure sources, filters, and preferences
          </p>
        </header>

        <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Job Filters</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Configure hard filters that run before AI analysis to reduce costs and improve
            relevance.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              {success}
            </div>
          )}
          {result && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              Last run: Filtered {result.filtered} jobs, kept {result.kept} jobs
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resume Tracks
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(ResumeTrack).map((track) => (
                  <label
                    key={track}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={policy.allowedTracks.includes(track)}
                      onChange={() => handleTrackChange(track)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{track.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Max Experience Years
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={policy.maxExperienceYears}
                onChange={(e) =>
                  setPolicy((prev) => ({
                    ...prev,
                    maxExperienceYears: parseInt(e.target.value) || 0,
                  }))
                }
                className="focus:ring-primary-500 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Jobs requiring more experience will be filtered out. Set to 0 to disable.
              </p>
            </div>

            <div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={policy.allowRemote}
                  onChange={(e) =>
                    setPolicy((prev) => ({ ...prev, allowRemote: e.target.checked }))
                  }
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Allow Remote/Hybrid Jobs
                </span>
              </label>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Excluded Title Terms (one per line)
              </label>
              <textarea
                value={excludedTitleTermsText}
                onChange={(e) => setExcludedTitleTermsText(e.target.value)}
                rows={6}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="senior&#10;staff&#10;lead&#10;principal&#10;manager"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Jobs with these terms in the title will be filtered out (case-insensitive).
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Blocked Companies (one per line)
              </label>
              <textarea
                value={blockedCompaniesText}
                onChange={(e) => setBlockedCompaniesText(e.target.value)}
                rows={4}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Company A&#10;Company B"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Jobs from these companies will be filtered out (case-insensitive partial match).
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Allowed Locations (one per line, optional)
              </label>
              <textarea
                value={allowedLocationsText}
                onChange={(e) => setAllowedLocationsText(e.target.value)}
                rows={4}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="San Francisco, CA&#10;New York, NY&#10;Remote"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                If specified, only jobs in these locations will pass (when not remote).
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Excluded Employment Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.values(EmploymentType).map((type) => (
                  <label
                    key={type}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={policy.excludedEmploymentTypes.includes(type)}
                      onChange={() => handleEmploymentTypeChange(type)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Run Filters'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
