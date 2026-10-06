# AI Job Agent v2 — Complete Project Walkthrough

## 1. What Is This Project? (The Big Picture)

This is a **personal job application automation system**. Think of it as your personal AI job-hunting assistant that:

1. **Discovers** job postings from company career pages (Greenhouse, Lever, Ashby)
2. **Filters** them with hard rules (no senior roles, no internships, etc.)
3. **Analyzes** them with Gemini AI (is this a good fit for you?)
4. **Tailors** your resume specifically for each job
5. **Prepares** application answers from your verified data
6. **Shows** everything to you for approval (human-in-the-loop)
7. **Auto-fills** the application form via Playwright browser automation
8. **Tracks** status changes via email monitoring

The key philosophy: **"Deterministic First, AI Second"** — code handles ingestion/filtering/dedup, AI only handles classification/generation.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    YOUR BROWSER                          │
│              Next.js Dashboard (Web)                     │
│         http://localhost:3000                            │
└──────────────────────┬──────────────────────────────────┘
                       │ (reads/writes)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (Single DB)                 │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ 14 Tables   │  │  pgvector    │  │   pg-boss     │  │
│  │ (all data)  │  │ (embeddings) │  │ (job queue)   │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ (reads/writes)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Background Worker (Node.js)                 │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │Ingestion │→ │ Filtering│→ │AI Analysis│→ │Resume │ │
│  │(2hr)     │  │(30min)   │  │(15min)    │  │Tailor │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘ │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │Embedding │  │Browser   │  │  Email   │              │
│  │(20min)   │  │Automation│  │Ingestion │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└──────┬──────────────┬──────────────┬───────────────────┘
       │              │              │
       ▼              ▼              ▼
   Gemini API    Playwright    IMAP Email
   (AI/LLM)     (Chromium)    (Gmail/etc)
