# Project Structure & File-to-Feature Mapping

---

## Monorepo Overview

```
job-application-agent/
├── apps/
│   ├── web/                    # Next.js 14 Dashboard + API Routes
│   └── worker/                 # Background Job Processor
├── packages/
│   ├── config/                 # Shared environment configuration
│   ├── domain/                 # Shared TypeScript types/enums
│   ├── db/                     # Drizzle ORM schema + client
│   ├── ai/                     # Gemini AI integration
│   ├── resume/                 # Resume templates + PDF generation
│   └── application/            # Browser automation providers
├── docs/                       # Specification documents
├── data/                       # Static data (resume templates, etc.)
└── explanation/                # This folder
```

---

## Apps

### `apps/web/` — Next.js Dashboard

| Path | Feature | Description |
|------|---------|-------------|
| `app/page.tsx` | Landing | Marketing landing page |
| `app/dashboard/page.tsx` | Dashboard | Real-time stats, recent activity, quick actions |
| `app/jobs/page.tsx` | Jobs List | Browse/filter all discovered jobs |
| `app/jobs/[id]/page.tsx` | Job Detail | Job description, analysis, actions |
| `app/review/page.tsx` | Review Queue | List + detail for `ready_for_review` apps |
| `app/review/[id]/page.tsx` | Review Detail | **Timeline**, job info, resume, answers, actions |
| `app/applications/page.tsx` | Applications | All applications with status filters |
| `app/applications/[id]/page.tsx` | App Detail | Full application + timeline + resume + answers |
| `app/profile/page.tsx` | Profile CRUD | Profile, Experience, Projects, Bullets management |
| `app/settings/page.tsx` | Settings | Source config, filter policy, preferences |

#### API Routes (`app/api/`)
| Route | Feature |
|-------|---------|
| `GET /api/dashboard` | Dashboard stats (server component) |
| `GET/POST /api/jobs` | Job listing, manual analyze trigger |
| `GET/POST /api/review` | Review queue listing |
| `POST /api/review/[id]/approve` | Approve application |
| `POST /api/review/[id]/reject` | Reject with reason |
| `POST /api/review/[id]/regenerate` | Re-run resume tailoring |
| `GET/POST /api/applications` | Application listing |
| `PATCH /api/applications/[id]/status` | Manual status override |
| `GET /api/profile` | Profile + experience + projects + bullets |
| `PUT /api/profile` | Update profile |
| `GET/POST /api/experience` | Experience CRUD |
| `GET/POST /api/projects` | Projects CRUD |
| `GET/POST /api/bullets` | Verified bullets CRUD |
| `POST /api/filters` | Update filter policy |

---

### `apps/worker/` — Background Processor

| Path | Feature |
|------|---------|
| `src/index.ts` | **Entry point**: pg-boss queue initialization, job registration, scheduling |
| `src/jobs/ingest.ts` | Job ingestion from Greenhouse/Lever/Ashby |
| `src/jobs/filter.ts` | Hard filtering logic |
| `src/jobs/analyze.ts` | AI analysis + embedding generation |
| `src/jobs/embed.ts` | Embedding generation + similarity search |
| `src/jobs/resumeTailoring.ts` | Resume tailoring workflow |
| `src/jobs/pdfGeneration.ts` | PDF generation via Playwright |
| `src/jobs/applicationPrep.ts` | Application answer generation + package assembly |
| `src/jobs/statusCheck.ts` | **Browser automation**: check application status on ATS |
| `src/jobs/emailIngestion.ts` | **Email ingestion**: IMAP + AI classification |
| `src/ingestion/greenhouse.ts` | Greenhouse API adapter |
| `src/ingestion/lever.ts` | Lever API adapter |
| `src/ingestion/ashby.ts` | Ashby API adapter |
| `src/ingestion/email.ts` | IMAP + AI email classification |
| `src/ai/index.ts` | Worker-specific AI helpers |

