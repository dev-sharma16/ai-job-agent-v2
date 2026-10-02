# Resume Tailoring and Application Package

## 1. Resume strategy

Maintain two base tracks:

```text
AI-SWE
SWE
```

Do not maintain two unrelated truth sets.

Use:

```text
verified profile
verified experience
verified projects
verified bullets
        ↓
track-specific template
        ↓
job-specific selection/reordering
```

## 2. Base resume templates

Store templates:

```text
data/resumes/ai-swe/template.md
data/resumes/swe/template.md
```

The final PDF is generated from structured resume content, not from arbitrary LLM-generated Markdown.

Recommended structured model:

```ts
interface ResumeContent {
  header: ...
  summary: string
  experience: ExperienceSection[]
  projects: ProjectSection[]
  skills: SkillSection[]
  education: EducationSection[]
  certifications: CertificationSection[]
}
```

## 3. Verified bullet bank

Every selectable bullet must have:

```ts
interface VerifiedBullet {
  id: string;
  text: string;
  skills: string[];
  tracks: ('ai_swe' | 'swe')[];
  sourceReference: string;
  verified: boolean;
}
```

The AI may select and rewrite only these facts.

## 4. Resume tailoring graph

Use a LangGraph workflow:

```text
START
  ↓
loadJob
  ↓
loadProfile
  ↓
selectTrack
  ↓
retrieveRelevantBullets
  ↓
selectBullets
  ↓
generateSummary
  ↓
assembleResume
  ↓
validateClaims
  ↓
renderPDF
  ↓
END
```

If validation fails:

```text
validateClaims
      ↓
invalid
      ↓
remove/rewrite unsupported claim
      ↓
validate again
```

Maximum revision count: 2-3.

If still invalid:

```text
NEEDS_HUMAN
```

## 5. Summary generation

The summary can change per job.

Allowed:

```text
emphasize TypeScript because JD requires TypeScript
emphasize backend because JD is backend-heavy
emphasize RAG because JD is AI-focused
```

Not allowed:

```text
claim professional Python experience if not verified
claim Kubernetes experience if not verified
claim 5 years of experience if not verified
```

## 6. Skills section

Use verified skills only.

For a SWE job:

```text
Languages
TypeScript, JavaScript

Frontend
React, Next.js

Backend
Node.js, Express.js, REST APIs

Databases
PostgreSQL, MongoDB, Redis

AI
RAG, LLM APIs, AI Agents
```

For an AI-SWE job, AI can move earlier.

Do not add a keyword just because the JD contains it.

## 7. Resume rendering

Use a stable HTML/CSS template.

Pipeline:

```text
ResumeContent
   ↓
React/HTML template
   ↓
Playwright Chromium
   ↓
PDF
```

Ensure:

- one/two page target depending on content
- no orphan headings
- consistent spacing
- ATS-readable text
- no important information embedded only in images
- selectable text
- standard section headings

## 8. Application answers

Supported answer sources:

```text
profile
experience
projects
verified bullets
job description
selected resume
```

Answer categories:

- Why this role?
- Why this company?
- Relevant experience?
- Notice period?
- Salary expectations?
- Work authorization?
- Technical experience?
- Project questions?

For factual questions, answer only from verified data.

For subjective questions, generate a concise answer grounded in the JD and verified experience.

## 9. Unknown questions

If confidence is insufficient:

```json
{
  "requiresHuman": true,
  "reason": "No verified information available"
}
```

Do not guess.

## 10. Cover note

Generate a short, role-specific note.

Rules:

- 80-150 words
- mention relevant experience
- mention one relevant project/skill
- avoid generic praise
- never claim something unsupported
- no fabricated company research

## 11. Application package

Create:

```text
ApplicationPackage {
  job
  resume
  coverNote
  answers[]
  metadata
}
```

Persist the exact version used.

## 12. Versioning

Every generated resume receives:

```text
track
version
jobId
promptVersion
contentHash
createdAt
```

The system must always know exactly which resume was submitted.

## 13. Review screen

Show:

```text
Job
Company
Fit information
Resume track
Generated resume
Cover note
Application answers
Unknown/unresolved fields
```

Buttons:

```text
Approve & Continue
Reject
Edit
Regenerate
Mark Needs Human
```

Approval must be explicit.