```

**Key insight**: There is only **ONE database** (Neon Postgres) that serves as:
- The data store (14 tables)
- The job queue (pg-boss — no Redis needed)
- The vector store (pgvector — no Pinecone needed)

---

## 3. Monorepo Structure — Where Everything Lives

```
ai-job-agent-v2/
│
├── apps/
│   ├── web/                    ← Next.js 14 Dashboard (port 3000)
│   │   ├── app/
│   │   │   ├── page.tsx                    (landing page)
│   │   │   ├── dashboard/page.tsx          (stats overview)
│   │   │   ├── jobs/page.tsx               (browse all jobs)
│   │   │   ├── jobs/[id]/page.tsx          (single job detail)
│   │   │   ├── review/page.tsx             (approval queue)
│   │   │   ├── review/[id]/page.tsx        (review detail + timeline)
│   │   │   ├── applications/page.tsx       (all applications)
│   │   │   ├── applications/[id]/page.tsx  (app detail + timeline)
│   │   │   ├── profile/page.tsx            (your profile CRUD)
│   │   │   ├── settings/page.tsx           (sources, filters, prefs)
│   │   │   └── api/                        (REST API routes)
│   │   │       ├── dashboard/route.ts
│   │   │       ├── jobs/route.ts
│   │   │       ├── review/route.ts
│   │   │       ├── review/[id]/approve/route.ts
│   │   │       ├── review/[id]/reject/route.ts
│   │   │       ├── applications/route.ts
│   │   │       ├── profile/route.ts
│   │   │       ├── experience/route.ts
│   │   │       ├── projects/route.ts
│   │   │       ├── bullets/route.ts
│   │   │       └── filters/route.ts
│   │   └── components/                    (React components)
│   │
│   └── worker/                 ← Background Job Processor
│       └── src/
│           ├── index.ts                    (entry point, pg-boss init)
│           ├── jobs/
│           │   ├── ingest.ts               (fetch from GH/Lever/Ashby)
│           │   ├── filter.ts               (hard filter rules)
│           │   ├── analyze.ts              (Gemini AI analysis)
│           │   ├── embed.ts                (generate embeddings)
│           │   ├── resumeTailoring.ts      (tailored resume gen)
│           │   ├── pdfGeneration.ts        (PDF via Playwright)
│           │   ├── applicationPrep.ts      (generate answers)
│           │   ├── statusCheck.ts          (check ATS for updates)
│           │   └── emailIngestion.ts       (IMAP email → status)
│           └── ingestion/
│               ├── greenhouse.ts           (Greenhouse API adapter)
│               ├── lever.ts                (Lever API adapter)
│               ├── ashby.ts                (Ashby API adapter)
│               └── email.ts                (IMAP + AI classification)
│
├── packages/
│   ├── config/                 ← Shared env var validation (Zod)
│   │   └── src/index.ts                    (getEnv(), EnvSchema)
│   │
│   ├── domain/                 ← Shared TypeScript types & enums
│   │   └── src/index.ts                    (SourceType, JobStatus,
│   │                                        ApplicationStatus, etc.)
│   │
│   ├── db/                     ← Database layer
│   │   └── src/
│   │       ├── schema.ts                   (Drizzle: all 14 tables)
│   │       ├── client.ts                   (Neon connection)
│   │       └── seed.ts                     (seed data)
│   │
│   ├── ai/                     ← Gemini AI integration
│   │   └── src/
│   │       ├── client.ts                   (generateContent w/ retry)
│   │       ├── schemas.ts                  (Zod schemas for output)
│   │       ├── analyzer.ts                 (analyzeJob())
│   │       ├── embed.ts                    (generateEmbedding())
│   │       └── resumeTailoring.ts          (runResumeTailoring())
│   │
│   ├── resume/                 ← Resume templates & PDF
│   │   └── src/
│   │       ├── templates.ts                (AI_SWE + SWE templates)
│   │       ├── pdf.ts                      (Handlebars → HTML → PDF)
│   │       └── templates/resume.hbs        (Handlebars template)
│   │
│   ├── application/            ← Browser automation
│   │   └── src/
│   │       └── providers.ts                (BaseProvider, GreenhouseProvider,
│   │                                        LeverProvider, AshbyProvider)
│   │
│   └── job-runner/             ← (appears to be a utility package)
│
├── docs/                       ← Original spec documents (01-06)
├── explanation/                ← The docs you asked me to read
├── data/
│   └── resumes/                ← Base resume templates (markdown)
├── phases.md                   ← 13-phase development plan
└── package.json                ← Root scripts
```

---

## 4. The Complete Data Flow — Step by Step

This is the most important part to understand. Here's what happens from job discovery to submission:

### Step 1: Ingestion (every 2 hours)
```
Greenhouse/Lever/Ashby APIs
        │
        ▼
  [worker/src/jobs/ingest.ts]
        │
        ├── Fetches raw job postings
        ├── Normalizes titles, locations, employment types
        ├── Generates SHA-256 content hash (for dedup)
        └── Upserts into `jobs` table
            ├── New job → status = 'discovered'
            ├── Existing + changed → update
            └── Existing + same → skip
```

### Step 2: Hard Filtering (every 30 minutes)
```
  jobs (status = 'discovered')
        │
        ▼
  [worker/src/jobs/filter.ts]
        │
        ├── Rejects if title contains: senior, staff, lead, principal, manager
        ├── Rejects if company in blocked list
        ├── Rejects if experience > max (e.g., 8 years)
        ├── Rejects if employment type = internship/contract
        ├── Rejects if location/remote mismatch
        └── Result: status = 'filtered' (rejected) or stays 'discovered'
```

### Step 3: AI Analysis (every 15 minutes)
```
  jobs (status = 'discovered', not yet analyzed)
        │
        ▼
  [worker/src/jobs/analyze.ts → packages/ai/src/analyzer.ts]
        │
        ├── Builds prompt: job details + your profile
        ├── Calls Gemini with structured output (Zod schema)
        ├── Gemini returns:
        │   ├── Track: ai_swe | swe
        │   ├── Fit score: 0-100
        │   ├── Required/preferred/matched/missing skills
        │   ├── Concerns (overqualification, visa, location)
        │   └── Reasoning explanation
        ├── Stores in `job_analysis` table
        ├── Generates embedding for job description
        └── Updates job status to 'analyzed'
