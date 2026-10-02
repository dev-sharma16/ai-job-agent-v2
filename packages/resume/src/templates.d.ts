import { ResumeTrack } from '@job-agent/domain';
export interface ResumeContent {
  header: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  experience: ExperienceSection[];
  projects: ProjectSection[];
  skills: SkillSection[];
  education: EducationSection[];
  certifications: CertificationSection[];
}
export interface ExperienceSection {
  company: string;
  role: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  location: string;
  bullets: string[];
}
export interface ProjectSection {
  name: string;
  description: string;
  technologies: string[];
  bullets: string[];
  url?: string;
}
export interface SkillSection {
  category: string;
  skills: string[];
}
export interface EducationSection {
  degree: string;
  institution: string;
  graduationDate: string;
  location: string;
}
export interface CertificationSection {
  name: string;
  issuer: string;
  date: string;
}
export interface ResumeTemplate {
  track: ResumeTrack;
  name: string;
  content: ResumeContent;
}
export declare const AI_SWE_TEMPLATE: ResumeTemplate;
export declare const SWE_TEMPLATE: ResumeTemplate;
export declare function getTemplate(track: ResumeTrack): ResumeTemplate;
//# sourceMappingURL=templates.d.ts.map
