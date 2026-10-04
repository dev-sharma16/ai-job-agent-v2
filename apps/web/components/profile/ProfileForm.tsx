'use client';

import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  noticePeriod: string;
  workAuthorization: string;
  expectedSalary: string;
  otherVerifiedDataJson: Record<string, unknown>;
  updatedAt: string;
}

interface ParsedResume {
  header: {
    name: string;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    github: string | null;
    portfolio: string | null;
  };
  summary: string | null;
  experience: Array<{
    company: string;
    role: string;
    employmentType: string | null;
    startDate: string;
    endDate: string | null;
    location: string | null;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    description: string | null;
    technologies: string[];
    bullets: string[];
    url: string | null;
  }>;
  skills: Array<{ category: string; skills: string[] }>;
  education: Array<{
    degree: string;
    institution: string;
    graduationDate: string | null;
    location: string | null;
  }>;
  certifications: Array<{
    name: string;
    issuer: string | null;
    date: string | null;
  }>;
  track: 'ai_swe' | 'swe' | 'other';
}

interface ResumeFile {
  filename: string;
  name: string;
  track: 'ai_swe' | 'swe' | 'other';
  ext: string;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importTrack, setImportTrack] = useState<'ai_swe' | 'swe' | 'other'>('ai_swe');
  const [resumeFiles, setResumeFiles] = useState<ResumeFile[]>([]);
  const [selectedResumeFile, setSelectedResumeFile] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    noticePeriod: '',
    workAuthorization: '',
    expectedSalary: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchResumeFiles();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          location: data.location || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          noticePeriod: data.noticePeriod || '',
          workAuthorization: data.workAuthorization || '',
          expectedSalary: data.expectedSalary || '',
        });
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchResumeFiles = async () => {
    try {
      const res = await fetch('/api/profile/resume-files');
      if (res.ok) {
        const data = await res.json();
        setResumeFiles(data.files || []);
        if (data.files?.length > 0) {
          setSelectedResumeFile(data.files[0].filename);
          setImportTrack(data.files[0].track);
        }
      }
    } catch (err) {
      console.error('Failed to load resume files:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setSuccess('Profile saved successfully');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save profile');
      }
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImportResume = async (fullImport = false) => {
    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      let fileToUpload: File;

      if (resumeFiles.length > 0 && selectedResumeFile) {
        const res = await fetch(`/api/profile/resume-file?filename=${encodeURIComponent(selectedResumeFile)}`);
        if (!res.ok) {
          setError('Failed to load resume file from server');
          setImporting(false);
          return;
        }
        const blob = await res.blob();
        fileToUpload = new File([blob], selectedResumeFile, { type: blob.type || 'text/markdown' });
      } else {
        const fileInput = document.getElementById('resume-file') as HTMLInputElement;
        const file = fileInput?.files?.[0];
        if (!file) {
          setError('Please select a resume file');
          setImporting(false);
          return;
        }
        fileToUpload = file;
      }

      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('track', importTrack);

      const endpoint = fullImport ? '/api/profile/import-full-resume' : '/api/profile/import-resume';
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to parse resume');
        return;
      }

      const parsed = data.parsed;

      setFormData((prev) => ({
        ...prev,
        name: parsed.header.name || prev.name,
        email: parsed.header.email || prev.email,
        phone: parsed.header.phone || prev.phone,
        location: parsed.header.location || prev.location,
        linkedinUrl: parsed.header.linkedin || prev.linkedinUrl,
        githubUrl: parsed.header.github || prev.githubUrl,
        portfolioUrl: parsed.header.portfolio || prev.portfolioUrl,
      }));

      if (fullImport && data.saved) {
        setSuccess(`Full resume imported! ${data.message}. Profile updated. Go to Experience/Projects tabs to review.`);
      } else {
        setSuccess(`Resume parsed successfully! Track: ${parsed.track}. Review and save the imported data.`);
      }
    } catch (err) {
      setError('Failed to import resume');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
          {success}
        </div>
      )}

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-4 text-lg font-medium text-blue-900 dark:text-blue-100">Import Resume</h3>
        <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
          Select a resume from your <code className="px-1.5 bg-gray-100 dark:bg-gray-800 rounded">apps/resumes/</code> folder
          or upload a Markdown (.md), Text (.txt), or PDF file to auto-fill your profile using AI.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resume File
              </label>
              {resumeFiles.length > 0 ? (
                <select
                  value={selectedResumeFile}
                  onChange={(e) => {
                    setSelectedResumeFile(e.target.value);
                    const file = resumeFiles.find((f) => f.filename === e.target.value);
                    if (file) setImportTrack(file.track);
                  }}
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {resumeFiles.map((f) => (
                    <option key={f.filename} value={f.filename}>
                      {f.name} ({f.track.replace('_', ' ').toUpperCase()}) - {f.ext.toUpperCase()}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="resume-file"
                  type="file"
                  accept=".md,.txt,.pdf"
                  className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:px-4 file:py-2 file:text-sm file:font-medium dark:file:bg-primary-900/30 dark:file:text-primary-300"
                />
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Resume Track
              </label>
              <select
                value={importTrack}
                onChange={(e) => setImportTrack(e.target.value as 'ai_swe' | 'swe' | 'other')}
                className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="ai_swe">AI Software Engineer</option>
                <option value="swe">Software Engineer</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleImportResume(false)}
              disabled={importing}
              className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
            >
              {importing ? 'Parsing...' : 'Parse Only (Fill Profile Tab)'}
            </button>
            <button
              type="button"
              onClick={() => handleImportResume(true)}
              disabled={importing}
              className="bg-green-600 hover:bg-green-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Full Import (Save All to DB)'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name *
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email *
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            LinkedIn URL
          </label>
          <input
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            GitHub URL
          </label>
          <input
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Portfolio URL
          </label>
          <input
            name="portfolioUrl"
            value={formData.portfolioUrl}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Notice Period
          </label>
          <input
            name="noticePeriod"
            value={formData.noticePeriod}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Work Authorization
          </label>
          <input
            name="workAuthorization"
            value={formData.workAuthorization}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Expected Salary
          </label>
          <input
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            className="focus:ring-primary-500 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-transparent focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-700">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 rounded-lg px-6 py-2 text-white transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}
