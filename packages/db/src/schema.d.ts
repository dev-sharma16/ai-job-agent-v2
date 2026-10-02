export declare const sourceTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['greenhouse', 'lever', 'ashby', 'email', 'manual']
>;
export declare const jobStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  ['discovered', 'filtered', 'analyzed', 'ready_for_review']
>;
export declare const applicationStatusEnum: import('drizzle-orm/pg-core').PgEnum<
  [
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
  ]
>;
export declare const resumeTrackEnum: import('drizzle-orm/pg-core').PgEnum<['ai_swe', 'swe']>;
export declare const remoteTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['remote', 'hybrid', 'onsite']
>;
export declare const employmentTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  ['full_time', 'part_time', 'contract', 'internship']
>;
export declare const applicationEventTypeEnum: import('drizzle-orm/pg-core').PgEnum<
  [
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
    'STATUS_CHANGED',
  ]
>;
export declare const sources: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'sources';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'sources';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'name';
        tableName: 'sources';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    type: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'type';
        tableName: 'sources';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'greenhouse' | 'lever' | 'ashby' | 'email' | 'manual';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['greenhouse', 'lever', 'ashby', 'email', 'manual'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    baseUrl: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'base_url';
        tableName: 'sources';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    configJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'config_json';
        tableName: 'sources';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    enabled: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'enabled';
        tableName: 'sources';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    lastRunAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'last_run_at';
        tableName: 'sources';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'sources';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'sources';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const companies: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'companies';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'companies';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'name';
        tableName: 'companies';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    slug: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'slug';
        tableName: 'companies';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    website: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'website';
        tableName: 'companies';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    atsType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'ats_type';
        tableName: 'companies';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    atsIdentifier: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'ats_identifier';
        tableName: 'companies';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    enabled: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'enabled';
        tableName: 'companies';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    blocked: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'blocked';
        tableName: 'companies';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'companies';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'companies';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const jobs: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'jobs';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    companyId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'company_id';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    sourceId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'source_id';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    externalId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'external_id';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    title: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'title';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    normalizedTitle: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'normalized_title';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    description: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'description';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    location: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'location';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    locationsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'locations_json';
        tableName: 'jobs';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: false;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    remoteType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'remote_type';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'remote' | 'hybrid' | 'onsite';
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['remote', 'hybrid', 'onsite'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    employmentType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'employment_type';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'full_time' | 'part_time' | 'contract' | 'internship';
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['full_time', 'part_time', 'contract', 'internship'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    url: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'url';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    applicationUrl: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'application_url';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    postedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'posted_at';
        tableName: 'jobs';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    discoveredAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'discovered_at';
        tableName: 'jobs';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    contentHash: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'content_hash';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    status: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'status';
        tableName: 'jobs';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'discovered' | 'filtered' | 'analyzed' | 'ready_for_review';
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['discovered', 'filtered', 'analyzed', 'ready_for_review'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    rawJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'raw_json';
        tableName: 'jobs';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'jobs';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'jobs';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const jobAnalysis: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'job_analysis';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    jobId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'job_id';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    track: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'track';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'ai_swe' | 'swe';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['ai_swe', 'swe'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    fitScore: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'fit_score';
        tableName: 'job_analysis';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    experienceRequired: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'experience_required';
        tableName: 'job_analysis';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    seniority: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'seniority';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    employmentType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'employment_type';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'full_time' | 'part_time' | 'contract' | 'internship';
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['full_time', 'part_time', 'contract', 'internship'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    requiredSkillsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'required_skills_json';
        tableName: 'job_analysis';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    preferredSkillsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'preferred_skills_json';
        tableName: 'job_analysis';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    matchedSkillsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'matched_skills_json';
        tableName: 'job_analysis';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    missingSkillsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'missing_skills_json';
        tableName: 'job_analysis';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    concernsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'concerns_json';
        tableName: 'job_analysis';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    reasoning: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'reasoning';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    model: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'model';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    promptVersion: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'prompt_version';
        tableName: 'job_analysis';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'job_analysis';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const jobEmbeddings: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'job_embeddings';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'job_embeddings';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    jobId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'job_id';
        tableName: 'job_embeddings';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    embedding: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'embedding';
        tableName: 'job_embeddings';
        dataType: 'array';
        columnType: 'PgVector';
        data: number[];
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    model: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'model';
        tableName: 'job_embeddings';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    contentHash: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'content_hash';
        tableName: 'job_embeddings';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'job_embeddings';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const profile: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'profile';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'name';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    email: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'email';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    phone: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'phone';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    location: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'location';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    linkedinUrl: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'linkedin_url';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    githubUrl: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'github_url';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    portfolioUrl: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'portfolio_url';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    noticePeriod: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'notice_period';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    workAuthorization: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'work_authorization';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    expectedSalary: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'expected_salary';
        tableName: 'profile';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    otherVerifiedDataJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'other_verified_data_json';
        tableName: 'profile';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: false;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'profile';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const experienceEntries: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'experience_entries';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'experience_entries';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    company: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'company';
        tableName: 'experience_entries';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    role: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'role';
        tableName: 'experience_entries';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    employmentType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'employment_type';
        tableName: 'experience_entries';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'full_time' | 'part_time' | 'contract' | 'internship';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['full_time', 'part_time', 'contract', 'internship'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    startDate: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'start_date';
        tableName: 'experience_entries';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    endDate: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'end_date';
        tableName: 'experience_entries';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    location: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'location';
        tableName: 'experience_entries';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    description: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'description';
        tableName: 'experience_entries';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    verified: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'verified';
        tableName: 'experience_entries';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'experience_entries';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'experience_entries';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const verifiedBullets: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'verified_bullets';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'verified_bullets';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    experienceId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'experience_id';
        tableName: 'verified_bullets';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    projectId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'project_id';
        tableName: 'verified_bullets';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    text: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'text';
        tableName: 'verified_bullets';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    trackTagsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'track_tags_json';
        tableName: 'verified_bullets';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    skillTagsJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'skill_tags_json';
        tableName: 'verified_bullets';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    sourceReference: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'source_reference';
        tableName: 'verified_bullets';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    verified: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'verified';
        tableName: 'verified_bullets';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    embedding: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'embedding';
        tableName: 'verified_bullets';
        dataType: 'array';
        columnType: 'PgVector';
        data: number[];
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'verified_bullets';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'verified_bullets';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const projects: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'projects';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'projects';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'name';
        tableName: 'projects';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    description: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'description';
        tableName: 'projects';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    technologiesJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'technologies_json';
        tableName: 'projects';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    verified: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'verified';
        tableName: 'projects';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'projects';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'projects';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const resumes: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'resumes';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'resumes';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    track: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'track';
        tableName: 'resumes';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data: 'ai_swe' | 'swe';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: ['ai_swe', 'swe'];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    version: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'version';
        tableName: 'resumes';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    name: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'name';
        tableName: 'resumes';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    templateName: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'template_name';
        tableName: 'resumes';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    contentJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'content_json';
        tableName: 'resumes';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    pdfPath: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'pdf_path';
        tableName: 'resumes';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    contentHash: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'content_hash';
        tableName: 'resumes';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'resumes';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const applications: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'applications';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    jobId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'job_id';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    resumeId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'resume_id';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    status: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'status';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data:
          | 'discovered'
          | 'filtered'
          | 'analyzed'
          | 'ready_for_review'
          | 'approved'
          | 'preparing'
          | 'applying'
          | 'submitted'
          | 'needs_human'
          | 'rejected'
          | 'assessment'
          | 'interview'
          | 'offer'
          | 'withdrawn'
          | 'failed';
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [
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
        ];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    applicationUrl: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'application_url';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    coverNote: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'cover_note';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    answersJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'answers_json';
        tableName: 'applications';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    browserProvider: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'browser_provider';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    submittedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'submitted_at';
        tableName: 'applications';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    rejectionAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'rejection_at';
        tableName: 'applications';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    lastCheckedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'last_checked_at';
        tableName: 'applications';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    notes: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'notes';
        tableName: 'applications';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'applications';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    updatedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'updated_at';
        tableName: 'applications';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const applicationEvents: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'application_events';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'application_events';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    applicationId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'application_id';
        tableName: 'application_events';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    eventType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'event_type';
        tableName: 'application_events';
        dataType: 'string';
        columnType: 'PgEnumColumn';
        data:
          | 'DISCOVERED'
          | 'FILTERED'
          | 'ANALYZED'
          | 'RESUME_SELECTED'
          | 'RESUME_GENERATED'
          | 'ANSWER_GENERATED'
          | 'READY_FOR_REVIEW'
          | 'APPROVED'
          | 'APPLICATION_STARTED'
          | 'FORM_FILLED'
          | 'SUBMITTED'
          | 'FAILED'
          | 'NEEDS_HUMAN'
          | 'STATUS_CHANGED';
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [
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
          'STATUS_CHANGED',
        ];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    metadataJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'metadata_json';
        tableName: 'application_events';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'application_events';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const browserSessions: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'browser_sessions';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'browser_sessions';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    provider: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'provider';
        tableName: 'browser_sessions';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    storageStatePath: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'storage_state_path';
        tableName: 'browser_sessions';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    lastUsedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'last_used_at';
        tableName: 'browser_sessions';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    status: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'status';
        tableName: 'browser_sessions';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'browser_sessions';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const applicationQuestions: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'application_questions';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'application_questions';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    applicationId: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'application_id';
        tableName: 'application_questions';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    question: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'question';
        tableName: 'application_questions';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    fieldType: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'field_type';
        tableName: 'application_questions';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    answer: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'answer';
        tableName: 'application_questions';
        dataType: 'string';
        columnType: 'PgText';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    answerSource: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'answer_source';
        tableName: 'application_questions';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    confidence: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'confidence';
        tableName: 'application_questions';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    requiresHuman: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'requires_human';
        tableName: 'application_questions';
        dataType: 'boolean';
        columnType: 'PgBoolean';
        data: boolean;
        driverParam: boolean;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    createdAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'created_at';
        tableName: 'application_questions';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
export declare const systemRuns: import('drizzle-orm/pg-core').PgTableWithColumns<{
  name: 'system_runs';
  schema: undefined;
  columns: {
    id: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'id';
        tableName: 'system_runs';
        dataType: 'string';
        columnType: 'PgUUID';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: true;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    type: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'type';
        tableName: 'system_runs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    status: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'status';
        tableName: 'system_runs';
        dataType: 'string';
        columnType: 'PgVarchar';
        data: string;
        driverParam: string;
        notNull: true;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: [string, ...string[]];
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    startedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'started_at';
        tableName: 'system_runs';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: true;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    finishedAt: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'finished_at';
        tableName: 'system_runs';
        dataType: 'date';
        columnType: 'PgTimestamp';
        data: Date;
        driverParam: string;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    itemsProcessed: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'items_processed';
        tableName: 'system_runs';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: false;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    itemsFailed: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'items_failed';
        tableName: 'system_runs';
        dataType: 'number';
        columnType: 'PgInteger';
        data: number;
        driverParam: string | number;
        notNull: false;
        hasDefault: true;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
    errorJson: import('drizzle-orm/pg-core').PgColumn<
      {
        name: 'error_json';
        tableName: 'system_runs';
        dataType: 'json';
        columnType: 'PgJsonb';
        data: unknown;
        driverParam: unknown;
        notNull: false;
        hasDefault: false;
        isPrimaryKey: false;
        isAutoincrement: false;
        hasRuntimeDefault: false;
        enumValues: undefined;
        baseColumn: never;
        generated: undefined;
      },
      {},
      {}
    >;
  };
  dialect: 'pg';
}>;
//# sourceMappingURL=schema.d.ts.map
