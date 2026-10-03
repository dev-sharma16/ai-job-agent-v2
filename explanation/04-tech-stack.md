# Tech Stack & Design Decisions

This document explains every technology choice, why it was selected, and how it fits into the architecture.

---

## Core Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Package Manager** | pnpm | 9.x | Fast, disk-efficient monorepo management |
| **Language** | TypeScript | 5.5+ | Type safety across monorepo |
| **Runtime** | Node.js | 20+ | LTS, native fetch, crypto.subtle |

---

## Frontend (Web Dashboard)

| Technology | Version | Why |
|------------|---------|-----|
| **Next.js** | 14.2 (App Router) | Server components, API routes, static + dynamic rendering, excellent DX |
| **React** | 18.3 | Concurrent features, Server Components |
| **Tailwind CSS** | 3.4 | Utility-first, rapid UI, dark mode, responsive |
| **Zod** | 3.23 | Runtime validation for API inputs/outputs |

### Why Next.js App Router?
- **Server Components** by default → smaller client bundles, direct DB access in components
- **Route Handlers** → API routes co-located with pages
- **Streaming SSR** → Dashboard loads fast, stats stream in
- **Static Export** where possible → CDN-friendly pages
- **Middleware** → Auth, logging, feature flags (future)

---

## Backend (Worker + Shared)

| Technology | Version | Why |
|------------|---------|-----|
| **Drizzle ORM** | 0.32 | Type-safe SQL, great pgvector support, lightweight, Neon-compatible |
| **Neon PostgreSQL** | Serverless | Auto-scaling, branching, pgvector extension, generous free tier |
| **pgvector** | 0.5+ | Native vector similarity search in Postgres |
| **pg-boss** | 9.0 | Postgres-backed job queue (no Redis needed), cron scheduling, retries |
| **@google/genai** | Latest | Official Gemini SDK, structured output support |

### Why Drizzle over Prisma?
| Factor | Drizzle | Prisma |
|--------|---------|--------|
| pgvector support | Native | Limited |
| Bundle size | ~50KB | ~10MB |
| Query flexibility | Raw SQL + builder | Generated client |
| Neon serverless | First-class | Requires proxy |
| Learning curve | SQL-like | New DSL |

### Why pg-boss over Bull/BullMQ?
- **No Redis** → Single infrastructure (Neon only)
- **Postgres-native** → ACID, same connection pool
- **Cron scheduling** → Built-in, no separate scheduler
- **Retries/backoff** → Built-in with dead-letter
- **Cost** → Free tier Neon includes enough for queue

---

## AI / LLM Layer

| Technology | Version | Why |
|------------|---------|-----|
| **Google Gemini** | 1.5 Flash / 1.5 Pro | **Free tier available**, 1M token context, structured output, fast |
| **@google/genai** | Latest | Official SDK, TypeScript types, streaming |
| **Zod** | 3.23 | Schema validation → structured output enforcement |

### Why Gemini over OpenAI/Claude?
| Factor | Gemini | OpenAI | Claude |
|--------|--------|--------|--------|
| Free tier | ✅ 1.5 Flash | ❌ | ❌ |
| Context window | 1M tokens | 128k | 200k |
| Structured output | ✅ Native | ✅ JSON mode | ❌ |
| Cost (paid) | Lowest | Medium | High |
| Rate limits | Generous | Strict | Strict |

### Structured Output Pattern
```typescript
const result = await generateContent(prompt, ZodSchema, {
  temperature: 0.1,
  maxRetries: 3,
});
// Result is fully typed, validated, or throws
```

---

## Embeddings & Vector Search

| Technology | Why |
|------------|-----|
| **Gemini Embeddings** (`text-embedding-004`) | 768-dim, free tier, same API as LLM |
| **pgvector** | Native Postgres, HNSW/IVFFlat indexes, no separate service |
| **Cosine similarity** | `1 - (embedding <=> query)` in SQL |

### Why not Pinecone/Weaviate/Qdrant?
- **Cost**: Free tier limits, paid for production
- **Complexity**: Additional service to deploy/monitor
- **Latency**: Network hop vs. local Postgres
- **Sufficiency**: 768-dim, ~100k vectors well within pgvector capability

---

## Browser Automation

| Technology | Version | Why |
|------------|---------|-----|
| **Playwright** | 1.44+ | Best reliability, auto-waiting, multiple browsers, stealth mode |
| **Chromium** | Bundled | Consistent rendering, headless CI support |
| **Persistent Profile** | — | Session cookies, login state reused across runs |

### Why Playwright over Puppeteer/Selenium?
| Feature | Playwright | Puppeteer | Selenium |
|---------|------------|-----------|----------|
| Auto-waiting | ✅ | Partial | ❌ |
| Multi-browser | ✅ | Chromium only | ✅ |
| Network interception | ✅ | ✅ | Limited |
| Stealth/evasion | Good | Good | Poor |
| TypeScript | First-class | First-class | Good |

