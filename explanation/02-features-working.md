# Features & Working Explanation

This document explains every feature in the system and how it works end-to-end.

---

## 1. Job Ingestion Pipeline

### 1.1 Source Adapters
**Files**: `apps/worker/src/ingestion/*.ts`

| Adapter | Source | Method |
|---------|--------|--------|
| Greenhouse | `greenhouse.ts` | Public board API: `https://boards-api.greenhouse.io/v1/boards/{token}/jobs` |
| Lever | `lever.ts` | Public postings API: `https://api.lever.co/v0/postings/{company}` |
| Ashby | `ashby.ts` | Public job board API: `https://api.ashbyhq.com/posting-api/job-board/{org}` |

**Flow**:
1. Worker runs `discover-jobs` job (scheduled every 2 hours via pg-boss)
2. For each enabled source, fetch jobs using adapter
2. Normalize into internal `RawJob` format
3. Generate content hash (SHA-256 of description)
4. Upsert into `jobs` table:
   - New → insert with status `discovered`
   - Existing + hash changed → update
   - Existing + hash same → skip

### 1.2 Normalization (`ingest.ts:normalizeJob`)
- Title lowercasing, special char removal
- Location parsing → remote_type inference
- Employment type normalization
- Content hash generation for deduplication

### 1.3 Deduplication Strategy
1. **Primary**: `(source_id, external_id)` unique constraint
2. **Secondary**: Company + normalized title + application URL
3. **Tertiary**: Content hash of description

---

## 2. Hard Filtering (`filter.ts`)

**Runs**: Every 30 minutes via pg-boss job `filter-jobs`

**Policy** (configurable via `JobFilterPolicy`):
```typescript
interface JobFilterPolicy {
  allowedTracks: ResumeTrack[];           // ['ai_swe', 'swe']
  maxExperienceYears: number;             // e.g., 8
  allowedLocations: string[];             // Empty = any
  allowRemote: boolean;                   // true
  excludedTitleTerms: string[];           // ['senior', 'staff', 'lead', 'principal', 'manager', ...]
  blockedCompanies: string[];             // User-defined
  excludedEmploymentTypes: EmploymentType[]; // [internship, contract]
}
```