```

### Step 4: Embeddings (every 20 minutes)
```
  jobs + verified_bullets + projects
        │
        ▼
  [worker/src/jobs/embed.ts → packages/ai/src/embed.ts]
        │
        ├── Generates 768-dim embeddings via Gemini text-embedding-004
        ├── Stores in `job_embeddings`, `verified_bullets`, `projects`
        └── Enables semantic similarity search (pgvector)
```

### Step 5: Resume Tailoring (on-demand)
```
  User clicks "Tailor Resume" on a job
        │
        ▼
  [worker/src/jobs/resumeTailoring.ts]
        │
        ├── Loads job + analysis + your profile
        ├── Selects track (ai_swe or swe)
        ├── Retrieves relevant bullets via pgvector similarity
        │   (finds bullets semantically similar to job description)
        ├── Gemini selects top 15 bullets
        ├── Gemini generates 2-3 sentence summary
        ├── Assembles resume from template + selected bullets
        ├── Validates claims (no hallucination check)
        ├── Renders PDF via Playwright (HTML → PDF)
        └── Stores in `resumes` table (versioned per track)
```

### Step 6: Application Preparation (on-demand)
```
  After resume is tailored
        │
        ▼
  [worker/src/jobs/applicationPrep.ts]
        │
        ├── Generates answers for 12 standard questions:
        │   (name, email, phone, location, LinkedIn, GitHub, etc.)
        ├── Creates `applications` row (status = 'ready_for_review')
        ├── Saves answers to `application_questions`
        └── Returns package for review queue
