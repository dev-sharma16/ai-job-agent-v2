# Implementation, Testing, Scheduling, and Deployment

## 1. Build order

Implement in this exact order.

### Phase 1 — Repository

Create:

```text
pnpm workspace
Next.js app
worker app
shared packages
ESLint
Prettier
TypeScript strict
Vitest
Playwright
```

Everything must run locally.

### Phase 2 — Neon

Create Neon database.

Enable:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Create Drizzle schema and migrations.

Verify:

- connection
- migrations
- vector column
- indexes

### Phase 3 — Profile and resume truth

Implement dashboard CRUD for:

```text
profile
experience
projects
verified bullets
skills
```

Seed the user's two resume tracks from the supplied resume data.

Do not put fabricated metrics into the seed data.

### Phase 4 — Job ingestion

Implement:

```text
Greenhouse adapter
Lever adapter
Ashby adapter
```

Add source/company configuration UI.

Add:

```text
manual run
scheduled run
```

### Phase 5 — Filtering

Implement deterministic filters.

Expose filter configuration in Settings.

### Phase 6 — Gemini

Create a shared AI package:

```text
packages/ai/
  client.ts
  schemas.ts
  prompts/
  analyzer.ts
  resume.ts
  answers.ts
```

All model calls go through this package.

Use structured output + Zod validation.

### Phase 7 — Embeddings

Create:

```text
job embedding
bullet embedding
project embedding
```

Implement semantic retrieval using pgvector.

### Phase 8 — LangGraph

Implement graphs:

```text
job-analysis graph
resume-tailoring graph
application-preparation graph
```

Keep graphs small and composable.

### Phase 9 — Resume PDF

Build stable HTML/CSS templates.

Render PDFs using Playwright.

Store generated metadata in Neon and files in local storage for development.

For deployment, make storage configurable.

### Phase 10 — Review dashboard

Build the review queue.

The user must be able to:

- inspect
- edit
- regenerate
- approve
- reject
- mark needs human

### Phase 11 — Browser provider

Implement Greenhouse application provider.

Use a persistent browser profile.

Implement:

```text
inspect
fill
validate
screenshot
submit
```

### Phase 12 — Tracking

Add application timeline.

Example:

```text
DISCOVERED
ANALYZED
READY_FOR_REVIEW
APPROVED
FORM_FILLED
SUBMITTED
```

### Phase 13 — Email/status integration

Implement email ingestion only after the core system works.

Use email alerts to detect:

```text
rejection
assessment
interview
application confirmation
```

Never automatically classify an ambiguous email as an offer/interview without a reviewable event.

## 2. Scheduling

Use `pg-boss` or another Postgres-backed scheduler.

Recommended jobs:

```text
discover-jobs
analyze-jobs
generate-embeddings
prepare-applications
status-check
cleanup
```

Example schedule:

```text
discover-jobs     every 2 hours
analyze-jobs      every 30 minutes
status-check     every 6 hours
cleanup           daily
```

These must be configurable.

Do not hammer public endpoints.

Respect provider terms, rate limits, and reasonable request intervals.

## 3. Retry strategy

Every worker job should have:

```text
maxAttempts
backoff
timeout
dead-letter/failure state
```

Do not retry permanent errors.

## 4. Observability

Create structured logs:

```json
{
  "event": "job.analyzed",
  "jobId": "...",
  "model": "...",
  "durationMs": 1234
}
```

Never log:

- API keys
- passwords
- cookies
- full browser storage
- private email tokens

## 5. Dashboard

### Overview

Show:

```text
Jobs discovered today
Relevant jobs
Ready for review
Applications submitted
Interviews
Rejected
Failed
```

### Jobs

Filters:

```text
track
score
company
source
location
remote
status
date
```

### Job detail

Show:

```text
JD
analysis
matched skills
missing skills
selected track
similar verified bullets
application status
```

### Review

Show application package.

### Applications

Show:

```text
company
title
date
resume version
status
timeline
```

## 6. Rate-limit handling

For Gemini:

- detect 429
- exponential backoff
- respect response retry information
- queue rather than fail immediately
- cache repeated analyses

For job sources:

- use conservative polling
- no unnecessary requests
- store ETags/last-modified when supported
- avoid concurrent requests to the same provider

## 7. Free-tier-first design

The initial project should run with:

```text
Neon free tier
Gemini free tier
local Playwright
local worker
```

Do not require paid Redis, paid vector DB, or paid LLM APIs.

Gemini limits are not unlimited. Keep the AI workload small by hard-filtering before analysis and caching by content hash.

The model name must be environment-configurable because Google changes model availability and free-tier limits.

## 8. Deployment

Recommended split:

```text
Web:
Next.js deployment

Worker:
Node.js worker process

Database:
Neon

Browser:
Worker machine/container with Chromium
```

Do not run long-lived Playwright browser sessions inside a serverless request handler.

The worker needs a runtime where Chromium can run reliably.

## 9. Environment

Production secrets:

```text
DATABASE_URL
GEMINI_API_KEY
GEMINI_MODEL
GEMINI_EMBEDDING_MODEL
CRON_SECRET
ENCRYPTION_KEY
```

Use deployment-provider secret storage.

## 10. Tests

Required unit tests:

```text
normalization
deduplication
hard filtering
experience parsing
track classification
schema validation
state transitions
answer validation
```

Required integration tests:

```text
database migrations
job ingestion
Gemini response validation
embedding retrieval
resume generation
application package creation
```

Required browser tests:

```text
Greenhouse fixture
form filling
file upload
required-field validation
challenge detection
submit flow
duplicate application prevention
```

## 11. Failure recovery

If a worker crashes:

```text
job remains recoverable
```

If PDF generation fails:

```text
application → FAILED
```

If browser form changes:

```text
application → NEEDS_HUMAN
```

If Gemini is unavailable:

```text
queue retry
```

If a job disappears from the source:

Do not automatically delete the internal job.

Mark it according to source state.

## 12. Acceptance criteria

The coding agent must not stop at scaffolding.

A complete implementation must include:

- working database migrations
- seeded profile/resume truth data
- working dashboard
- working source adapters
- working ingestion worker
- deduplication
- hard filtering
- Gemini analysis
- pgvector retrieval
- LangGraph workflows
- resume PDF generation
- application answer generation
- review queue
- Playwright provider
- application tracking
- tests
- `.env.example`
- README
- local development commands

## 13. Final README requirements

The generated README must explain:

1. What the project does.
2. Architecture.
3. Local prerequisites.
4. Neon setup.
5. Gemini API key setup.
6. Database migration commands.
7. Seed commands.
8. Starting web app.
9. Starting worker.
10. Running tests.
11. Configuring job sources.
12. Creating browser profile.
13. Approving an application.
14. Security limitations.
15. Deployment.

## 14. Coding-agent instruction

Do not merely create placeholder files.

When implementing:

1. Build the database.
2. Run migrations.
3. Build each module.
4. Run type checking.
5. Run tests.
6. Fix failures.
7. Run the app.
8. Verify critical workflows.
9. Update README.
10. Leave a clean working repository.

If a third-party API behavior is uncertain, isolate it behind an adapter and document the assumption rather than spreading provider-specific logic throughout the application.
