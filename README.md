# ShutUP Forwarder — Agentic AI Car Transport Platform

> ShutUP Forwarder is a fully agentic AI-powered car transport marketplace. Customers submit a transport job; AI agents handle dispatch, negotiation, compliance, and delivery confirmation — with humans in the loop only where trust and liability require it.

Built with the **Vercel AI SDK** (multi-agent orchestration via `streamText` / `generateObject` tool-calling), **Next.js App Router**, and **NeonDB** for serverless Postgres persistence.

---

## What the App Does

1. **Customer submits a job** — chassis number, vehicle photos (all sides + damage), pickup & delivery addresses.
2. **AI Intake Agent** validates the submission, extracts vehicle data, and flags pre-existing damage via vision analysis.
3. **Dispatch Agent** broadcasts the job to the forwarder network, collects bids, and negotiates pricing autonomously within policy bounds.
4. **Forwarder** (human, on their mobile app) accepts the job and confirms pick-up with a fresh photo set.
5. **In-Transit Agent** tracks progress, proactively messages both sides, and escalates anomalies.
6. **Delivery Agent** compares pre- and post-delivery photo sets using vision AI to detect new damage.
7. **Insurance Agent** is triggered automatically when damage delta is detected — it files a claim draft and loops in a human adjuster.
8. **Customer** reviews the delivery report and taps "Accept" or "Dispute".

---

## Roles

### Human Roles

| Role | Responsibilities |
|---|---|
| **Customer (Individual / Business)** | Submits transport requests, uploads vehicle photos, provides addresses, accepts or disputes delivery. |
| **Forwarder / Carrier** | Independent transporter who receives job broadcasts, bids on or accepts jobs, executes pickup and delivery, and captures delivery photos. |
| **Operations Manager** (ShutUP staff) | Oversees jobs flagged by agents as high-risk or stalled; approves exception pricing above policy ceiling. |
| **Insurance Adjuster** (partner) | Reviews AI-drafted damage claims, communicates with the customer's insurer, and signs off on settlements. |
| **Platform Admin** | Manages forwarder onboarding & vetting, sets pricing policy parameters, monitors system health. |

### AI Agent Roles

All agents are implemented as tool-calling LLM chains using the Vercel AI SDK (`createAI`, `streamText`, agent tool loops). Agents communicate via a shared job state in NeonDB and emit real-time events to the UI via Server-Sent Events.

| Agent | Model Tier | Core Tools / Capabilities |
|---|---|---|
| **Intake Agent** | GPT-4o (vision) | Parses chassis/VIN via OCR, validates vehicle data against public registries, runs vision analysis on uploaded photos to classify and annotate pre-existing damage, normalises addresses via geocoding API. Queries NeonDB for similar past jobs by make/model/route to pre-fill risk flags. |
| **Dispatch Agent** | GPT-4o | Scores forwarder candidates (rating, proximity, capacity, past performance), generates job broadcast messages, evaluates incoming bids, runs iterative negotiation within configured price floors/ceilings, selects winning bid and sends acceptance. Queries aggregated bid history (`avg`, `percentile`) from NeonDB to anchor price recommendations. |
| **Negotiation Sub-Agent** | GPT-4o-mini | Handles back-and-forth bid counter-offers in a structured dialogue loop; escalates to Operations Manager when no agreement is reached within N rounds. Reads forwarder negotiation history as structured rows from NeonDB to calibrate counter-offer strategy. |
| **Compliance Agent** | GPT-4o | Checks cross-border transport legality, required documentation (CMR waybill, power of attorney, customs forms), and flags missing items before job is dispatched. **RAG** over a curated regulatory knowledge base (EU transport directives, country-specific import/customs rules) — unstructured documents maintained by the Operations Manager. |
| **In-Transit Agent** | GPT-4o-mini | Polls carrier GPS/ETA updates, sends proactive status messages to customer and forwarder, triggers alerts on delays, and re-routes if the forwarder goes dark. Queries time-series delay analytics from NeonDB to set ETA expectations. |
| **Delivery Agent** | GPT-4o (vision) | Compares pre-delivery vs. post-delivery photo sets pixel-semantically; generates a structured damage delta report; marks job as clean or damaged. Queries structured damage severity thresholds from NeonDB by vehicle make/model. |
| **Insurance Agent** | GPT-4o | When damage delta is detected: drafts a formal claim (vehicle ID, damage description, photo evidence links, estimated repair cost band), routes to the Insurance Adjuster, and updates the customer in plain language. **RAG** over past settled claim narratives and repair cost data — free-text documents where semantic search meaningfully improves cost band estimation. |
| **Customer Comms Agent** | GPT-4o-mini | Omnichannel messaging (email, WhatsApp, push) to keep the customer informed at every milestone. **RAG** over platform FAQ, terms of service, and past support threads — unstructured content that cannot be reduced to structured queries. |
| **Audit & Logging Agent** | GPT-4o-mini | Maintains an immutable, timestamped narrative log of every agent action and human decision for legal and dispute resolution purposes. Retrieves prior entries by exact job ID and timestamp range via NeonDB — no semantic search needed. |

