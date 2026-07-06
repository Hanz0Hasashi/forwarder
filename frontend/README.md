# Forwarder Frontend

Frontend and API layer for the logistics workflow platform.

This app is built with SvelteKit and includes:

- customer intake flow
- admin dashboards
- driver request management
- API routes for jobs, bids, trips, and users
- AI-assisted validation and negotiation

## Current Stack

### Core Web Stack

- Svelte 5 (runes-based reactivity)
- SvelteKit 2 (routing, server endpoints, SSR)
- TypeScript
- Vite 8

### UI and Styling

- Tailwind CSS 3
- Shared UI components:
  - [src/lib/components/ui/Button.svelte](src/lib/components/ui/Button.svelte)
  - [src/lib/components/ui/StatusBadge.svelte](src/lib/components/ui/StatusBadge.svelte)
- Global design tokens in [src/app.css](src/app.css)

### Data and Persistence

- Prisma ORM
- PostgreSQL (Neon-compatible)
- pgvector extension enabled in Prisma schema for embeddings

### Auth and Identity

- Clerk
- Server auth guard in [src/hooks.server.ts](src/hooks.server.ts)

### AI Layer

- Vercel AI SDK (package ai)
- Groq provider via @ai-sdk/groq
- Zod schemas for strict AI response validation
- Agent logic in:
  - [src/lib/server/ai/intakeAgent.ts](src/lib/server/ai/intakeAgent.ts)
  - [src/lib/server/ai/brokerAgent.ts](src/lib/server/ai/brokerAgent.ts)

### Testing and Quality

- Vitest for integration/contract-style API tests
- svelte-check for type + Svelte diagnostics

## Project Structure (Frontend)

- [src/routes](src/routes): pages + API endpoints
- [src/routes/api](src/routes/api): server routes
- [src/lib/server](src/lib/server): server-only Prisma and AI modules
- [prisma/schema.prisma](prisma/schema.prisma): database schema

## Environment Variables

Create a local .env file in this frontend folder.

Required for normal local development:

- PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- GROQ_API_KEY
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING

Also supported:

- CLERK_PUBLISHABLE_KEY (fallback key name used server-side)

## Development

Install dependencies:

```sh
npm install
```

Run dev server:

```sh
npm run dev
```

Run diagnostics:

```sh
npm run check
```

Run tests:

```sh
npm run test
```

## Build and Preview

Build command:

```sh
npm run build
```

Note: current build script runs Prisma generate + db push + seed before Vite build.

Preview production build:

```sh
npm run preview
```

## API Contract Testing

This project uses endpoint-level contract tests for API behavior.

Current specs:

- [src/routes/api/__tests__/api-auth.integration.test.ts](src/routes/api/__tests__/api-auth.integration.test.ts)
- [src/routes/api/__tests__/endpoint-contracts.test.ts](src/routes/api/__tests__/endpoint-contracts.test.ts)
- [src/routes/api/__tests__/bid-lifecycle-users-contracts.test.ts](src/routes/api/__tests__/bid-lifecycle-users-contracts.test.ts)
- [src/routes/api/__tests__/driver-authsync-failure-contracts.test.ts](src/routes/api/__tests__/driver-authsync-failure-contracts.test.ts)

Recommended test pattern:

1. Mock external dependencies (Prisma, Clerk, AI, fetch).
2. Import route handlers after mocks are set.
3. Build minimal route events with request, params, and locals.auth.
4. Assert status code and response contract together.
5. Assert query inputs for role and ownership filters where relevant.

## UI System Notes

The UI has been modernized to Svelte + Tailwind patterns with reusable primitives.

- Prefer shared Button and StatusBadge components for actions/status pills.
- Prefer tokenized colors and spacing from [src/app.css](src/app.css) over page-local hardcoded values.
- Keep page behavior unchanged during style refactors.

## Quick Troubleshooting

- Blank auth pages usually indicate missing PUBLIC_CLERK_PUBLISHABLE_KEY.
- If API auth fails, verify CLERK_SECRET_KEY and user provisioning path.
- If Prisma fails, verify both Postgres URLs and extension support.
- Run npm run check after any UI or route change.