```

### Step 7: Human Review (you, in the browser)
```
  You visit /review in the dashboard
        │
        ▼
  [web/app/review/*]
        │
        ├── See job info, AI analysis, resume preview, answers
        ├── Actions: Approve, Reject, Regenerate, Mark Needs Human
        └── If approved → status = 'approved'
```

### Step 8: Browser Automation (after approval)
```
  Application approved
        │
        ▼
  [packages/application/src/providers.ts]
        │
        ├── Opens job application URL in Playwright Chromium
        ├── Inspects form fields (label, name, type, required)
        ├── Fills standard fields from verified data
        ├── Classifies custom questions via AI → answers them
        ├── Uploads resume PDF
        ├── Pre-submit validation (all required fields filled)
        ├── Detects challenges (CAPTCHA, Cloudflare → NEEDS_HUMAN)
        ├── Clicks submit → waits for confirmation
        └── Updates status to 'submitted'
```

### Step 9: Email Tracking (every 15 minutes)
```
  Your email inbox
        │
        ▼
  [worker/src/jobs/emailIngestion.ts]
        │
        ├── Fetches UNSEEN emails via IMAP
        ├── AI classifies: rejection, assessment, interview, confirmation
        ├── Matches to pending application (company + role)
        ├── Auto-updates application status
        └── Logs event in `application_events`
```

---

## 5. Database — 14 Tables

| Category | Table | Purpose |
|----------|-------|---------|
| **Job Discovery** | `sources` | Job source configs (Greenhouse/Lever/Ashby tokens) |
| | `companies` | Company registry |
| | `jobs` | All job postings (normalized) |
| **AI Analysis** | `job_analysis` | Gemini analysis results per job |
| | `job_embeddings` | 768-dim vectors for semantic search |
| **Your Truth** | `profile` | Your identity (name, email, etc.) |
| | `experience_entries` | Work history |
| | `verified_bullets` | Atomic resume bullets (with embeddings) |
| | `projects` | Project portfolio (with embeddings) |
| | `resumes` | Versioned generated resumes |
| **Applications** | `applications` | Application lifecycle tracking |
| | `application_events` | Immutable audit log (event sourcing) |
| | `application_questions` | Per-app Q&A pairs |
| **System** | `browser_sessions` | Playwright persistent profiles |
| | `system_runs` | Worker job execution logs |

---

## 6. Tech Stack — What Tools and Why

| Layer | Technology | Why |
|-------|-----------|-----|
| **Package Manager** | pnpm 9 | Fast, disk-efficient monorepo |
| **Language** | TypeScript 5.5 | Type safety everywhere |
| **Runtime** | Node.js 20+ | LTS, native fetch |
| **Frontend** | Next.js 14 (App Router) | Server components, API routes, SSR |
| **Styling** | Tailwind CSS 3.4 | Utility-first, rapid UI |
| **Database** | Neon PostgreSQL | Serverless, pgvector, branching |
| **ORM** | Drizzle ORM | Type-safe SQL, pgvector support, lightweight |
| **Job Queue** | pg-boss | Postgres-native, no Redis needed |
| **Vector DB** | pgvector (in Postgres) | No separate service needed |
| **AI/LLM** | Google Gemini 1.5 Flash | Free tier, 1M context, structured output |
| **AI SDK** | @google/genai | Official Gemini SDK |
| **Validation** | Zod 3.23 | Runtime validation + AI output schemas |
| **Browser** | Playwright 1.44 | Best reliability, auto-waiting, stealth |
| **PDF** | Handlebars + Playwright | HTML/CSS → PDF |
| **Testing** | Vitest + Playwright Test | Unit + E2E |
| **Linting** | ESLint 9 + Prettier | Code quality |

---

## 7. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Deterministic first, AI second** | Code handles ingestion/filtering/dedup; AI only for classification/generation |
| **Verified bullet bank** | No hallucination — every resume bullet traces to a real experience/project |
| **pg-boss for queue** | No Redis dependency — Postgres is already required |
| **pgvector in same DB** | Single infrastructure — no separate vector DB service |
| **Structured AI output** | Zod schemas enforce valid JSON — no parsing errors |
| **Two resume tracks** | AI-SWE vs SWE need different skill emphasis |
| **Human approval required** | Safety — never auto-submit without review |
| **Content hashing** | Cache AI results — skip unchanged jobs |
| **Event sourcing** | Every state change logged for audit/timeline |
| **Free-tier first** | Neon + Gemini Flash + Vercel + Railway free tiers cover dev/small prod |

---

## 8. Worker Job Schedule (Automated Timeline)

| Job | Frequency | What It Does |
|-----|-----------|-------------|
| `discover-jobs` | Every 2 hours | Fetch new jobs from all sources |
| `filter-jobs` | Every 30 min | Apply hard filter rules |
| `analyze-jobs` | Every 15 min | Gemini AI analysis |
| `generate-embeddings` | Every 20 min | Create/update embeddings |
| `check-application-status` | Every 6 hours | Check ATS for status updates |
| `email-ingestion` | Every 15 min | Check email for responses |
| `cleanup` | Daily 3 AM | Maintenance |

---

## 9. How to Run It

```bash
# 1. Install
pnpm install

# 2. Configure
cp .env.example .env
# Edit .env with your Neon DB URL + Gemini API key

# 3. Set up database
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed your profile, experiences, bullets

# 4. Run
pnpm dev:web        # Dashboard on http://localhost:3000
pnpm dev:worker     # Background worker (separate terminal)
```

---

## 10. The 13 Phases (Development Plan)

The project was built in 13 phases:

1. Monorepo + Next.js + Worker setup
2. Neon DB + Drizzle + pgvector
3. Profile/resume truth CRUD
4. Job ingestion adapters
5. Hard filtering
6. AI package (Gemini)
7. Embeddings + pgvector retrieval
8. LangGraph workflows (simplified)
9. Resume PDF generation
10. Review dashboard
11. Browser provider (Greenhouse)
12. Application tracking
13. Email/status integration

---

That's the entire project! The core loop is: **Discover → Filter → Analyze → Tailor → Review → Apply → Track**. Everything else (database, worker, dashboard, email) supports this pipeline.
