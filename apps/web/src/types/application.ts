import { ResumeTrack } from '@job-agent/domain';

export interface Application {
  id: string;
  status: string;
  createdAt: string;
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
      requiredSkills: string[];
      preferredSkills: string[];
      concerns: string[];
      explanation: string;
    };
  };
  resume: {
    id: string;
    track: ResumeTrack;
    version: number;
    contentJson: {
      summary: string;
      coverNote: string;
      selectedBulletIds: string[];
    };
  };
}
