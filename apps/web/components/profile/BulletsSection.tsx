'use client';

import { useState, useEffect } from 'react';
import { ResumeTrack } from '@job-agent/domain';

interface Bullet {
  id: string;
  experienceId: string | null;
  projectId: string | null;
  text: string;
  trackTagsJson: ResumeTrack[];
  skillTagsJson: string[];
  sourceReference: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExperienceRef {
  id: string;
  company: string;
  role: string;
}

interface ProjectRef {
  id: string;
  name: string;
}

export default function BulletsSection() {
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [experiences, setExperiences] = useState<ExperienceRef[]>([]);
  const [projects, setProjects] = useState<ProjectRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Bullet | null>(null);
  const [filterTrack, setFilterTrack] = useState<ResumeTrack | 'all'>('all');
  const [filterSkill, setFilterSkill] = useState<string>('');
  const [formData, setFormData] = useState({
    experienceId: '',
    projectId: '',
    text: '',
    trackTagsJson: [] as ResumeTrack[],
    skillTagsJson: '' as string,
    sourceReference: '',
    verified: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBullets();
    fetchReferences();
  }, []);

  const fetchBullets = async () => {
    try {
      const params = new URLSearchParams();
      if (filterTrack !== 'all') params.append('track', filterTrack);
      if (filterSkill) params.append('skill', filterSkill);

      const res = await fetch(`/api/bullets?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBullets(data);
      }
    } catch (err) {
      setError('Failed to load bullets');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferences = async () => {
    try {
      const [expRes, projRes] = await Promise.all([
        fetch('/api/experience'),
        fetch('/api/projects'),
      ]);
      if (expRes.ok) setExperiences(await expRes.json());
      if (projRes.ok) setProjects(await projRes.json());
    } catch (err) {
      console.error('Failed to load references');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTrackChange = (track: ResumeTrack) => {
    setFormData((prev) => ({
      ...prev,
      trackTagsJson: prev.trackTagsJson.includes(track)
        ? prev.trackTagsJson.filter((t) => t !== track)
        : [...prev.trackTagsJson, track],
    }));
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({
      experienceId: '',
      projectId: '',
      text: '',
      trackTagsJson: [],
      skillTagsJson: '',
      sourceReference: '',
      verified: true,
    });
    setShowForm(true);
  };

  const openEdit = (bullet: Bullet) => {
    setEditing(bullet);
    setFormData({
      experienceId: bullet.experienceId || '',
      projectId: bullet.projectId || '',
      text: bullet.text,
      trackTagsJson: bullet.trackTagsJson,
      skillTagsJson: bullet.skillTagsJson.join(', '),
      sourceReference: bullet.sourceReference,
      verified: bullet.verified,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const data = {
      ...formData,
      experienceId: formData.experienceId || null,
      projectId: formData.projectId || null,
      trackTagsJson: formData.trackTagsJson,
      skillTagsJson: formData.skillTagsJson
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const url = editing ? `/api/bullets/${editing.id}` : '/api/bullets';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setShowForm(false);
        setEditing(null);
        fetchBullets();
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save bullet');
      }
    } catch (err) {
      setError('Failed to save bullet');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bullet?')) return;

    try {
      const res = await fetch(`/api/bullets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBullets();
      }
    } catch (err) {
      setError('Failed to delete bullet');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  const filteredBullets = bullets.filter((b) => {
    if (filterTrack !== 'all' && !b.trackTagsJson.includes(filterTrack)) return false;
    if (filterSkill && !b.skillTagsJson.includes(filterSkill)) return false;
    return true;
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Verified Resume Bullets
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterTrack}
            onChange={(e) => {
              setFilterTrack(e.target.value as ResumeTrack | 'all');
              fetchBullets();
            }}
            className="focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Tracks</option>
            <option value="ai_swe">AI-SWE</option>
            <option value="swe">SWE</option>
          </select>
          <input
            type="text"
            placeholder="Filter by skill..."
            value={filterSkill}
            onChange={(e) => {
              setFilterSkill(e.target.value);
              fetchBullets();
            }}
            className="focus:ring-primary-500 w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={openCreate}
            className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white transition-colors"
          >
            Add Bullet
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold">
              {editing ? 'Edit' : 'Add'} Verified Bullet
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source Experience
                  </label>
                  <select
                    name="experienceId"
                    value={formData.experienceId}
                    onChange={handleChange}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">None</option>
                    {experiences.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.company} - {exp.role}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source Project
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">None</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bullet Text *
                </label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tracks
                </label>
                <div className="flex gap-2">
                  {Object.values(ResumeTrack).map((track) => (
                    <label key={track} className="flex cursor-pointer items-center gap-1">
                      <input
                        type="checkbox"
                        checked={formData.trackTagsJson.includes(track)}
                        onChange={(e) => handleTrackChange(track)}
                        className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                      />
                      <span className="text-sm capitalize">{track.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Skill Tags (comma-separated)
                </label>
                <input
                  name="skillTagsJson"
                  value={formData.skillTagsJson}
                  onChange={handleChange}
                  placeholder="TypeScript, React, RAG, LLM"
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Source Reference *
                </label>
                <input
                  name="sourceReference"
                  value={formData.sourceReference}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Experience: Google - Senior SWE, or Project: AI Agent Framework"
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="verified"
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData((prev) => ({ ...prev, verified: e.target.checked }))}
                  className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Verified</label>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-600 hover:bg-primary-700 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredBullets.length === 0 ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            No bullets yet. Click "Add Bullet" to get started.
          </div>
        ) : (
          filteredBullets.map((bullet) => (
            <div
              key={bullet.id}
              className="rounded-lg border border-gray-200 p-6 dark:border-gray-700"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <p className="mb-3 text-gray-900 dark:text-white">{bullet.text}</p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {bullet.trackTagsJson.map((track) => (
                      <span
                        key={track}
                        className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full px-2 py-0.5 text-xs capitalize"
                      >
                        {track.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  {bullet.skillTagsJson.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {bullet.skillTagsJson.map((skill) => (
                        <span
                          key={skill}
                          className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Source: {bullet.sourceReference}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(bullet)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bullet.id)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
