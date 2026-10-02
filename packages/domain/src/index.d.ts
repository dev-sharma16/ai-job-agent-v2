export declare enum SourceType {
  GREENHOUSE = 'greenhouse',
  LEVER = 'lever',
  ASHBY = 'ashby',
  EMAIL = 'email',
  MANUAL = 'manual',
}
export declare enum JobStatus {
  DISCOVERED = 'discovered',
  FILTERED = 'filtered',
  ANALYZED = 'analyzed',
  READY_FOR_REVIEW = 'ready_for_review',
}
export declare enum ApplicationStatus {
  DISCOVERED = 'discovered',
  FILTERED = 'filtered',
  ANALYZED = 'analyzed',
  READY_FOR_REVIEW = 'ready_for_review',
  APPROVED = 'approved',
  PREPARING = 'preparing',
  APPLYING = 'applying',
  SUBMITTED = 'submitted',
  NEEDS_HUMAN = 'needs_human',
  REJECTED = 'rejected',
  ASSESSMENT = 'assessment',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  WITHDRAWN = 'withdrawn',
  FAILED = 'failed',
}
export declare enum ResumeTrack {
  AI_SWE = 'ai_swe',
  SWE = 'swe',
}
export declare enum RemoteType {
  REMOTE = 'remote',
  HYBRID = 'hybrid',
  ONSITE = 'onsite',
}
export declare enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}
export declare enum ApplicationEventType {
  DISCOVERED = 'DISCOVERED',
  FILTERED = 'FILTERED',
  ANALYZED = 'ANALYZED',
  RESUME_SELECTED = 'RESUME_SELECTED',
  RESUME_GENERATED = 'RESUME_GENERATED',
  ANSWER_GENERATED = 'ANSWER_GENERATED',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  APPROVED = 'APPROVED',
  APPLICATION_STARTED = 'APPLICATION_STARTED',
  FORM_FILLED = 'FORM_FILLED',
  SUBMITTED = 'SUBMITTED',
  FAILED = 'FAILED',
  NEEDS_HUMAN = 'NEEDS_HUMAN',
  STATUS_CHANGED = 'STATUS_CHANGED',
}
export interface RawJob {
  externalId: string;
  companyName: string;
  title: string;
  description: string;
  location?: string;
  locations?: string[];
  remoteType?: RemoteType;
  employmentType?: EmploymentType;
  url: string;
  applicationUrl?: string;
  postedAt?: Date;
  raw: unknown;
}
export interface VerifiedBullet {
  id: string;
  text: string;
  skills: string[];
  tracks: ResumeTrack[];
  sourceReference: string;
  verified: boolean;
}
export interface JobFilterPolicy {
  allowedTracks: ResumeTrack[];
  maxExperienceYears: number;
  allowedLocations: string[];
  allowRemote: boolean;
  excludedTitleTerms: string[];
  blockedCompanies: string[];
  excludedEmploymentTypes: EmploymentType[];
}
export interface ApplicationFormField {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  nearbyText?: string;
}
export interface ApplicationForm {
  fields: ApplicationFormField[];
  url: string;
}
export type FieldType =
  | 'NAME'
  | 'EMAIL'
  | 'PHONE'
  | 'LOCATION'
  | 'LINKEDIN'
  | 'GITHUB'
  | 'PORTFOLIO'
  | 'RESUME'
  | 'COVER_LETTER'
  | 'WORK_AUTHORIZATION'
  | 'NOTICE_PERIOD'
  | 'SALARY'
  | 'CUSTOM';
export interface FillResult {
  filledFields: string[];
  unfilledFields: ApplicationFormField[];
  errors: string[];
}
export interface SubmitResult {
  success: boolean;
  confirmationId?: string;
  error?: string;
  screenshotPath?: string;
}
export interface ApplicationProvider {
  canHandle(url: string): boolean;
  inspect(page: unknown): Promise<ApplicationForm>;
  fill(page: unknown, application: ApplicationPackage): Promise<FillResult>;
  submit(page: unknown): Promise<SubmitResult>;
}
export interface ApplicationPackage {
  job: {
    id: string;
    title: string;
    company: string;
    url: string;
    applicationUrl: string;
  };
  resume: {
    id: string;
    track: ResumeTrack;
    pdfPath: string;
    contentHash: string;
  };
  coverNote: string;
  answers: ApplicationAnswer[];
  metadata: Record<string, unknown>;
}
export interface ApplicationAnswer {
  question: string;
  fieldType: FieldType;
  answer: string;
  answerSource: string;
  confidence: number;
  requiresHuman: boolean;
}
//# sourceMappingURL=index.d.ts.map
