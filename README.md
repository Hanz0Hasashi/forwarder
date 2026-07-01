# ShutUP Forwarder — Agentic AI Car Transport Platform

> ShutUP Forwarder is a fully agentic AI-powered car transport marketplace. Customers submit a transport job; AI agents handle dispatch, negotiation, compliance, and delivery confirmation — with humans in the loop only where trust and liability require it.

Built with **SvelteKit** (Frontend), **FastAPI & Pydantic AI** (Backend Orchestration), and **NeonDB** for serverless Postgres persistence.

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

Agents are implemented using **Pydantic AI** (Backend) and the **Vercel AI SDK** (Frontend UI streaming). They communicate via a shared job state in NeonDB.

| Agent | Core Tools / Capabilities |
|---|---|
| **Intake Agent** | Parses chassis/VIN via OCR, validates vehicle data against public registries, runs vision analysis on uploaded photos to classify and annotate pre-existing damage. |
| **Dispatch Agent** | Scores forwarder candidates, evaluates incoming bids, runs iterative negotiation within configured price floors/ceilings, selects winning bid. |
| **Negotiation Sub-Agent** | Handles back-and-forth bid counter-offers in a structured dialogue loop; escalates to Operations Manager when no agreement is reached. |
| **Compliance Agent** | Checks cross-border transport legality, required documentation (CMR waybill, customs forms), and flags missing items before job is dispatched. |
| **In-Transit Agent** | Polls carrier GPS/ETA updates, sends proactive status messages to customer and forwarder, triggers alerts on delays. |
| **Delivery Agent** | Compares pre-delivery vs. post-delivery photo sets pixel-semantically; generates a structured damage delta report. |
| **Insurance Agent** | Drafts a formal claim (vehicle ID, damage description, photo evidence links), routes to the Insurance Adjuster. |
| **Customer Comms Agent** | Omnichannel messaging (email, WhatsApp, push) to keep the customer informed at every milestone. |
| **Audit & Logging Agent** | Maintains an immutable, timestamped narrative log of every agent action and human decision. |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend Framework | SvelteKit & Vite | Lightning-fast routing, easy server actions, edge-ready |
| Backend Framework | FastAPI (Python) | High-performance async API for heavy agent orchestration |
| AI Orchestration (Backend) | Pydantic AI | Robust typing and structured outputs for agent logic |
| AI UI Integration | Vercel AI SDK | Streaming UI responses in the SvelteKit frontend |
| LLM Provider | Groq / OpenAI | Lightning-fast inference via Groq, fallback to OpenAI for vision |
| Database | NeonDB (serverless Postgres) | Branching, autoscale, connection pooling |
| ORM | Prisma Client (JS & Py) | Shared `schema.prisma` serving both Node (Frontend) and Python (Backend) |
| Auth | Clerk (svelte-clerk) | Turnkey authentication and role management |
| Styling | Tailwind CSS | Utility-first rapid UI development |
| Deployment | Vercel (Frontend) / Railway/Render (Backend) | Best-in-class hosting for their respective ecosystems |

---

## Repository Structure

```
shutup-forwarder/
├── frontend/                   # SvelteKit App (Customer & Forwarder Portals)
│   ├── src/                    # Routes, components, lib
│   ├── prisma/                 # Prisma seed scripts
│   ├── package.json            # Node dependencies
│   └── .env.example            # Frontend environment variables
│
├── backend/                    # FastAPI Agent Orchestrator
│   ├── main.py                 # FastAPI server entrypoint
│   ├── agent.py                # Pydantic AI definitions
│   ├── ai_broker.py            # AI logic & routing
│   ├── schema.prisma           # Shared Prisma schema (Source of Truth)
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Backend environment variables
│
├── landing/                    # SvelteKit Static Landing Page
│   └── src/                    # Landing page source code
│
├── .gitignore                  # Global git ignores
└── README.md                   # This file
```

---

## Key Architecture Decisions

- **Decoupled Frontend & Agent Backend:** SvelteKit handles the UI, Auth, and real-time state, while the Python FastAPI backend executes heavy Pydantic AI agent workflows.
- **Single Source of Truth Database:** Both the Node.js frontend and Python backend use the *exact same* NeonDB Postgres database. Prisma generates dual clients (`prisma-client-js` for SvelteKit and `prisma-client-py` for FastAPI) from a single `backend/schema.prisma` file.
- **Agents are stateless functions:** All job state lives in NeonDB; agents read and write via typed Prisma calls, making every action auditable and replayable.

---

## Getting Started (Development)

### 1. Database Setup
Ensure you have a NeonDB PostgreSQL database string ready. Add it to both your `frontend` and `backend` `.env` files as `DATABASE_URL`.

### 2. Backend (FastAPI & Agents)
```bash
cd backend

# Create virtual environment and install dependencies
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Generate Python Prisma Client
prisma generate

# Start the FastAPI server
uvicorn main:app --reload
```

### 3. Frontend (SvelteKit)
```bash
cd frontend

# Install dependencies
npm install

# Generate JS Prisma Client (reads schema from backend folder)
npx prisma generate --generator client_js

# Run database migrations (if schema changed)
npx prisma db push

# Start dev server
npm run dev
```

### 4. Landing Page
```bash
cd landing
npm install
npm run dev
```

---

## Reference

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Pydantic AI](https://pydantic.dev/)
- [Prisma Multi-Language Setup](https://www.prisma.io/docs/)
- [NeonDB pgvector docs](https://neon.tech/docs/extensions/pgvector)