---

## Job Lifecycle State Machine

```
DRAFT
  │  Customer fills form + uploads photos
  ▼
SUBMITTED
  │  Intake Agent validates & annotates
  ▼
DISPATCHED
  │  Dispatch + Negotiation Agents broadcast & negotiate
  ▼
ACCEPTED (by Forwarder)
  │  Forwarder confirms pickup with photos
  ▼
IN_TRANSIT
  │  In-Transit Agent monitors
  ▼
DELIVERED
  │  Forwarder uploads delivery photos
  ▼
INSPECTION          ←── Delivery Agent runs photo diff
  │
  ├── CLEAN ──────── Customer accepts → COMPLETED
  │
  └── DAMAGE_DETECTED
        │  Insurance Agent drafts claim
        ▼
      CLAIM_FILED
        │  Adjuster reviews
        ▼
      DISPUTED / SETTLED → COMPLETED
```

---

## Customer Submission Form

The submission flow is a multi-step wizard:

1. **Vehicle Identity** — VIN / chassis number (OCR-assisted), make, model, year, fuel type, mileage.
2. **Vehicle Condition** — Guided photo upload: front, rear, driver side, passenger side, interior, odometer, and damage close-ups. Intake Agent annotates each photo in real time.
3. **Pre-existing Damage Declaration** — Customer confirms or amends the AI-generated damage annotation.
4. **Transport Details** — Pickup address (with date window), delivery address, whether the vehicle is running, special features (roof box, non-running, etc.).
5. **Contact & Notification Preferences** — email, WhatsApp, push.
6. **Review & Submit** — Summary with AI-generated pre-delivery condition report (PDF).

---

## Forwarder App (Mobile-first PWA)

- **Job Feed** — real-time stream of available jobs matching the forwarder's registered route network.
- **Bid / Accept** — one-tap accept (pre-agreed rate) or counter-bid entry; Negotiation Sub-Agent responds within seconds.
- **Pickup Confirmation** — forwarder captures mandatory photo set at pickup; In-Transit Agent activates.
- **Delivery Confirmation** — forwarder captures mandatory photo set at delivery address; Delivery Agent triggers.
- **Earnings Dashboard** — completed jobs, ratings, payout history.

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server Actions, streaming UI, edge-ready |
| AI Orchestration | Vercel AI SDK (`ai` package) | Multi-step tool-calling, `streamText`, `generateObject`, agent loops |
| LLM Provider | OpenAI (GPT-4o / GPT-4o-mini) | Vision support, function calling, reliability |
| Vision Analysis | GPT-4o vision via Vercel AI SDK | Damage detection & VIN OCR in a single API call |
| Database | NeonDB (serverless Postgres) | Branching, autoscale, connection pooling via `@neondatabase/serverless` |
| ORM | Drizzle ORM | Type-safe queries, schema migrations (`drizzle-kit push`) |
| Vector Store | NeonDB `pgvector` extension | Embeddings for Compliance, Insurance, and Customer Comms RAG — stored alongside relational data |
| Embeddings | OpenAI `text-embedding-3-small` | Used only for the 3 RAG knowledge bases; all other agents use typed Drizzle queries |
| RAG Pipeline | Vercel AI SDK `embed` + `cosineSimilarity` | Retrieval tool scoped to Compliance, Insurance, and FAQ knowledge bases |
| Real-time | Vercel SSE (Server-Sent Events) | Job state change streaming to the UI without a WebSocket server |
| File Storage | Vercel Blob | Photo uploads with signed `put` URLs, edge-cached delivery |
| Auth | Clerk | Customer, Forwarder, Admin, Adjuster roles via `publicMetadata`; JWT templates for API auth |
| Maps & Geocoding | Google Maps Platform | Address autocomplete, route distance, ETA |
| Messaging | Resend (email) + WhatsApp Business API | Customer comms at every milestone |
| Background Jobs | Vercel Cron + Edge Functions | In-Transit Agent polling, bid timeout enforcement |
| Deployment | Vercel | Zero-config, edge streaming support |

