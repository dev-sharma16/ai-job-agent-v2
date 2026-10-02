# Job Application Agent

A production-oriented personal job discovery and application assistant that continuously discovers software/AI engineering jobs, analyzes them with Gemini AI, generates tailored resumes, and automates applications via Playwright.

## Architecture

```
┌────────────────────┐
│     Next.js Web     │
│ Dashboard + API     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Neon PostgreSQL     │
│ pgvector + pg-boss  │
└─────────┬──────────┘
          ▲
          │
┌─────────┴──────────┐
│ Background Worker  │
│                    │
│ ingestion          │
│ analysis           │
│ resume generation  │
│ browser automation │
└──────┬───────┬─────┘
       │       │
       ▼       ▼
   Gemini   Playwright
```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React 18
- **Database**: Neon PostgreSQL, pgvector, Drizzle ORM, pg-boss
- **AI**: Google Gemini API (@google/genai), structured JSON output
- **Orchestration**: LangGraph.js
- **Browser**: Playwright with persistent profiles
- **PDF**: HTML/CSS templates → Playwright Chromium
- **Validation**: Zod, Vitest, ESLint, TypeScript strict

## Monorepo Structure

```
job-application-agent/
├── apps/
│   ├── web/           # Next.js dashboard + API
│   └── worker/        # Background jobs
├── packages/
│   ├── config/        # Shared configuration
│   ├── domain/        # Shared types and interfaces
│   ├── db/            # Drizzle schema and database client
│   ├── ai/            # Gemini integration
│   ├── resume/        # Resume templates and rendering
│   └── application/   # Browser automation providers
├── data/
│   ├── resumes/       # Base resume templates
│   └── profile/       # Seed data
└── docs/              # Documentation
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Neon PostgreSQL database
- Google Gemini API key

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Set up database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# Start development servers
pnpm dev:web      # Next.js on http://localhost:3000
pnpm dev:worker   # Background worker
```

### Database Setup

1. Create a Neon PostgreSQL database
2. Enable pgvector extension: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Run migrations: `pnpm db:migrate`
4. Seed initial data: `pnpm db:seed`

### Gemini API Key

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to `.env`.

## Available Commands

```bash
# Development
pnpm dev:web          # Start Next.js dev server
pnpm dev:worker       # Start worker in watch mode

# Building
pnpm build            # Build all packages
pnpm build:web        # Build web app
pnpm build:worker     # Build worker

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema changes
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed database

# Testing
pnpm test             # Run all tests
pnpm lint             # Run ESLint
pnpm typecheck        # Run TypeScript checks

# Worker jobs
pnpm ingest           # Run job ingestion
pnpm analyze          # Run job analysis
pnpm embed            # Generate embeddings
```

## Project Structure

### Core Workflow

1. **Ingestion** - Fetch jobs from Greenhouse, Lever, Ashby
2. **Normalization** - Clean and standardize job data
3. **Deduplication** - Remove duplicates by source+ID, content hash
4. **Hard Filtering** - Configurable filters (experience, location, titles)
5. **AI Analysis** - Gemini analyzes JD against profile
6. **Track Selection** - AI-SWE or SWE resume track
7. **Bullet Retrieval** - pgvector similarity search
8. **Resume Generation** - Tailored resume + PDF
9. **Application Answers** - Generated from verified data
10. **Human Review** - Approve/reject/edit before submit
11. **Browser Automation** - Playwright fills and submits forms
12. **Tracking** - Application status timeline

### Database Schema

Key tables: `sources`, `companies`, `jobs`, `job_analysis`, `job_embeddings`, `profile`, `experience_entries`, `verified_bullets`, `projects`, `resumes`, `applications`, `application_events`, `browser_sessions`, `application_questions`, `system_runs`

### Resume Tracks

- **AI-SWE**: AI/LLM/GenAI/agent/RAG-heavy roles
- **SWE**: General software/full-stack/backend/frontend roles

## Configuration

### Job Sources

Configure in Settings dashboard or directly in database:

- Greenhouse: board token
- Lever: company identifier
- Ashby: organization name

### Filters

Configure in Settings:

- Allowed tracks
- Max experience years
- Allowed locations
- Remote preference
- Excluded title terms
- Blocked companies
- Excluded employment types

## Security

- All secrets in environment variables only
- Never committed: `.env`, Playwright storage, private data
- No client-side exposure of API keys, DB URLs, cookies
- Browser automation respects CAPTCHA, MFA, anti-bot measures

## Deployment

### Web (Next.js)

- Deploy to Vercel, Netlify, or any Node.js hosting
- Set environment variables in hosting provider

### Worker (Node.js)

- Deploy to Railway, Render, Fly.io, or VPS
- Needs Chromium for Playwright
- Run as separate process from web

### Database

- Neon PostgreSQL (serverless, scales to zero)

## Development

### Adding a New Job Source

1. Create adapter in `apps/worker/src/ingestion/`
2. Implement `fetchJobs(config)` returning `RawJob[]`
3. Add source type to `SourceType` enum in `@job-agent/domain`
4. Add database migration for new source config fields
5. Register in ingestion runner

### Adding a Browser Provider

1. Create provider class extending `BaseProvider` in `@job-agent/application`
2. Implement `canHandle()`, `inspect()`, `fill()`, `submit()`
3. Add to `getProvider()` factory function
4. Test with local HTML fixtures

## License

Private project for personal use.
