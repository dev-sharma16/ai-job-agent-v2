# Database Schemas Reference

This document explains all database tables, their columns, and which features they support.

---

## Core Tables

### `sources`
**Purpose**: Job source configuration (Greenhouse, Lever, Ashby, etc.)
**Used by**: Job ingestion pipeline

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Human-readable name (e.g., "Greenhouse") |
| `type` | ENUM | `greenhouse`, `lever`, `ashby`, `email`, `manual` |
| `base_url` | TEXT | Base API URL |
| `config_json` | JSONB | Source-specific config (board tokens, company names, etc.) |
| `enabled` | BOOLEAN | Whether source is active |
| `last_run_at` | TIMESTAMPTZ | Last successful ingestion time |

---

### `companies`
**Purpose**: Company registry linked to sources
**Used by**: Job ingestion, application tracking, dashboard

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Company name |
| `slug` | VARCHAR(255) | URL-friendly unique identifier |
| `website` | TEXT | Company website |
| `ats_type` | VARCHAR(50) | ATS type if known |
| `ats_identifier` | VARCHAR(255) | ATS-specific identifier (board token, etc.) |
| `enabled` | BOOLEAN | Whether to ingest from this company |
| `blocked` | BOOLEAN | Manually blocked company |

---

### `jobs`
**Purpose**: Normalized job postings from all sources
**Used by**: Ingestion, filtering, analysis, embeddings, dashboard, applications

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `company_id` | UUID | FK → companies |
| `source_id` | UUID | FK → sources |
| `external_id` | VARCHAR(255) | Source's original job ID |
| `title` | VARCHAR(500) | Original job title |
| `normalized_title` | VARCHAR(500) | Lowercased, cleaned title for deduplication |
| `description` | TEXT | Full job description (HTML preserved) |
| `location` | VARCHAR(500) | Primary location string |
| `locations_json` | JSONB | Array of all locations |
| `remote_type` | ENUM | `remote`, `hybrid`, `onsite` |
| `employment_type` | ENUM | `full_time`, `part_time`, `contract`, `internship` |
| `url` | TEXT | Job posting URL |
| `application_url` | TEXT | Apply URL (may differ from job URL) |
| `posted_at` | TIMESTAMPTZ | When job was posted |
| `discovered_at` | TIMESTAMPTZ | When we ingested it |
| `content_hash` | VARCHAR(64) | SHA-256 of normalized description for dedup |
| `status` | ENUM | `discovered`, `filtered`, `analyzed`, `ready_for_review` |
| `raw_json` | JSONB | Original source payload |

**Indexes**: `(source_id, external_id)` unique, company_id, source_id, posted_at, status, normalized_title, content_hash

---

### `job_analysis`
**Purpose**: Gemini AI analysis results for each job
**Used by**: Track selection, resume tailoring, dashboard, review queue

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `job_id` | UUID | FK → jobs (CASCADE) |
| `track` | ENUM | `ai_swe`, `swe` |
| `fit_score` | INTEGER | 0-100 prioritization score |
| `experience_required` | INTEGER | Years of experience parsed from JD |
| `seniority` | VARCHAR(100) | e.g., "Senior", "Staff", "Mid" |
| `employment_type` | ENUM | From JD |
| `required_skills_json` | JSONB | Explicitly required skills |
| `preferred_skills_json` | JSONB | Nice-to-have skills |
| `matched_skills_json` | JSONB | Skills matching user profile |
| `missing_skills_json` | JSONB | Skills user lacks |
| `concerns_json` | JSONB | Overqualification, visa, location issues |
| `reasoning` | TEXT | Gemini's explanation |
| `model` | VARCHAR(100) | Gemini model used |
| `prompt_version` | VARCHAR(50) | Prompt version for cache invalidation |

**Indexes**: job_id, track, fit_score

---

### `job_embeddings`
**Purpose**: pgvector embeddings for semantic search
**Used by**: Bullet/project retrieval for resume tailoring

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `job_id` | UUID | FK → jobs (CASCADE, unique) |
| `embedding` | VECTOR(768) | pgvector column (dimension matches embedding model) |
| `model` | VARCHAR(100) | Embedding model name |
| `content_hash` | VARCHAR(64) | Job content hash for cache invalidation |

---

## Profile & Resume Truth Tables

### `profile`
**Purpose**: Single source of truth for user identity
**Used by**: Resume generation, application answers, cover notes

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Full name |
| `email` | VARCHAR(255) | Email |
| `phone` | VARCHAR(50) | Phone |
| `location` | VARCHAR(255) | City, State |
| `linkedin_url` | TEXT | LinkedIn profile |
| `github_url` | TEXT | GitHub profile |
| `portfolio_url` | TEXT | Personal website |
| `notice_period` | VARCHAR(100) | e.g., "2 weeks" |
| `work_authorization` | VARCHAR(255) | e.g., "US Citizen" |
| `expected_salary` | VARCHAR(100) | e.g., "$180k-$220k" |
| `other_verified_data_json` | JSONB | Extensible additional fields |

---