### Safety Boundaries (Enforced)
- ✅ No CAPTCHA solving
- ✅ No MFA/OTP bypass
- ✅ No credential theft
- ✅ No anti-bot evasion
- ✅ Challenge → `NEEDS_HUMAN` state

---

## Validation & Testing

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 2.0 | Unit/integration tests, fast, ESM-native |
| **Playwright Test** | 1.44 | E2E browser tests, fixtures |
| **ESLint** | 9.x | Linting, TypeScript rules |
| **Prettier** | 3.3 | Formatting |
| **TypeScript** | 5.5 | Strict mode, no `any` |

### Test Strategy
| Level | Tools | Coverage |
|-------|-------|----------|
| Unit | Vitest | Normalization, filtering, parsing, schemas |
| Integration | Vitest + Test DB | DB migrations, ingestion, AI validation |
| E2E Browser | Playwright | Greenhouse form fill, submit, challenge detection |

---

## Monorepo & Build

| Tool | Why |
|------|-----|
| **pnpm Workspaces** | Fast installs, hoisting, `pnpm -r` for recursive commands |
| **TypeScript Project References** | Fast incremental builds, strict boundaries |
| **tsc --noEmit** | Type checking without output (CI) |
| **Next.js Build** | Web app compilation |
| **tsc** | Worker + packages compilation |

---

## Infrastructure & Deployment

| Component | Recommendation | Why |
|-----------|----------------|-----|
| **Database** | Neon PostgreSQL | Serverless, pgvector, branching, free tier |
| **Web** | Vercel / Netlify / Railway | Next.js optimized, edge functions |
| **Worker** | Railway / Render / Fly.io / VPS | Long-running, Chromium support |
| **Browser** | Worker machine/container | Chromium needs persistent filesystem |
| **Secrets** | Platform secret manager | Never in code/env files |

### Why Separate Web + Worker?
- **Web**: Short-lived requests, serverless-friendly, scales to zero
- **Worker**: Long-running (Playwright, AI), persistent connections, cron jobs
- **Scaling**: Independent scaling, different resource profiles
- **Reliability**: Worker crash doesn't affect web UI

---

## Cost Optimization (Free-Tier First)

| Resource | Free Tier Strategy |
|----------|-------------------|
| **Neon** | 0.5 GB storage, 190h compute/month |
| **Gemini** | 1.5 Flash: 1500 req/day free |
| **Playwright** | Local / Worker machine |
| **Queue** | pg-boss in Neon (no Redis) |
| **Hosting** | Vercel (web), Railway free tier (worker) |

### AI Cost Controls
1. **Hard filters first** → 1000 jobs → 200 candidates → 50 analyzed
2. **Cache by content_hash + prompt_version + model** → Skip unchanged
3. **Structured output** → Single call, no retries for parsing
4. **Temperature 0.1-0.3** → Deterministic, fewer retries

---

## Security Practices

| Practice | Implementation |
|----------|----------------|
| **Secrets** | Only in environment variables, never committed |
| **DB Credentials** | Neon connection string with IAM/pooler |
| **Gemini API Key** | Platform secret store |
| **Browser Profile** | `.playwright/` in `.gitignore`, encrypted at rest |
| **Email Credentials** | App passwords, not primary |
| **CORS/CSRF** | Next.js defaults, SameSite cookies |

---

## Future Extensibility Points

| Area | Current | Future Options |
|------|---------|----------------|
| **Sources** | Greenhouse, Lever, Ashby | LinkedIn, Indeed, RSS, Email alerts |
| **Providers** | Greenhouse (full), Lever/Ashby (stub) | Workday, iCIMS, custom |
| **AI Models** | Gemini | GPT-4o, Claude, local (Ollama) |
| **Queue** | pg-boss | Redis (if scale demands) |
| **Vector DB** | pgvector | Pinecone (if >1M vectors) |
| **Auth** | None (personal) | NextAuth, Clerk |
| **Multi-user** | Single profile | Teams, organizations |

---

## Decision Log Summary

| Decision | Date | Status |
|----------|------|--------|
| Monorepo with pnpm | Day 1 | ✅ |
| Next.js App Router | Day 1 | ✅ |
| Drizzle + Neon + pgvector | Day 1 | ✅ |
| pg-boss for queue | Day 1 | ✅ |
| Gemini for AI | Day 1 | ✅ |
| Playwright for browser | Day 1 | ✅ |
| Two resume tracks (AI-SWE/SWE) | Day 3 | ✅ |
| Verified bullet bank | Day 3 | ✅ |
| Human approval required | Day 1 | ✅ |
| Email ingestion (IMAP) | Phase 13 | ✅ |
| Application timeline UI | Phase 12 | ✅ |