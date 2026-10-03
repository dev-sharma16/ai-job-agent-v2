# Project Explanation Index

This folder contains detailed documentation explaining the AI Job Agent project from multiple perspectives.

---

## Files

| File | Description | Audience |
|------|-------------|----------|
| [`01-database-schemas.md`](01-database-schemas.md) | Complete schema reference with columns, types, indexes, and feature mapping | Backend devs, DBAs, anyone querying the DB |
| [`02-features-working.md`](02-features-working.md) | End-to-end feature explanations with code references and data flows | Full-stack devs, architects, product |
| [`03-project-structure.md`](03-project-structure.md) | Monorepo layout, file-to-feature mapping, dependency graph, commands | New contributors, onboarding |
| [`04-tech-stack.md`](04-tech-stack.md) | Every technology choice with rationale, alternatives considered, cost analysis | Decision makers, tech leads, architects |

---

## Quick Navigation

### "I want to understand the database..."
→ [01-database-schemas.md](01-database-schemas.md) — 14 tables, all columns, indexes, enums, feature mapping

### "I want to know how a feature works..."
→ [02-features-working.md](02-features-working.md) — 12 features with code refs, data flows, prompts, algorithms

### "I'm new to the codebase, where do I start?"
→ [03-project-structure.md](03-project-structure.md) — Monorepo layout, file-to-feature map, dependency graph, commands

### "Why did you choose X over Y?"
→ [04-tech-stack.md](04-tech-stack.md) — Every tech choice with rationale, alternatives, cost analysis

---

## High-Level Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sources   │────▶│  Ingestion  │────▶│   Jobs DB   │
│ (GH/Lever/  │     │  (2hr)      │     │ (discovered)│
│  Ashby)     │     └─────────────┘     └──────┬──────┘
└─────────────┘                                ▼
                                        ┌─────────────┐
                                        │  Filtering  │ (30min)
                                        │  (filter)   │
                                        └──────┬──────┘
                                               ▼
                                        ┌─────────────┐
                                        │ AI Analysis │ (15min)
                                        │ (analyze)   │ + embeddings
                                        └──────┬──────┘
                                               ▼
                                        ┌─────────────┐
                                        │Resume Tailor│ (on-demand)
                                        │ (tailor)    │ + PDF
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
                                        │ Track/Email │ (status)
                                        └─────────────┘
```

---

## Key Principles

1. **Deterministic First, AI Second** — Ingestion, filtering, dedup, DB ops = code; Only classification/generation = AI
2. **Verified Truth** — Every resume bullet traces to experience/project; no hallucination
3. **Human in the Loop** — Never auto-submit; approval required by default
4. **Single Infrastructure** — Neon Postgres for DB + Queue + Vectors (no Redis, no Pinecone)
5. **Free-Tier First** — Neon + Gemini Flash + Vercel + Railway free tiers cover dev/small prod
6. **Structured AI Output** — Zod schemas enforce valid JSON; no parsing errors
7. **Event Sourcing** — Every state change logged for audit/timeline

---

## Quick Commands

```bash
# Development
pnpm dev:web      # Next.js dashboard on :3000
pnpm dev:worker   # Background worker with hot reload

# Database
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
pnpm db:seed      # Seed profile, experiences, bullets, base resumes

# Worker Jobs (manual trigger)
pnpm --filter worker ingest      # Run ingestion once
pnpm --filter worker filter      # Run filtering once
pnpm --filter worker analyze     # Run AI analysis once
pnpm --filter worker embed       # Generate embeddings once

# Quality
pnpm build        # Build all packages
pnpm typecheck    # TypeScript strict check
pnpm test         # All Vitest + Playwright tests
pnpm lint         # ESLint all packages
```

---

## Related Documentation

- **Specs**: [`../docs/`](../docs/) — Original specification documents (01-06)
- **README**: [`../README.md`](../README.md) — Project overview, setup, deployment
- **Env Config**: [`../.env.example`](../.env.example) — All required environment variables