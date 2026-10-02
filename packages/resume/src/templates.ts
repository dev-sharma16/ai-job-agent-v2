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

export const AI_SWE_TEMPLATE: ResumeTemplate = {
  track: ResumeTrack.AI_SWE,
  name: 'AI Software Engineer',
  content: {
    header: {
      name: 'Dev Sharma',
      email: 'dev@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/devsharma',
      github: 'https://github.com/devsharma',
      portfolio: 'https://devsharma.dev',
    },
    summary:
      'AI/ML Engineer with 6+ years of software engineering experience and 2+ years specializing in LLM applications, RAG systems, and AI agent frameworks. Proven track record of building production AI systems using LangChain/LangGraph, vector databases, and modern ML ops practices.',
    experience: [],
    projects: [],
    skills: [
      {
        category: 'AI/ML',
        skills: [
          'LLMs',
          'RAG',
          'LangChain',
          'LangGraph',
          'Vector Databases',
          'Embeddings',
          'Prompt Engineering',
          'AI Agents',
          'MCP',
          'Tool Calling',
        ],
      },
      { category: 'Languages', skills: ['TypeScript', 'Python', 'JavaScript', 'Go'] },
      { category: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS'] },
      { category: 'Backend', skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL'] },
      { category: 'Databases', skills: ['PostgreSQL', 'MongoDB', 'Redis', 'Pinecone', 'Weaviate'] },
      { category: 'Cloud/DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'University of California, Berkeley',
        graduationDate: '2018',
        location: 'Berkeley, CA',
      },
    ],
    certifications: [],
  },
};

export const SWE_TEMPLATE: ResumeTemplate = {
  track: ResumeTrack.SWE,
  name: 'Software Engineer',
  content: {
    header: {
      name: 'Dev Sharma',
      email: 'dev@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/devsharma',
      github: 'https://github.com/devsharma',
      portfolio: 'https://devsharma.dev',
    },
    summary:
      'Full-stack Software Engineer with 6+ years of experience building scalable web applications. Expert in TypeScript, React, Node.js, and cloud infrastructure. Strong background in system design, API development, and database optimization. Recent experience integrating AI/ML capabilities into production systems.',
    experience: [],
    projects: [],
    skills: [
      { category: 'Languages', skills: ['TypeScript', 'JavaScript', 'Python', 'Go'] },
      { category: 'Frontend', skills: ['React', 'Next.js', 'Tailwind CSS', 'HTML/CSS'] },
      { category: 'Backend', skills: ['Node.js', 'Express.js', 'FastAPI', 'REST APIs', 'GraphQL'] },
      { category: 'Databases', skills: ['PostgreSQL', 'MongoDB', 'Redis'] },
      { category: 'Cloud/DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'] },
      {
        category: 'AI/ML',
        skills: ['LLM Integration', 'RAG', 'Vector Databases', 'Prompt Engineering'],
      },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        institution: 'University of California, Berkeley',
        graduationDate: '2018',
        location: 'Berkeley, CA',
      },
    ],
    certifications: [],
  },
};

export function getTemplate(track: ResumeTrack): ResumeTemplate {
  return track === ResumeTrack.AI_SWE ? AI_SWE_TEMPLATE : SWE_TEMPLATE;
}
