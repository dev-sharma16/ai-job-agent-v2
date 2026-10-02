import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  jsonb,
  integer,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { vector } from 'drizzle-orm/pg-core';

export const sourceTypeEnum = pgEnum('source_type', [
  'greenhouse',
  'lever',
  'ashby',
  'email',
  'manual',
]);
export const jobStatusEnum = pgEnum('job_status', [
  'discovered',
  'filtered',
  'analyzed',
  'ready_for_review',
]);
export const applicationStatusEnum = pgEnum('application_status', [
  'discovered',
  'filtered',
  'analyzed',
  'ready_for_review',
  'approved',
  'preparing',
  'applying',
  'submitted',
  'needs_human',
  'rejected',
  'assessment',
  'interview',
  'offer',
  'withdrawn',
  'failed',
]);
export const resumeTrackEnum = pgEnum('resume_track', ['ai_swe', 'swe']);
export const remoteTypeEnum = pgEnum('remote_type', ['remote', 'hybrid', 'onsite']);
export const employmentTypeEnum = pgEnum('employment_type', [
  'full_time',
  'part_time',
  'contract',
  'internship',
]);
export const applicationEventTypeEnum = pgEnum('application_event_type', [
  'DISCOVERED',
  'FILTERED',
  'ANALYZED',
  'RESUME_SELECTED',
  'RESUME_GENERATED',
  'ANSWER_GENERATED',
  'READY_FOR_REVIEW',
  'APPROVED',
  'APPLICATION_STARTED',
  'FORM_FILLED',
  'SUBMITTED',
  'FAILED',
  'NEEDS_HUMAN',
  'REJECTED',
  'STATUS_CHANGED',
]);

export const sources = pgTable(
  'sources',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    type: sourceTypeEnum('type').notNull(),
    baseUrl: text('base_url'),
    configJson: jsonb('config_json').notNull().default({}),
    enabled: boolean('enabled').default(true).notNull(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index('sources_name_idx').on(table.name),
  })
);

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    website: text('website'),
    atsType: varchar('ats_type', { length: 50 }),
    atsIdentifier: varchar('ats_identifier', { length: 255 }),
    enabled: boolean('enabled').default(true).notNull(),
    blocked: boolean('blocked').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('companies_slug_idx').on(table.slug),
  })
);

export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    companyId: uuid('company_id')
      .references(() => companies.id)
      .notNull(),
    sourceId: uuid('source_id')
      .references(() => sources.id)
      .notNull(),
    externalId: varchar('external_id', { length: 255 }).notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    normalizedTitle: varchar('normalized_title', { length: 500 }),
    description: text('description').notNull(),
    location: varchar('location', { length: 500 }),
    locationsJson: jsonb('locations_json').default([]),
    remoteType: remoteTypeEnum('remote_type'),
    employmentType: employmentTypeEnum('employment_type'),
    url: text('url').notNull(),
    applicationUrl: text('application_url'),
    postedAt: timestamp('posted_at', { withTimezone: true }),
    discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow().notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    status: jobStatusEnum('status').default('discovered').notNull(),
    rawJson: jsonb('raw_json').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sourceExternalIdx: uniqueIndex('jobs_source_external_idx').on(table.sourceId, table.externalId),
    companyIdx: index('jobs_company_idx').on(table.companyId),
    sourceIdx: index('jobs_source_idx').on(table.sourceId),
    postedAtIdx: index('jobs_posted_at_idx').on(table.postedAt),
    statusIdx: index('jobs_status_idx').on(table.status),
    normalizedTitleIdx: index('jobs_normalized_title_idx').on(table.normalizedTitle),
    contentHashIdx: index('jobs_content_hash_idx').on(table.contentHash),
  })
);

export const jobAnalysis = pgTable(
  'job_analysis',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    jobId: uuid('job_id')
      .references(() => jobs.id, { onDelete: 'cascade' })
      .notNull(),
    track: resumeTrackEnum('track').notNull(),
    fitScore: integer('fit_score').notNull(),
    experienceRequired: integer('experience_required'),
    seniority: varchar('seniority', { length: 100 }),
    employmentType: employmentTypeEnum('employment_type'),
    requiredSkillsJson: jsonb('required_skills_json').notNull().default([]),
    preferredSkillsJson: jsonb('preferred_skills_json').notNull().default([]),
    matchedSkillsJson: jsonb('matched_skills_json').notNull().default([]),
    missingSkillsJson: jsonb('missing_skills_json').notNull().default([]),
    concernsJson: jsonb('concerns_json').notNull().default([]),
    reasoning: text('reasoning'),
    model: varchar('model', { length: 100 }).notNull(),
    promptVersion: varchar('prompt_version', { length: 50 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    jobIdx: index('job_analysis_job_idx').on(table.jobId),
    trackIdx: index('job_analysis_track_idx').on(table.track),
    fitScoreIdx: index('job_analysis_fit_score_idx').on(table.fitScore),
  })
);