**Experience Parsing** (`parseExperience`):
- Patterns: `0-2 years`, `1+ years`, `2 years`, `3+ years`, `freshers`, `entry level`, `junior`
- Returns max years for ranges, 0 for entry-level terms
- Ambiguous → null (doesn't auto-reject)

**Filter Logic**:
1. Title contains excluded term → reject
3. Company in blocked list → reject
4. Experience > max → reject
5. Employment type excluded → reject
6. Location/remote mismatch → reject

**Result**: Jobs moved from `discovered` → `filtered` (rejected) or kept as `discovered` for analysis.

---

## 3. AI Analysis (`analyze.ts` + `packages/ai/src/analyzer.ts`)

**Runs**: Every 15 minutes via pg-boss job `analyze-jobs`

**Process**:
1. Find jobs with status `filtered` (not `discovered` - that's a bug, should be `discovered` after filtering)
2. Build prompt with job details + user profile
3. Call Gemini with structured output (Zod schema)
4. Cache by `(content_hash + prompt_version + model)`
5. Store in `job_analysis` + update job status to `analyzed`
7. Generate embedding for job description

### 3.1 Prompt Structure (`analyzer.ts:buildAnalysisPrompt`)
```
System: You are an expert technical recruiter...
Candidate Profile: Dev Sharma, 6+ years SWE, 2+ years AI/ML...
Job: [Title, Company, Location, Description, URL]

Analyze and return:
1. Track: ai_swe | swe | other
2. Seniority
3. Experience required
4. Required skills (explicit)
5. Preferred skills
6. AI-specific requirements
7. Matched skills (from profile)
8. Missing skills
9. Concerns (overqualification, visa, location)
10. Fit score (0-100)
11. Explanation
```

### 3.2 Track Classification
**AI-SWE Signals**: LLM, GenAI, RAG, agents, LangChain, LangGraph, vector DB, embeddings, prompt engineering, tool calling, AI applications
**SWE Signals**: full stack, backend, frontend, Node.js, React, TypeScript, REST API, PostgreSQL, AWS

Uses semantic analysis, not just keyword matching.

### 3.3 Fit Scoring (Weighted)
| Component | Weight |
|-----------|--------|
| Experience compatibility | 25 |
| Required skill match | 30 |
| Role/track compatibility | 20 |
| Location/remote compatibility | 15 |
| Preferred skills | 10 |

---

## 4. Embeddings & Retrieval (`embed.ts`)

**Runs**: Every 20 minutes via pg-boss job `generate-embeddings`

**What gets embedded**:
- Job descriptions (for job ↔ bullet/project similarity)
- Verified bullets (for job → bullet retrieval)
- Projects (for job → project retrieval)

**Model**: `text-embedding-004` (768 dimensions) via Gemini

**Retrieval** (`findSimilarBullets`):
```sql
SELECT id, text, track_tags_json, skill_tags_json, source_reference,
       1 - (embedding <=> $job_embedding) as similarity
FROM verified_bullets
WHERE embedding IS NOT NULL
  AND $track = ANY(track_tags_json)
  AND 1 - (embedding <=> $job_embedding) >= $min_similarity
ORDER BY similarity DESC
LIMIT $limit
```

**Parameters**:
- Track filter: `ai_swe` or `swe`
- Min similarity: 0.65 (bullets), 0.6 (projects)
- Limit: 30 bullets, 10 projects

---

## 4. Resume Tailoring (`resumeTailoring.ts`)

**Triggered**: On-demand via `tailor-resume` job (from review queue or manual)

**LangGraph-style Workflow** (function composition):
```
START
  → loadJob + loadProfile
  → selectTrack (from job_analysis)
  → retrieveRelevantBullets (pgvector)
  → selectBullets (Gemini selects up to 15)
  → generateSummary (Gemini, 2-3 sentences)
  → assembleResume (merge with base template)
  → validateClaims (Gemini checks no hallucination)
  → renderPDF (Playwright)
END
```

**Validation Loop** (max 2-3 revisions):
```
validateClaims → invalid → remove/rewrite unsupported claim → validate again
```

**Base Templates** (`packages/resume/src/templates.ts`):
- `AI_SWE_TEMPLATE`: AI-heavy skills first, AI projects highlighted
- `SWE_TEMPLATE`: General SWE skills, AI as bonus

**Output**: New `resumes` row with versioned content + PDF generated via Playwright.

---

## 5. Application Preparation (`applicationPrep.ts`)

**Triggered**: After resume tailoring, via `prepare-application` job

**Process**:
1. Load job, analysis, resume, profile, experience, projects
2. Generate answers for 12 standard questions:
   - Name, Email, Phone, Location, LinkedIn, GitHub, Portfolio
   - Resume upload, Cover letter, Work authorization, Notice period, Salary
3. Create `applications` row with status `ready_for_review`
4. Save answers to `application_questions`
5. Return `ApplicationPackage` for review queue

---

## 6. Review Queue (`apps/web/app/review/*`)

**UI**: `/review` page with `ReviewQueue` + `ReviewDetail` components

**Features**:
- List applications with status badges, fit scores, matched/missing skills
- Detail view: Job info, AI analysis, Resume preview, Answers, Timeline
- Actions: **Approve**, **Reject**, **Regenerate**, **Mark Needs Human**

**Approval Flow**:
```
READY_FOR_REVIEW → HUMAN_APPROVAL → APPROVED → PREPARING → APPLYING → SUBMITTED
```

---

## 7. Browser Automation (`packages/application/src/providers.ts`)

### 7.1 Provider Interface
```typescript
interface ApplicationProvider {
  canHandle(url: string): boolean;
  inspect(page): Promise<ApplicationForm>;
  fill(page, application): Promise<FillResult>;
  submit(page): Promise<SubmitResult>;
}
```

### 7.2 Greenhouse Provider (Implemented)
- **Field Mapping**: Semantic locators (label, name, placeholder, nearby text)
- **Standard Fields**: Name, Email, Phone, Location, LinkedIn, GitHub, Portfolio, Resume, Cover Letter, Work Auth, Notice Period, Salary
- **Custom Questions**: Classified via AI → answered from verified data
- **File Upload**: Resume PDF via `input[type="file"]`
- **Pre-submit Validation**: Required fields, resume uploaded, no unanswered custom questions
- **Challenge Detection**: CAPTCHA, Cloudflare, MFA, login pages → `NEEDS_HUMAN`
- **Submission**: Click submit → wait for success confirmation → screenshot

### 7.3 Lever / Ashby Providers
- Scaffolded with `canHandle` detection
- `fill`/`submit` return "Not implemented" (TODO)

---

## 8. Application Tracking & Timeline

### 8.1 Status Machine
```
Job: DISCOVERED → FILTERED → ANALYZED → READY_FOR_REVIEW
App: READY_FOR_REVIEW → APPROVED → PREPARING → APPLYING → SUBMITTED
       ↓ (reject) → REJECTED
       ↓ (needs human) → NEEDS_HUMAN
       ↓ (post-submit) → ASSESSMENT → INTERVIEW → OFFER
                          ↓ → REJECTED
                          ↓ → WITHDRAWN
```

### 8.2 Timeline UI (`ApplicationTimeline.tsx`)
- Visual progress bar showing completed steps
- Chronological event list with icons
- Status transitions shown as old → new badges
- Metadata: reason, checked_at, confidence

---

## 9. Email Status Integration (`email.ts`)

### 9.1 IMAP Ingestion
- Connects via IMAP (Gmail, Outlook, etc.)
- Fetches UNSEEN emails from configured mailbox
- Runs every 15 minutes via `email-ingestion` pg-boss job

### 9.2 AI Classification
**Prompt**: Classify email as `rejection`, `assessment`, `interview`, `confirmation`, or `other`
**Extracts**: Company name, role title, details, confidence
**Human Review**: Required if confidence < 80

### 9.3 Auto Status Update
1. Match email to pending application (company name + role title)
2. Map classification → ApplicationStatus:
   - `rejection` → `rejected`
   - `assessment` → `assessment`
   - `interview` → `interview`
   - `confirmation` → `submitted`
3. Update application + log `application_events` with `source: 'email'`

---

## 10. Dashboard (`dashboard/page.tsx`)

**Server Component** fetching real-time stats:
- Jobs discovered today
- Relevant jobs (analyzed, fit_score ≥ 60)
- Ready for review count
- Applications submitted
- Interviews
- Failed

**Recent Activity**: Last 10 system runs with status, processed/failed counts

---

## 11. Data Flow Summary

```
┌─────────────┐
│  Sources    │  (Greenhouse, Lever, Ashby configs)
└──────┬──────┘
       ▼
┌─────────────┐     ┌─────────────┐
│  Ingestion  │────▶│  Jobs DB    │  (discovered)
│  (2hr)      │     │             │
└─────────────┘     └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │  Filtering  │  (30min) - hard filters
                    │  (filter)   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   AI Analysis│ (15min) - Gemini
                    │  (analyze)  │  + embeddings
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │ Resume Tailor│ (on-demand)
                    │ (tailor)    │  + PDF generation
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │ App Prep    │ (on-demand)
                    │ (answers)   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │ Review Queue│ (human)
                    │ (approve)   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │ Browser Auto│ (submit)
                    │ (apply)     │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │ Track/Email │ (status sync)
                    └─────────────┘
```

---

## 12. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Deterministic first, AI second** | Ingestion, filtering, dedup, DB ops = code; Only classification/generation = AI |
| **Verified bullet bank** | No hallucination: every bullet traces to experience/project |
| **pg-boss for queue** | No Redis dependency; PostgreSQL is already required |
| **pgvector in same DB** | Single infrastructure (Neon); no separate vector DB |
| **Structured AI output** | Zod schemas enforce valid JSON; no parsing errors |
| **Two resume tracks** | AI-SWE vs SWE require different skill emphasis |
| **Human approval required** | Safety: never auto-submit without review |
| **Content hashing** | Cache AI results; skip unchanged jobs |
| **Event sourcing** | Every state change logged for audit/timeline |