---

## Repository Structure (planned)

```
forwarder/
├── app/                        # Next.js App Router
│   ├── (customer)/             # Customer-facing pages & wizard
│   ├── (forwarder)/            # Forwarder PWA shell
│   ├── (admin)/                # Ops Manager & Admin dashboard
│   ├── api/
│   │   ├── agents/             # Vercel AI SDK route handlers (streaming)
│   │   │   ├── intake/
│   │   │   ├── dispatch/
│   │   │   ├── in-transit/
│   │   │   ├── delivery/
│   │   │   └── insurance/
│   │   └── webhooks/           # Forwarder GPS, WhatsApp inbound
│   └── layout.tsx
├── agents/                     # Agent definitions (tools, prompts, schemas)
│   ├── intake-agent.ts
│   ├── dispatch-agent.ts
│   ├── negotiation-agent.ts
│   ├── compliance-agent.ts
│   ├── in-transit-agent.ts
│   ├── delivery-agent.ts
│   ├── insurance-agent.ts
│   ├── comms-agent.ts
│   └── audit-agent.ts
├── lib/
│   ├── db/                     # NeonDB client, Drizzle schema, migrations
│   ├── rag/                    # RAG pipeline (Compliance, Insurance, FAQ only)
│   │   ├── embed.ts            # OpenAI embedding wrapper
│   │   ├── ingest.ts           # Chunking & upsert into pgvector
│   │   ├── retrieve.ts         # Top-K similarity search tool
│   │   └── knowledge-bases/
│   │       ├── compliance/     # EU transport directives, customs rules
│   │       ├── faq/            # Customer FAQ, T&Cs, support threads
│   │       └── claims/         # Settled claim narratives & repair cost docs
│   ├── tools/                  # Shared AI SDK tool definitions
│   └── schemas/                # Zod schemas for structured outputs
├── components/                 # Shared UI (shadcn/ui)
└── public/
```

---

## Key Design Decisions

- **Agents are stateless functions** — all job state lives in NeonDB; agents read and write via typed Drizzle tool calls, making every action auditable and replayable.
- **RAG is used only where data is unstructured** — Compliance (regulatory documents), Insurance (settled claim narratives), and Customer Comms (FAQ/T&Cs) use `pgvector` similarity search with cited chunk retrieval. All other agents use typed Drizzle queries against NeonDB; structured historical data (bids, delays, damage severity) is cheaper and more precise to query as SQL aggregations.
- **Knowledge bases are role-gated** — the compliance KB is writable only by the Operations Manager; the claims KB is updated after each settled claim; the FAQ KB is editable by the Platform Admin. Ingestion runs via a Vercel Cron job.
- **Human-in-the-loop gates** — pricing above policy ceiling, insurance claim filing, and disputed deliveries require explicit human sign-off before agents proceed.
- **Photo evidence is immutable** — uploaded photos are stored with content-addressed keys and signed at upload time; Delivery Agent always compares against the canonical pre-delivery set, not customer-editable copies.
- **Negotiation is bounded** — the Dispatch Agent operates within a price floor (forwarder minimum) and ceiling (customer budget or platform cap) set by the Operations Manager; the AI cannot agree to terms outside these bounds without human approval.
- **Damage detection is advisory** — the Delivery Agent produces a confidence-scored damage report; final claim filing always passes through the Insurance Adjuster, avoiding fully automated liability decisions.

---

## Getting Started (Development)

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Fill in: OPENAI_API_KEY, DATABASE_URL (NeonDB pooled connection string),
#          CLERK_SECRET_KEY, CLERK_PUBLISHABLE_KEY,
#          BLOB_READ_WRITE_TOKEN (Vercel Blob),
#          GOOGLE_MAPS_API_KEY, RESEND_API_KEY, WHATSAPP_API_TOKEN

# Seed RAG knowledge bases
pnpm rag:ingest

# Run database migrations
pnpm drizzle-kit push

# Start dev server
pnpm dev
```

---

## Reference

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Vercel AI SDK `embed` reference](https://sdk.vercel.ai/docs/reference/ai-sdk-core/embed)
- [NeonDB pgvector docs](https://neon.tech/docs/extensions/pgvector)
- [CMR Convention](https://unece.org/transport/road-transport/cmr-convention) — international road goods transport waybill standard used for cross-border car transport