export const jobEmbeddings = pgTable('job_embeddings', {
  id: uuid('id').defaultRandom().primaryKey(),
  jobId: uuid('job_id')
    .references(() => jobs.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  embedding: vector('embedding', { dimensions: 768 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  contentHash: varchar('content_hash', { length: 64 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const profile = pgTable('profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  location: varchar('location', { length: 255 }),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  noticePeriod: varchar('notice_period', { length: 100 }),
  workAuthorization: varchar('work_authorization', { length: 255 }),
  expectedSalary: varchar('expected_salary', { length: 100 }),
  otherVerifiedDataJson: jsonb('other_verified_data_json').default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const experienceEntries = pgTable('experience_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  company: varchar('company', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  employmentType: employmentTypeEnum('employment_type').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  location: varchar('location', { length: 255 }),
  description: text('description'),
  verified: boolean('verified').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const verifiedBullets = pgTable('verified_bullets', {
  id: uuid('id').defaultRandom().primaryKey(),
  experienceId: uuid('experience_id').references(() => experienceEntries.id, {
    onDelete: 'set null',
  }),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  text: text('text').notNull(),
  trackTagsJson: jsonb('track_tags_json').notNull().default([]),
  skillTagsJson: jsonb('skill_tags_json').notNull().default([]),
  sourceReference: varchar('source_reference', { length: 500 }).notNull(),
  verified: boolean('verified').default(true).notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  technologiesJson: jsonb('technologies_json').notNull().default([]),
  verified: boolean('verified').default(true).notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const resumes = pgTable(
  'resumes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    track: resumeTrackEnum('track').notNull(),
    version: integer('version').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    templateName: varchar('template_name', { length: 100 }).notNull(),
    contentJson: jsonb('content_json').notNull(),
    pdfPath: text('pdf_path'),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    trackVersionIdx: uniqueIndex('resumes_track_version_idx').on(table.track, table.version),
    trackIdx: index('resumes_track_idx').on(table.track),
  })
);

export const applications = pgTable(
  'applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    jobId: uuid('job_id')
      .references(() => jobs.id, { onDelete: 'cascade' })
      .notNull(),
    resumeId: uuid('resume_id')
      .references(() => resumes.id)
      .notNull(),
    status: applicationStatusEnum('status').default('ready_for_review').notNull(),
    applicationUrl: text('application_url'),
    coverNote: text('cover_note'),
    answersJson: jsonb('answers_json').notNull().default([]),
    browserProvider: varchar('browser_provider', { length: 50 }),
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    rejectionAt: timestamp('rejection_at', { withTimezone: true }),
    lastCheckedAt: timestamp('last_checked_at', { withTimezone: true }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    jobIdx: index('applications_job_idx').on(table.jobId),
    resumeIdx: index('applications_resume_idx').on(table.resumeId),
    statusIdx: index('applications_status_idx').on(table.status),
    createdAtIdx: index('applications_created_at_idx').on(table.createdAt),
  })
);

export const applicationEvents = pgTable(
  'application_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    applicationId: uuid('application_id')
      .references(() => applications.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: applicationEventTypeEnum('event_type').notNull(),
    metadataJson: jsonb('metadata_json').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    applicationIdx: index('application_events_application_idx').on(table.applicationId),
  })
);

export const browserSessions = pgTable('browser_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull(),
  storageStatePath: text('storage_state_path').notNull(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }).defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('active').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const applicationQuestions = pgTable(
  'application_questions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    applicationId: uuid('application_id')
      .references(() => applications.id, { onDelete: 'cascade' })
      .notNull(),
    question: text('question').notNull(),
    fieldType: varchar('field_type', { length: 50 }).notNull(),
    answer: text('answer'),
    answerSource: varchar('answer_source', { length: 100 }),
    confidence: integer('confidence'),
    requiresHuman: boolean('requires_human').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    applicationIdx: index('application_questions_application_idx').on(table.applicationId),
  })
);

export const systemRuns = pgTable(
  'system_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: varchar('type', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    itemsProcessed: integer('items_processed').default(0),
    itemsFailed: integer('items_failed').default(0),
    errorJson: jsonb('error_json'),
  },
  (table) => ({
    typeIdx: index('system_runs_type_idx').on(table.type),
    statusIdx: index('system_runs_status_idx').on(table.status),
    startedAtIdx: index('system_runs_started_at_idx').on(table.startedAt),
  })
);