#### Worker Job Schedule (pg-boss)
| Job | Cron | Description |
|-----|------|-------------|
| `discover-jobs` | `0 */2 * * *` | Every 2 hours: ingest from all sources |
| `filter-jobs` | `*/30 * * * *` | Every 30 min: hard filter discovered jobs |
| `analyze-jobs` | `*/15 * * * *` | Every 15 min: AI analyze filtered jobs |
| `generate-embeddings` | `*/20 * * * *` | Every 20 min: embed jobs/bullets/projects |
| `check-application-status` | `0 */6 * * *` | Every 6 hours: check submitted app status |
| `check-all-application-statuses` | `0 */6 * * *` | Queue status checks for all pending apps |
| `email-ingestion` | `*/15 * * * *` | Every 15 min: check email for status updates |
| `cleanup` | `0 3 * * *` | Daily 3 AM: maintenance |

---

## Packages

### `packages/config/` — Environment Configuration
| File | Purpose |
|------|---------|
| `src/index.ts` | `getEnv()` — validated env vars with Zod, defaults, type safety |

**Exports**: `getEnv()`, `EnvSchema` (Zod)

---

### `packages/domain/` — Shared Types
| File | Purpose |
|------|---------|
| `src/index.ts` | **All enums & interfaces**: `SourceType`, `JobStatus`, `ApplicationStatus`, `ResumeTrack`, `RemoteType`, `EmploymentType`, `ApplicationEventType`, `RawJob`, `VerifiedBullet`, `JobFilterPolicy`, `ApplicationFormField`, `ApplicationForm`, `FieldType`, `FillResult`, `SubmitResult`, `ApplicationProvider`, `ApplicationPackage`, `ApplicationAnswer`, `Application` |

**Used by**: All packages for type-safe communication

---

### `packages/db/` — Database Layer
| File | Purpose |
|------|---------|
| `src/schema.ts` | **Drizzle schema**: All 14 tables with indexes, enums, relations |
| `src/client.ts` | `db` instance + `closePool()` for Neon serverless |
| `src/index.ts` | Re-exports schema + client |
| `src/seed.ts` | **Comprehensive seed**: Profile, 3 experiences, 3 projects, 15 bullets, 2 base resumes, default sources |

**Exports**: `db`, `closePool`, all table objects, `seed()`

---

### `packages/ai/` — Gemini Integration
| File | Purpose |
|------|---------|
| `src/client.ts` | `generateContent()` — retry logic, exponential backoff, structured output via Zod |
| `src/schemas.ts` | **All Zod schemas**: `JobAnalysisSchema`, `ResumeBulletSelectionSchema`, `SummaryGenerationSchema`, `ApplicationAnswerSchema`, `CoverNoteSchema`, `QuestionClassificationSchema`, `EmailClassificationSchema` + prompt versions |
| `src/analyzer.ts` | `analyzeJob()` — builds prompt, calls Gemini, returns typed `JobAnalysis` |
| `src/embed.ts` | `generateEmbedding()`, `findSimilarBullets()`, `findSimilarProjects()`, `runEmbeddingGeneration()` |
| `src/resumeTailoring.ts` | `runResumeTailoring()` — bullet selection, summary, cover note, resume assembly |
| `src/index.ts` | Re-exports all |

**Prompt Versions** (for cache invalidation):
- `JobAnalysisPromptVersion = 'v1'`
- `ResumeSelectionPromptVersion = 'v1'`
- `SummaryPromptVersion = 'v1'`
- `AnswersPromptVersion = 'v1'`
- `CoverNotePromptVersion = 'v1'`
- `ClassificationPromptVersion = 'v1'`

---

### `packages/resume/` — Resume Templates & PDF
| File | Purpose |
|------|---------|
| `src/templates.ts` | `ResumeContent` interface, `AI_SWE_TEMPLATE`, `SWE_TEMPLATE`, `getTemplate()` |
| `src/pdf.ts` | `generateResumePDF()` — Handlebars → HTML → Playwright Chromium → PDF |
| `src/templates/resume.hbs` | **Handlebars template** with CSS for ATS-friendly PDF |
| `src/index.ts` | Re-exports |

**Template Structure** (`ResumeContent`):
```typescript
{
  header: { name, email, phone, location, linkedin, github, portfolio },
  summary: string,
  experience: ExperienceSection[],
  projects: ProjectSection[],
  skills: SkillSection[],
  education: EducationSection[],
  certifications: CertificationSection[]
}
```

---

### `packages/application/` — Browser Automation
| File | Purpose |
|------|---------|
| `src/providers.ts` | **BaseProvider** (abstract), `GreenhouseProvider`, `LeverProvider`, `AshbyProvider`, `getProvider(url)` factory |
| `src/index.ts` | Re-exports |

