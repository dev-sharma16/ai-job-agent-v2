# Job Application Agent — Project Specification

## 1. Goal

Build a production-oriented personal job discovery and application assistant for Dev Sharma.

The system continuously discovers software/AI engineering jobs, normalizes and deduplicates them, filters irrelevant jobs, analyzes job descriptions with Gemini, selects one of two resume tracks, generates a truthful tailored resume/application package, presents it for human approval, and then uses Playwright to fill and submit supported application forms.

The application must optimize for **quality and control**, not blind mass application.

The two resume tracks are:

- `AI-SWE`: AI/LLM/GenAI/agent/RAG-heavy software engineering roles.
- `SWE`: general software/full-stack/backend/frontend roles where AI is a bonus.

The system must never fabricate experience, skills, education, compensation, work authorization, or achievements.

## 2. Core workflow

```text
Job Sources
   ↓
Ingestion
   ↓
Normalization
   ↓
Deduplication
   ↓
Hard Filtering
   ↓
Gemini Job Analysis
   ↓
Resume Track Selection
   ↓
Relevant Verified Bullet Retrieval
   ↓
Tailored Resume
   ↓
Application Answers
   ↓
Human Review
   ↓
Playwright Application
   ↓
Application Tracking
   ↓
Email/status updates
```

## 3. Required stack

### Frontend + application server

- Next.js
- TypeScript
- App Router
- Tailwind CSS
- Server Actions/API routes where appropriate
- React for dashboard UI

### Database

- Neon PostgreSQL
- pgvector extension
- Drizzle ORM preferred
- PostgreSQL full-text search where useful

### AI

- Google Gemini API
- `@google/genai`
- Default model should be configurable through environment variables.
- Default low-cost/free-tier model: `gemini-3.5-flash-lite` if available to the configured project.
- Fallback model must be configurable, not hardcoded.
- Structured JSON output must be used for classification/extraction.
- Gemini API usage must be centralized behind an `AIProvider` service.

Google's current Gemini documentation describes free-tier access and model/rate-limit restrictions; never assume unlimited requests. Implement rate limiting, retries, exponential backoff, and model configuration.

### Embeddings

- Gemini embedding model configured through `GEMINI_EMBEDDING_MODEL`
- PostgreSQL/pgvector
- Use embeddings for job ↔ resume/bullet/project similarity.

### Workflow orchestration

- LangGraph.js
- Use explicit state and nodes.
- Use checkpoints/persistence where appropriate.
- Human approval is a graph interrupt/state transition.

### Browser automation

- Playwright
- Persistent browser profile
- Only automate supported public application forms.
- Do not bypass CAPTCHA, MFA/OTP, anti-bot challenges, access controls, or login security.

### Background jobs

Use PostgreSQL-backed job scheduling/queueing so Neon remains the main infrastructure dependency.

Recommended:

- `pg-boss` or an equivalent Postgres-backed queue.
- Separate worker process from Next.js web process.

Do not require Redis for v1.

### Resume rendering

- HTML/CSS templates
- Playwright Chromium PDF generation

### Validation

- Zod
- Vitest
- Playwright tests for browser workflows
- ESLint
- TypeScript strict mode

## 4. Monorepo

Use this structure:

```text
job-application-agent/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   └── worker/
│       ├── src/
│       │   ├── jobs/
│       │   ├── ingestion/
│       │   ├── ai/
│       │   ├── browser/
│       │   └── ...
│       └── ...
├── packages/
│   ├── db/
│   ├── ai/
│   ├── domain/
│   ├── resume/
│   ├── application/
│   └── config/
├── data/
│   ├── resumes/
│   ├── profile/
│   └── sources/
├── docs/
├── drizzle/
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

Use pnpm workspaces.

## 5. Main user experience

Dashboard sections:

1. Overview
2. Jobs
3. Job detail
4. Review queue
5. Applications
6. Resumes
7. Profile
8. Sources
9. Settings
10. System/job-run logs

The dashboard must make the current pipeline state visible.

## 6. Important product rule

Do not build a single giant autonomous agent.

Use deterministic code for:

- HTTP fetching
- parsing
- normalization
- deduplication
- hard filters
- database operations
- browser field mapping
- validation
- status transitions

Use Gemini/LangGraph for:

- JD understanding
- semantic classification
- matching/explanation
- resume bullet selection
- controlled rewriting
- application-answer drafting

The LLM must not be the source of truth.

## 7. Security

Secrets must only exist in environment variables.

Never expose:

- Gemini API key
- database URL
- browser storage state
- credentials
- email tokens
- session cookies

to client-side JavaScript.

Never commit `.env`, Playwright storage state, downloaded resumes containing private information, or credentials.

## 8. Human approval

The system must stop before final application submission unless the user explicitly enables an optional trusted auto-submit policy for a supported application type.

Default:

```text
READY_FOR_REVIEW → HUMAN_APPROVAL → SUBMIT
```

The review page must show:

- company
- title
- job URL
- source
- fit information
- matched skills
- missing skills
- selected resume
- generated resume preview/download
- application answers
- unresolved questions
- screenshots if already prepared
- submit button
- reject button

If an answer cannot be verified, the application must become `NEEDS_HUMAN`.

## 9. Truthfulness policy

Create a verified source of truth:

```text
profile
experience
education
projects
skills
achievements
certifications
resume bullets
```

Generated content may:

- reorder facts
- shorten facts
- emphasize relevant facts
- change wording without changing meaning

Generated content may not:

- invent technologies
- invent years of experience
- invent metrics
- invent employment
- invent responsibilities
- claim a technology was used professionally if it was only learned/project experience unless the wording explicitly preserves that distinction.

## 10. Definition of done

The project is complete when:

- Jobs can be discovered from configured sources.
- Jobs are normalized and deduplicated.
- Hard filters work.
- Gemini produces validated structured analysis.
- Jobs are assigned to AI-SWE or SWE.
- Relevant verified bullets are retrieved.
- Tailored resumes are rendered to PDF.
- Application answers are generated from verified data.
- Review queue works.
- Supported ATS application forms can be filled with Playwright.
- Submission requires approval by default.
- Applications are tracked.
- Errors/retries are logged.
- All critical paths have tests.
- README contains local setup and deployment instructions.
