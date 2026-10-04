'use client';

import { useState, useEffect } from 'react';
import { JobFilterPolicy, EmploymentType, ResumeTrack } from '@job-agent/domain';

type FilterPolicy = JobFilterPolicy & {
  excludedEmploymentTypes: EmploymentType[];
};

interface Source {
  id: string;
  name: string;
  type: 'greenhouse' | 'lever' | 'ashby' | 'email' | 'manual';
  configJson: Record<string, unknown>;
  enabled: boolean;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
  companyId: string | null;
  companyName: string | null;
  companySlug: string | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  atsType: string | null;
  enabled: boolean;
  blocked: boolean;
}

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
  const [activeTab, setActiveTab] = useState<'filters' | 'sources'>('filters');
 
  // Filters state
  const [policy, setPolicy] = useState<FilterPolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ filtered: number; kept: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [excludedTitleTermsText, setExcludedTitleTermsText] = useState('');
  const [blockedCompaniesText, setBlockedCompaniesText] = useState('');
  const [allowedLocationsText, setAllowedLocationsText] = useState('');
 
  // Sources state
  const [sources, setSources] = useState<Source[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourceSaving, setSourceSaving] = useState<boolean>(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceSuccess, setSourceSuccess] = useState<string | null>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [sourceForm, setSourceForm] = useState({
    name: '',
    type: 'greenhouse' as 'greenhouse' | 'lever' | 'ashby' | 'email' | 'manual',
    companyId: '',
    configJson: {} as Record<string, unknown>,
    enabled: true,
  });
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    slug: '',
    website: '',
    atsType: 'greenhouse' as 'greenhouse' | 'lever' | 'ashby' | 'other',
    enabled: true,
    blocked: false,
  });
 
  useEffect(() => {
    fetchPolicy();
    fetchSources();
    fetchCompanies();
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

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (err) {
      console.error('Failed to load sources:', err);
    } finally {
      setSourcesLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
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

  const getConfigFields = (type: string): Array<{ key: string; label: string; placeholder: string; required?: boolean; type?: string }> => {
    switch (type) {
      case 'greenhouse':
        return [{ key: 'boardToken', label: 'Board Token', placeholder: 'e.g., stripe', required: true }];
      case 'lever':
        return [
          { key: 'companyName', label: 'Company Name (Lever slug)', placeholder: 'e.g., airbnb', required: true },
        ];
      case 'ashby':
        return [{ key: 'organization', label: 'Organization', placeholder: 'e.g., notion', required: true }];
      case 'email':
        return [
          { key: 'imapHost', label: 'IMAP Host', placeholder: 'imap.gmail.com' },
          { key: 'imapPort', label: 'IMAP Port', placeholder: '993', type: 'number' },
          { key: 'imapUser', label: 'Email', placeholder: 'your_email@gmail.com' },
          { key: 'imapPassword', label: 'App Password', placeholder: '••••••••', type: 'password' },
        ];
      default:
        return [];
    }
  };

  const openSourceModal = (source?: Source) => {
    if (source) {
      setEditingSource(source);
      setSourceForm({
        name: source.name,
        type: source.type,
        companyId: source.companyId || '',
        configJson: source.configJson,
        enabled: source.enabled,
      });
    } else {
      setEditingSource(null);
      setSourceForm({ name: '', type: 'greenhouse', companyId: '', configJson: {}, enabled: true });
    }
    setShowSourceModal(true);
  };

  const handleSourceFormChange = (key: string, value: unknown) => {
    setSourceForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSourceConfigChange = (key: string, value: unknown) => {
    setSourceForm((prev) => ({ ...prev, configJson: { ...prev.configJson, [key]: value } }));
  };

  const saveSource = async () => {
    if (!sourceForm.name || !sourceForm.type) {
      setSourceError('Name and type are required');
      return;
    }
    const configFields = getConfigFields(sourceForm.type);
    for (const field of configFields) {
      if (field.required && !sourceForm.configJson[field.key]) {
        setSourceError(`${field.label} is required for ${sourceForm.type}`);
        return;
      }
    }

    setSourceSaving(true);
    setSourceError(null);

    try {
      const url = editingSource ? `/api/sources/${editingSource.id}` : '/api/sources';
      const method = editingSource ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceForm),
      });

      if (res.ok) {
        setSourceSuccess(editingSource ? 'Source updated' : 'Source created');
        setShowSourceModal(false);
        fetchSources();
      } else {
        const err = await res.json();
        setSourceError(err.error || 'Failed to save source');
      }
    } catch (err) {
      setSourceError('Failed to save source');
    } finally {
      setSourceSaving(false);
    }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Delete this source?')) return;
    try {
      const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSources();
      } else {
        alert('Failed to delete source');
      }
    } catch (err) {
      alert('Failed to delete source');
    }
  };

  const openCompanyModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setCompanyForm({
        name: company.name,
        slug: company.slug,
        website: company.website || '',
        atsType: (company.atsType as any) || 'greenhouse',
        enabled: company.enabled,
        blocked: company.blocked,
      });
    } else {
      setEditingCompany(null);
      setCompanyForm({ name: '', slug: '', website: '', atsType: 'greenhouse', enabled: true, blocked: false });
    }
    setShowCompanyModal(true);
  };

  const handleCompanyFormChange = (key: string, value: unknown) => {
    setCompanyForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveCompany = async () => {
    if (!companyForm.name || !companyForm.slug) {
      setSourceError('Name and slug are required');
      return;
    }

    setSourceSaving(true);
    setSourceError(null);

    try {
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : '/api/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });

      if (res.ok) {
        setSourceSuccess(editingCompany ? 'Company updated' : 'Company created');
        setShowCompanyModal(false);
        fetchCompanies();
      } else {
        const err = await res.json();
        setSourceError(err.error || 'Failed to save company');
      }
    } catch (err) {
      setSourceError('Failed to save company');
    } finally {
      setSourceSaving(false);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('Delete this company? This will also delete associated sources.')) return;
    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCompanies();
        fetchSources();
      } else {
        alert('Failed to delete company');
      }
    } catch (err) {
      alert('Failed to delete company');
    }
};
 
  if (loading || sourcesLoading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }
 
  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Configure sources, filters, and preferences
          </p>
        </header>
 
        <nav className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'filters', label: 'Job Filters' },
            { id: 'sources', label: 'Job Sources' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400 border-primary-600 border-b-2 bg-white dark:bg-gray-800'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
 
        {activeTab === 'filters' && (
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
        )}
 
        {activeTab === 'sources' && (
          <>
            <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Companies</h2>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Add companies that host job boards (Greenhouse, Lever, Ashby)
                  </p>
                </div>
                <button
                  onClick={() => openCompanyModal()}
                  className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors"
                >
                  Add Company
                </button>
              </div>
 
              {sourceError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {sourceError}
                </div>
              )}
              {sourceSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                  {sourceSuccess}
                </div>
              )}
 
              {companies.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No companies added. Click "Add Company" to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{company.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Slug: {company.slug} | Type: {company.atsType || 'N/A'}
                          </p>
                          {company.website && (
                            <a href={company.website} target="_blank" rel="noopener" className="text-sm text-primary-600 hover:underline">
                              {company.website}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={company.enabled}
                              onChange={(e) => saveCompany()}
                              className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
                          </label>
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={company.blocked}
                              onChange={(e) => saveCompany()}
                              className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">Blocked</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openCompanyModal(company)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCompany(company.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
 
            <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Sources</h2>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    Configure job board sources (Greenhouse, Lever, Ashby) for each company
                  </p>
                </div>
                <button
                  onClick={() => openSourceModal()}
                  className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors"
                >
                  Add Source
                </button>
              </div>
 
              {sourceError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {sourceError}
                </div>
              )}
              {sourceSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                  {sourceSuccess}
                </div>
              )}
 
              {sources.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No sources configured. Add a company first, then add a source.
                </div>
              ) : (
                <div className="space-y-3">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                            {source.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            source.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {source.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{source.name}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            Company: {source.companyName || 'None'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={source.enabled}
                            onChange={() => saveSource()}
                            className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
                        </label>
                        <button
                          onClick={() => openSourceModal(source)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSource(source.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Source Modal */}
        {showSourceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingSource ? 'Edit Source' : 'Add Source'}
                </h3>
                <button onClick={() => setShowSourceModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    value={sourceForm.name}
                    onChange={(e) => handleSourceFormChange('name', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                  <select
                    value={sourceForm.type}
                    onChange={(e) => handleSourceFormChange('type', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="greenhouse">Greenhouse</option>
                    <option value="lever">Lever</option>
                    <option value="ashby">Ashby</option>
                    <option value="email">Email</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                  <select
                    value={sourceForm.companyId}
                    onChange={(e) => handleSourceFormChange('companyId', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-3">
                  {getConfigFields(sourceForm.type).map((field) => (
                    <div key={field.key}>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        value={(sourceForm.configJson[field.key] as string) || ''}
                        onChange={(e) => handleSourceConfigChange(field.key, e.target.value)}
                        className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={sourceForm.enabled}
                      onChange={(e) => handleSourceFormChange('enabled', e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => setShowSourceModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveSource}
                    disabled={sourceSaving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {sourceSaving ? 'Saving...' : editingSource ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Modal */}
        {showCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingCompany ? 'Edit Company' : 'Add Company'}
                </h3>
                <button onClick={() => setShowCompanyModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ✕
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                  <input
                    value={companyForm.name}
                    onChange={(e) => handleCompanyFormChange('name', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Slug *</label>
                  <input
                    value={companyForm.slug}
                    onChange={(e) => handleCompanyFormChange('slug', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) => handleCompanyFormChange('website', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ATS Type</label>
                  <select
                    value={companyForm.atsType}
                    onChange={(e) => handleCompanyFormChange('atsType', e.target.value)}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="greenhouse">Greenhouse</option>
                    <option value="lever">Lever</option>
                    <option value="ashby">Ashby</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={companyForm.enabled}
                      onChange={(e) => handleCompanyFormChange('enabled', e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={companyForm.blocked}
                      onChange={(e) => handleCompanyFormChange('blocked', e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Blocked</span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => setShowCompanyModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveCompany}
                    disabled={sourceSaving}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {sourceSaving ? 'Saving...' : editingCompany ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
