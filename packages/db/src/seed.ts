import { db } from './client';
import * as schema from './schema';
import { ResumeTrack, EmploymentType } from '@job-agent/domain';
import { AI_SWE_TEMPLATE, SWE_TEMPLATE } from '@job-agent/resume';
import { desc } from 'drizzle-orm';

async function seed() {
  console.log('Seeding database...');

  // --- Profile ---
  let profile = await db.query.profile.findFirst();
  if (!profile) {
    const [p] = await db.insert(schema.profile).values({
      name: 'Dev Sharma',
      email: 'dev@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/devsharma',
      githubUrl: 'https://github.com/devsharma',
      portfolioUrl: 'https://devsharma.dev',
      noticePeriod: '2 weeks',
      workAuthorization: 'US Citizen',
      expectedSalary: '$180,000 - $220,000',
      otherVerifiedDataJson: {},
    }).returning();
    profile = p;
    console.log('Created profile');
  }

  // --- Experience Entries ---
  const experienceData = [
    {
      company: 'TechCorp AI',
      role: 'Senior AI/ML Engineer',
      employmentType: EmploymentType.FULL_TIME,
      startDate: new Date('2022-01-15'),
      endDate: new Date('2024-01-15'),
      location: 'San Francisco, CA',
      description: 'Led AI/ML initiatives for enterprise products. Built production RAG systems, LLM pipelines, and AI agent frameworks serving millions of requests daily.',
      verified: true,
    },
    {
      company: 'DataFlow Inc',
      role: 'Software Engineer II',
      employmentType: EmploymentType.FULL_TIME,
      startDate: new Date('2020-03-01'),
      endDate: new Date('2022-01-10'),
      location: 'San Francisco, CA',
      description: 'Full-stack development of data processing platforms. Designed REST APIs, built real-time dashboards, and optimized PostgreSQL/MongoDB queries.',
      verified: true,
    },
    {
      company: 'StartupXYZ',
      role: 'Full Stack Engineer',
      employmentType: EmploymentType.FULL_TIME,
      startDate: new Date('2018-06-01'),
      endDate: new Date('2020-02-28'),
      location: 'Berkeley, CA',
      description: 'Early engineer building SaaS product from 0 to 10k users. Owned frontend (React), backend (Node.js/Express), and DevOps (AWS, Docker, CI/CD).',
      verified: true,
    },
  ];

  const experienceIds: string[] = [];
  for (const exp of experienceData) {
    const existing = await db.query.experienceEntries.findFirst({
      where: (e, { and, eq }) => and(eq(e.company, exp.company), eq(e.role, exp.role)),
    });
    if (!existing) {
      const [e] = await db.insert(schema.experienceEntries).values(exp).returning();
      experienceIds.push(e.id);
      console.log(`Created experience: ${exp.role} at ${exp.company}`);
    } else {
      experienceIds.push(existing.id);
    }
  }

  // --- Projects ---
  const projectsData = [
    {
      name: 'AI Agent Framework',
      description: 'Open-source framework for building production-ready AI agents with human-in-the-loop, tool calling, and structured outputs. Used by 500+ developers.',
      technologiesJson: ['TypeScript', 'LangGraph', 'PostgreSQL', 'Redis', 'Docker'],
      verified: true,
    },
    {
      name: 'RAG Pipeline for Enterprise Search',
      description: 'Production RAG system handling 1M+ queries/day with sub-200ms latency. Hybrid search (BM25 + vector), reranking, and citation tracking.',
      technologiesJson: ['Python', 'LangChain', 'Pinecone', 'FastAPI', 'Kubernetes', 'Prometheus'],
      verified: true,
    },
    {
      name: 'Real-time Analytics Dashboard',
      description: 'Full-stack dashboard for streaming data visualization with WebSocket updates, custom query builder, and export capabilities.',
      technologiesJson: ['React', 'Next.js', 'Node.js', 'TimescaleDB', 'WebSockets', 'Tailwind CSS'],
      verified: true,
    },
  ];

  const projectIds: string[] = [];
  for (const proj of projectsData) {
    const existing = await db.query.projects.findFirst({
      where: (p, { eq }) => eq(p.name, proj.name),
    });
    if (!existing) {
      const [p] = await db.insert(schema.projects).values(proj).returning();
      projectIds.push(p.id);
      console.log(`Created project: ${proj.name}`);
    } else {
      projectIds.push(existing.id);
    }
  }

  // --- Verified Bullets ---
  const bulletsData = [
    // AI/ML bullets (ai_swe track)
    {
      experienceId: experienceIds[0],
      text: 'Built production RAG system serving 1M+ queries/day using LangChain, Pinecone, and GPT-4 with 99.9% uptime',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['RAG', 'LangChain', 'Pinecone', 'GPT-4', 'Vector Databases'],
      sourceReference: 'TechCorp AI - Senior AI/ML Engineer',
      verified: true,
    },
    {
      experienceId: experienceIds[0],
      text: 'Designed ML pipeline for real-time inference reducing latency by 40% through model quantization and batching',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['MLOps', 'Model Optimization', 'Real-time Inference', 'Python', 'Kubernetes'],
      sourceReference: 'TechCorp AI - Senior AI/ML Engineer',
      verified: true,
    },
    {
      experienceId: experienceIds[0],
      text: 'Led team of 5 engineers building AI agent framework using LangGraph with multi-agent orchestration and human-in-the-loop',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['LangGraph', 'AI Agents', 'Multi-agent Systems', 'TypeScript', 'Team Leadership'],
      sourceReference: 'TechCorp AI - Senior AI/ML Engineer',
      verified: true,
    },
    {
      experienceId: experienceIds[0],
      text: 'Implemented prompt engineering best practices and evaluation framework for LLM outputs, improving accuracy by 25%',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['Prompt Engineering', 'LLM Evaluation', 'LangChain', 'Python'],
      sourceReference: 'TechCorp AI - Senior AI/ML Engineer',
      verified: true,
    },
    {
      experienceId: experienceIds[0],
      text: 'Designed and deployed vector database architecture (Pinecone/Weaviate) for semantic search at scale',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['Vector Databases', 'Pinecone', 'Weaviate', 'Embeddings', 'Semantic Search'],
      sourceReference: 'TechCorp AI - Senior AI/ML Engineer',
      verified: true,
    },
    // SWE bullets (both tracks)
    {
      experienceId: experienceIds[1],
      text: 'Architected and built REST API platform handling 500k req/min with Node.js, Express, and PostgreSQL',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['Node.js', 'Express.js', 'REST APIs', 'PostgreSQL', 'System Design'],
      sourceReference: 'DataFlow Inc - Software Engineer II',
      verified: true,
    },
    {
      experienceId: experienceIds[1],
      text: 'Optimized database queries reducing p95 latency from 800ms to 120ms through indexing, query rewriting, and read replicas',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['PostgreSQL', 'Performance Optimization', 'Database Indexing', 'Read Replicas'],
      sourceReference: 'DataFlow Inc - Software Engineer II',
      verified: true,
    },
    {
      experienceId: experienceIds[1],
      text: 'Built real-time data processing pipeline with Apache Kafka and Redis streams processing 10M events/day',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['Kafka', 'Redis', 'Stream Processing', 'Node.js', 'Distributed Systems'],
      sourceReference: 'DataFlow Inc - Software Engineer II',
      verified: true,
    },
    {
      experienceId: experienceIds[1],
      text: 'Developed React/TypeScript dashboard with complex visualizations (D3.js) for data science team',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['React', 'TypeScript', 'D3.js', 'Data Visualization', 'Frontend'],
      sourceReference: 'DataFlow Inc - Software Engineer II',
      verified: true,
    },
    {
      experienceId: experienceIds[2],
      text: 'Built SaaS product from scratch: React/Next.js frontend, Node.js/Express backend, PostgreSQL database',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['React', 'Next.js', 'Node.js', 'Express.js', 'PostgreSQL', 'Full-stack'],
      sourceReference: 'StartupXYZ - Full Stack Engineer',
      verified: true,
    },
    {
      experienceId: experienceIds[2],
      text: 'Implemented CI/CD pipelines with GitHub Actions, Docker, and AWS ECS reducing deployment time from 30min to 5min',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['CI/CD', 'GitHub Actions', 'Docker', 'AWS ECS', 'DevOps'],
      sourceReference: 'StartupXYZ - Full Stack Engineer',
      verified: true,
    },
    {
      experienceId: experienceIds[2],
      text: 'Designed and implemented authentication/authorization system with OAuth2, JWT, and RBAC',
      trackTagsJson: ['ai_swe', 'swe'],
      skillTagsJson: ['OAuth2', 'JWT', 'RBAC', 'Authentication', 'Security', 'Node.js'],
      sourceReference: 'StartupXYZ - Full Stack Engineer',
      verified: true,
    },
    // Project bullets
    {
      projectId: projectIds[0],
      text: 'Implemented multi-agent orchestration with human-in-the-loop approval workflows using LangGraph',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['LangGraph', 'AI Agents', 'Multi-agent', 'Human-in-the-loop', 'TypeScript'],
      sourceReference: 'AI Agent Framework - Open Source Project',
      verified: true,
    },
    {
      projectId: projectIds[0],
      text: 'Added structured output support with Zod schemas for reliable tool calling and agent responses',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['Structured Outputs', 'Zod', 'Tool Calling', 'TypeScript', 'LLM Integration'],
      sourceReference: 'AI Agent Framework - Open Source Project',
      verified: true,
    },
    {
      projectId: projectIds[1],
      text: 'Built hybrid search combining BM25 and vector similarity with cross-encoder reranking for enterprise RAG',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['RAG', 'Hybrid Search', 'BM25', 'Cross-encoder', 'Reranking', 'Python'],
      sourceReference: 'RAG Pipeline for Enterprise Search - Project',
      verified: true,
    },
    {
      projectId: projectIds[1],
      text: 'Implemented citation tracking and source attribution for all generated answers improving trust',
      trackTagsJson: ['ai_swe'],
      skillTagsJson: ['Citation Tracking', 'Source Attribution', 'RAG', 'LangChain', 'Python'],
      sourceReference: 'RAG Pipeline for Enterprise Search - Project',
      verified: true,
    },
    {
      projectId: projectIds[2],
      text: 'Built WebSocket-based real-time updates for dashboard with automatic reconnection and state sync',
      trackTagsJson: ['swe'],
      skillTagsJson: ['WebSockets', 'Real-time', 'React', 'Node.js', 'TypeScript'],
      sourceReference: 'Real-time Analytics Dashboard - Project',
      verified: true,
    },
    {
      projectId: projectIds[2],
      text: 'Created custom query builder UI allowing non-technical users to build complex SQL queries visually',
      trackTagsJson: ['swe'],
      skillTagsJson: ['React', 'TypeScript', 'SQL', 'Query Builder', 'UX'],
      sourceReference: 'Real-time Analytics Dashboard - Project',
      verified: true,
    },
  ];

  for (const bullet of bulletsData) {
    const existing = await db.query.verifiedBullets.findFirst({
      where: (b, { and, eq }) => and(eq(b.text, bullet.text), eq(b.sourceReference, bullet.sourceReference)),
    });
    if (!existing) {
      await db.insert(schema.verifiedBullets).values(bullet);
      console.log(`Created bullet: ${bullet.text.slice(0, 60)}...`);
    }
  }

  // --- Base Resumes ---
  const aiSweContent = {
    ...AI_SWE_TEMPLATE.content,
    experience: [
      {
        company: 'TechCorp AI',
        role: 'Senior AI/ML Engineer',
        employmentType: 'full_time',
        startDate: '2022-01',
        endDate: '2024-01',
        location: 'San Francisco, CA',
        bullets: bulletsData.filter(b => b.experienceId === experienceIds[0] && b.trackTagsJson.includes('ai_swe')).map(b => b.text),
      },
      {
        company: 'DataFlow Inc',
        role: 'Software Engineer II',
        employmentType: 'full_time',
        startDate: '2020-03',
        endDate: '2022-01',
        location: 'San Francisco, CA',
        bullets: bulletsData.filter(b => b.experienceId === experienceIds[1] && b.trackTagsJson.includes('ai_swe')).map(b => b.text),
      },
      {
        company: 'StartupXYZ',
        role: 'Full Stack Engineer',
        employmentType: 'full_time',
        startDate: '2018-06',
        endDate: '2020-02',
        location: 'Berkeley, CA',
        bullets: bulletsData.filter(b => b.experienceId === experienceIds[2] && b.trackTagsJson.includes('ai_swe')).map(b => b.text),
      },
    ],
    projects: [
      {
        name: 'AI Agent Framework',
        description: 'Open-source framework for building production-ready AI agents with human-in-the-loop, tool calling, and structured outputs.',
        technologies: ['TypeScript', 'LangGraph', 'PostgreSQL', 'Redis', 'Docker'],
        bullets: bulletsData.filter(b => b.projectId === projectIds[0]).map(b => b.text),
        url: 'https://github.com/devsharma/ai-agent-framework',
      },
      {
        name: 'RAG Pipeline for Enterprise Search',
        description: 'Production RAG system handling 1M+ queries/day with sub-200ms latency.',
        technologies: ['Python', 'LangChain', 'Pinecone', 'FastAPI', 'Kubernetes', 'Prometheus'],
        bullets: bulletsData.filter(b => b.projectId === projectIds[1]).map(b => b.text),
      },
    ],
  };

  const sweContent = {
    ...SWE_TEMPLATE.content,
    experience: [
      {
        company: 'TechCorp AI',
        role: 'Senior AI/ML Engineer',
        employmentType: 'full_time',
        startDate: '2022-01',
        endDate: '2024-01',
        location: 'San Francisco, CA',
        bullets: bulletsData.filter(b => b.experienceId === experienceIds[0] && b.trackTagsJson.includes('swe')).map(b => b.text),
      },
      {
        company: 'DataFlow Inc',
        role: 'Software Engineer II',
        employmentType: 'full_time',
        startDate: '2020-03',
        endDate: '2022-01',
        location: 'San Francisco, CA',
        bullets: bulletsData.filter(b => b.experienceId === experienceIds[1] && b.trackTagsJson.includes('swe')).map(b => b.text),
      },
      {
        company: 'StartupXYZ',
        role: 'Full Stack Engineer',
        employmentType: 'full_time',
        startDate: '2018-06',
        endDate: '2020-02',
        location: 'Berkeley, CA',
        bullets: bulletsData.filter(b => b.experienceId === experienceIds[2] && b.trackTagsJson.includes('swe')).map(b => b.text),
      },
    ],
    projects: [
      {
        name: 'Real-time Analytics Dashboard',
        description: 'Full-stack dashboard for streaming data visualization with WebSocket updates, custom query builder, and export capabilities.',
        technologies: ['React', 'Next.js', 'Node.js', 'TimescaleDB', 'WebSockets', 'Tailwind CSS'],
        bullets: bulletsData.filter(b => b.projectId === projectIds[2]).map(b => b.text),
      },
      {
        name: 'AI Agent Framework',
        description: 'Open-source framework for building production-ready AI agents with human-in-the-loop, tool calling, and structured outputs.',
        technologies: ['TypeScript', 'LangGraph', 'PostgreSQL', 'Redis', 'Docker'],
        bullets: bulletsData.filter(b => b.projectId === projectIds[0]).map(b => b.text),
        url: 'https://github.com/devsharma/ai-agent-framework',
      },
    ],
  };

  // Helper to generate content hash
  async function hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // AI-SWE base resume
  const existingAiSwe = await db.query.resumes.findFirst({
    where: (r, { eq }) => eq(r.track, ResumeTrack.AI_SWE),
    orderBy: (r, { desc }) => desc(r.version),
  });

  if (!existingAiSwe) {
    const aiSweHash = await hashContent(JSON.stringify(aiSweContent));
    await db.insert(schema.resumes).values({
      track: ResumeTrack.AI_SWE,
      version: 1,
      name: 'AI Software Engineer - Base Template',
      templateName: 'default',
      contentJson: aiSweContent,
      contentHash: aiSweHash,
    });
    console.log('Created AI-SWE base resume');
  }

  // SWE base resume
  const existingSwe = await db.query.resumes.findFirst({
    where: (r, { eq }) => eq(r.track, ResumeTrack.SWE),
    orderBy: (r, { desc }) => desc(r.version),
  });

  if (!existingSwe) {
    const sweHash = await hashContent(JSON.stringify(sweContent));
    await db.insert(schema.resumes).values({
      track: ResumeTrack.SWE,
      version: 1,
      name: 'Software Engineer - Base Template',
      templateName: 'default',
      contentJson: sweContent,
      contentHash: sweHash,
    });
    console.log('Created SWE base resume');
  }

  // --- Sources ---
  const existingSources = await db.query.sources.findMany();
  if (existingSources.length === 0) {
    await db.insert(schema.sources).values([
      {
        name: 'Greenhouse',
        type: 'greenhouse',
        baseUrl: 'https://boards-api.greenhouse.io/v1/boards',
        configJson: { boards: [] },
        enabled: true,
      },
      {
        name: 'Lever',
        type: 'lever',
        baseUrl: 'https://api.lever.co/v0/postings',
        configJson: { companies: [] },
        enabled: true,
      },
      {
        name: 'Ashby',
        type: 'ashby',
        baseUrl: 'https://api.ashbyhq.com/posting-api/job-board',
        configJson: { organizations: [] },
        enabled: true,
      },
    ]);
    console.log('Created default sources');
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
