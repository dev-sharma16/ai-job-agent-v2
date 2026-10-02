'use client';

import { useState } from 'react';
import ProfileForm from '@/components/profile/ProfileForm';
import ExperienceSection from '@/components/profile/ExperienceSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import BulletsSection from '@/components/profile/BulletsSection';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'experience' | 'projects' | 'bullets'>(
    'profile'
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile & Resume Truth
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Manage your verified profile, experience, projects, and resume bullets
          </p>
        </header>

        <nav className="mb-8 flex gap-4 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'experience', label: 'Experience' },
            { id: 'projects', label: 'Projects' },
            { id: 'bullets', label: 'Verified Bullets' },
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

        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'experience' && <ExperienceSection />}
          {activeTab === 'projects' && <ProjectsSection />}
          {activeTab === 'bullets' && <BulletsSection />}
        </div>
      </div>
    </div>
  );
}