**BaseProvider Capabilities**:
- `inspect(page)`: Extract all form fields (label, name, type, placeholder, required, options)
- `fill(page, application)`: Map `FieldType` → answer, fill via semantic locators
- `submit(page)`: Click submit, wait for confirmation, screenshot
- `detectChallenge(page)`: CAPTCHA, Cloudflare, MFA, login detection

**GreenhouseProvider Specifics**:
- Greenhouse-specific selectors (`question_` prefix, label-based)
- Pre-submit validation (required fields, resume upload, unanswered questions)
- Success detection (confirmation messages, thank you pages)

---

## Data Directory

```
data/
├── resumes/
│   ├── ai-swe/template.md    # Base AI-SWE resume (markdown)
│   └── swe/template.md       # Base SWE resume (markdown)
└── profile/                  # Profile seed data (if separate)
```

---

## File-to-Feature Quick Reference

| Feature | Key Files |
|---------|-----------|
| **Job Ingestion** | `worker/src/jobs/ingest.ts`, `worker/src/ingestion/*.ts` |
| **Hard Filtering** | `worker/src/jobs/filter.ts` |
| **AI Analysis** | `worker/src/jobs/analyze.ts`, `ai/src/analyzer.ts`, `ai/src/schemas.ts` |
| **Embeddings** | `worker/src/jobs/embed.ts`, `ai/src/embed.ts` |
| **Resume Tailoring** | `worker/src/jobs/resumeTailoring.ts`, `ai/src/resumeTailoring.ts` |
| **PDF Generation** | `worker/src/jobs/pdfGeneration.ts`, `resume/src/pdf.ts`, `resume/src/templates/*.hbs` |
| **Application Prep** | `worker/src/jobs/applicationPrep.ts` |
| **Review Queue** | `web/app/review/*`, `web/components/review/*` |
| **Browser Automation** | `application/src/providers.ts` |
| **Status Checking** | `worker/src/jobs/statusCheck.ts` |
| **Email Ingestion** | `worker/src/ingestion/email.ts`, `worker/src/jobs/emailIngestion.ts` |
| **Dashboard** | `web/app/dashboard/page.tsx`, `web/app/api/dashboard/route.ts` |
| **Application Timeline** | `web/components/applications/ApplicationTimeline.tsx`, `web/app/applications/[id]/*` |
| **Profile CRUD** | `web/app/profile/*`, `web/components/profile/*` |
| **Database Schema** | `db/src/schema.ts` |
| **Seeding** | `db/src/seed.ts` |

---

## Dependency Graph

```
apps/web
  ├─▶ @job-agent/ai
  ├─▶ @job-agent/application
  ├─▶ @job-agent/config
  ├─▶ @job-agent/db
  ├─▶ @job-agent/domain
  └─▶ @job-agent/resume

apps/worker
  ├─▶ @job-agent/ai
  ├─▶ @job-agent/application
  ├─▶ @job-agent/config
  ├─▶ @job-agent/db
  ├─▶ @job-agent/domain
  └─▶ @job-agent/resume

packages/ai
  ├─▶ @job-agent/db
  ├─▶ @job-agent/domain
  └─▶ @job-agent/config

packages/application
  └─▶ @job-agent/domain

packages/resume
  └─▶ @job-agent/domain

packages/db
  └─▶ (none - base)

packages/domain
  └─▶ (none - base)

packages/config
  └─▶ (none - base)
```

---

## Running Commands

```bash
# Development
pnpm dev:web      # Next.js on :3000
pnpm dev:worker   # Worker with hot reload

# Database
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema (dev)
pnpm db:studio    # Drizzle Studio UI
pnpm db:seed      # Seed profile, experiences, bullets, resumes

# Worker Jobs (manual)
pnpm --filter worker ingest      # Run ingestion once
pnpm --filter worker filter      # Run filtering once
pnpm --filter worker analyze     # Run AI analysis once
pnpm --filter worker embed       # Generate embeddings once

# Build & Test
pnpm build        # Build all packages
pnpm typecheck    # TypeScript check all
pnpm test         # Run all Vitest tests
pnpm lint         # ESLint all
```