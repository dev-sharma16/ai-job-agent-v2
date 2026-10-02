# Job Ingestion, Filtering, and AI Analysis

## 1. Source strategy

Implement adapters behind one interface:

```ts
interface JobSourceAdapter {
  type: SourceType;
  fetchJobs(config: SourceConfig): Promise<RawJob[]>;
}
```

Implement first:

1. Greenhouse
2. Lever
3. Ashby

Email ingestion can be added after the public ATS adapters.

Do not scrape websites that prohibit automated access when an official public feed/API or user-provided alert feed is available.

## 2. Greenhouse adapter

Create a company configuration containing the public board identifier.

Fetch published jobs through the public job board endpoint.

Map fields into the internal `RawJob` format.

Do not require an employer API key for public job postings.

## 3. Lever adapter

Create a company configuration containing the public postings identifier.

Fetch published postings and normalize them.

## 4. Ashby adapter

Use the public Job Posting API with the configured job-board name.

The adapter must support title, location, secondary locations, description, published date, job URL, and application URL when available.

## 5. Raw job interface

```ts
interface RawJob {
  externalId: string;
  companyName: string;
  title: string;
  description: string;
  location?: string;
  locations?: string[];
  remoteType?: string;
  employmentType?: string;
  url: string;
  applicationUrl?: string;
  postedAt?: Date;
  raw: unknown;
}
```

## 6. Normalization

Normalize:

- whitespace
- HTML
- Unicode
- job titles
- location strings
- remote labels
- dates
- company names

Preserve the original description.

Never mutate the source payload destructively.

## 7. Deduplication

Primary:

```text
source + externalId
```

Secondary:

```text
normalized company
+
normalized title
+
normalized application URL
```

Tertiary:

content hash of normalized job description.

Duplicate jobs should update the existing record rather than create another application opportunity.

## 8. Hard filters

Create a configurable `JobFilterPolicy`.

Example:

```ts
interface JobFilterPolicy {
  allowedTracks: string[];
  maxExperienceYears: number;
  allowedLocations: string[];
  allowRemote: boolean;
  excludedTitleTerms: string[];
  blockedCompanies: string[];
  excludedEmploymentTypes: string[];
}
```

Default title exclusions may include:

```text
senior
staff
lead
principal
manager
director
architect
```

These are configurable. Do not hardcode them as universal truth.

Experience parsing must support:

```text
0-2 years
1+ years
2 years
3+ years
freshers
entry level
junior
```

Ambiguous requirements should not automatically reject the job.

## 9. AI analysis

Use Gemini structured output.

Create:

```ts
const JobAnalysisSchema = z.object({
  track: z.enum(['ai_swe', 'swe', 'other']),
  seniority: z.string().nullable(),
  experienceRequired: z.number().nullable(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  aiRequirements: z.array(z.string()),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  concerns: z.array(z.string()),
  fitScore: z.number().min(0).max(100),
  explanation: z.string(),
});
```

The model should analyze the JD against the verified user profile.

Do not let the model invent missing information.

## 10. Track classification

AI-SWE signal terms include:

```text
LLM
GenAI
generative AI
RAG
retrieval augmented generation
agents
AI agents
LangChain
LangGraph
MCP
vector database
embeddings
prompt engineering
tool calling
AI applications
```

SWE signal terms include:

```text
full stack
backend
frontend
software engineer
web developer
Node.js
React
Next.js
TypeScript
JavaScript
REST API
PostgreSQL
MongoDB
AWS
```

Use semantic analysis, not only keyword matching.

## 11. Scoring

Fit score is an internal prioritization metric.

Suggested weighted components:

```text
Experience compatibility       25
Required skill match          30
Role/track compatibility      20
Location/remote compatibility 15
Preferred skills              10
```

Make weights configurable.

Never present the score as a probability of getting hired.

## 12. AI cost control

Do not call Gemini for every discovered job.

Pipeline:

```text
1000 discovered
      ↓
hard filters
      ↓
200 candidates
      ↓
AI analysis
      ↓
50 useful jobs
```

Cache analysis by:

```text
job content hash
+
prompt version
+
model
```

If unchanged, reuse the previous analysis.

## 13. Embedding search

Embed:

- normalized job descriptions
- verified bullets
- projects
- optionally the two base resumes

Use pgvector to retrieve relevant verified bullets.

Query:

```text
job embedding
      ↓
top K verified bullets
```

Then send only those bullets to Gemini for controlled selection.

## 14. Retry policy

For Gemini:

- exponential backoff
- retry transient 429/5xx errors
- maximum retry count
- jitter
- persistent failure → `FAILED` or queue retry

Never retry validation errors indefinitely.

## 15. Prompt versioning

Every AI operation must include:

```text
promptVersion
model
```

Store both with the result.

Prompt files should live in:

```text
packages/ai/prompts/
```

Do not bury long prompts inside route handlers.