### `experience_entries`
**Purpose**: Verified work history
**Used by**: Resume generation, application answers

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `company` | VARCHAR(255) | Company name |
| `role` | VARCHAR(255) | Job title |
| `employment_type` | ENUM | `full_time`, `part_time`, `contract`, `internship` |
| `start_date` | TIMESTAMPTZ | Start date |
| `end_date` | TIMESTAMPTZ | End date (NULL = present) |
| `location` | VARCHAR(255) | Job location |
| `description` | TEXT | Role description |
| `verified` | BOOLEAN | Human-verified flag |

---

### `verified_bullets`
**Purpose**: Atomic resume bullets traced to experience/projects
**Used by**: Resume tailoring (semantic retrieval), application answers

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `experience_id` | UUID | FK → experience_entries (nullable) |
| `project_id` | UUID | FK → projects (nullable) |
| `text` | TEXT | Bullet text |
| `track_tags_json` | JSONB | `['ai_swe']`, `['swe']`, or both |
| `skill_tags_json` | JSONB | Skills demonstrated |
| `source_reference` | VARCHAR(500) | Human-readable source (e.g., "TechCorp - Senior AI Engineer") |
| `verified` | BOOLEAN | Human-verified |
| `embedding` | VECTOR(768) | For semantic retrieval |

---

### `projects`
**Purpose**: Verified project portfolio
**Used by**: Resume generation, bullet retrieval

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Project name |
| `description` | TEXT | Project description |
| `technologies_json` | JSONB | Tech stack array |
| `verified` | BOOLEAN | Human-verified |
| `embedding` | VECTOR(768) | For semantic retrieval |

---

### `resumes`
**Purpose**: Versioned generated resumes per track
**Used by**: Review queue, application submission, audit trail

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `track` | ENUM | `ai_swe`, `swe` |
| `version` | INTEGER | Incrementing version per track |
| `name` | VARCHAR(255) | e.g., "Tailored for job abc-123" |
| `template_name` | VARCHAR(100) | Template identifier |
| `content_json` | JSONB | Full structured resume content |
| `pdf_path` | TEXT | Local/path to generated PDF |
| `content_hash` | VARCHAR(64) | SHA-256 of content_json |

**Unique Index**: `(track, version)`

---

## Application Tables

### `applications`
**Purpose**: End-to-end application lifecycle tracking
**Used by**: Review queue, dashboard, status tracking, browser automation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `job_id` | UUID | FK → jobs (CASCADE) |
| `resume_id` | UUID | FK → resumes |
| `status` | ENUM | See ApplicationStatus enum (15 values) |
| `application_url` | TEXT | URL where applied |
| `cover_note` | TEXT | Generated cover note |
| `answers_json` | JSONB | Generated Q&A pairs |
| `browser_provider` | VARCHAR(50) | `greenhouse`, `lever`, `ashby` |
| `submitted_at` | TIMESTAMPTZ | When submitted |
| `rejection_at` | TIMESTAMPTZ | When rejected |
| `last_checked_at` | TIMESTAMPTZ | Last status check |
| `notes` | TEXT | Human notes |

**Indexes**: job_id, resume_id, status, created_at

---

### `application_events`
**Purpose**: Immutable audit log of all state transitions
**Used by**: Timeline UI, debugging, analytics

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `application_id` | UUID | FK → applications (CASCADE) |
| `event_type` | ENUM | `DISCOVERED`, `FILTERED`, `ANALYZED`, `RESUME_SELECTED`, `RESUME_GENERATED`, `ANSWER_GENERATED`, `READY_FOR_REVIEW`, `APPROVED`, `APPLICATION_STARTED`, `FORM_FILLED`, `SUBMITTED`, `FAILED`, `NEEDS_HUMAN`, `REJECTED`, `STATUS_CHANGED` |
| `metadata_json` | JSONB | Transition details (old/new status, reason, etc.) |

---

### `application_questions`
**Purpose**: Per-application custom questions and answers
**Used by**: Browser automation, review queue

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `application_id` | UUID | FK → applications (CASCADE) |
| `question` | TEXT | Question text |
| `field_type` | VARCHAR(50) | Normalized field type |
| `answer` | TEXT | Generated answer |
| `answer_source` | VARCHAR(100) | Where answer came from |
| `confidence` | INTEGER | 0-100 confidence |
| `requires_human` | BOOLEAN | Needs human review |

---

## System Tables

### `browser_sessions`
**Purpose**: Persistent Playwright browser profiles
**Used by**: Browser automation

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `provider` | VARCHAR(50) | `greenhouse`, `lever`, `ashby` |
| `storage_state_path` | TEXT | Path to Playwright storage state |
| `last_used_at` | TIMESTAMPTZ | Last usage |
| `status` | VARCHAR(50) | `active`, `expired`, `error` |

---

### `system_runs`
**Purpose**: Worker job execution logs
**Used by**: Dashboard, monitoring, debugging

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `type` | VARCHAR(50) | Job type (e.g., `discover-jobs`, `analyze-jobs`) |
| `status` | VARCHAR(50) | `running`, `completed`, `failed` |
| `started_at` | TIMESTAMPTZ | Start time |
| `finished_at` | TIMESTAMPTZ | End time |
| `items_processed` | INTEGER | Count processed |
| `items_failed` | INTEGER | Count failed |
| `error_json` | JSONB | Error details if failed |

**Indexes**: type, status, started_at