# FlipTrack

An internal operations tool for multi-storefront resellers — event-driven AI valuation, inventory tracking across categories, and a complete audit trail of every appraisal decision.

Built to demonstrate event-driven architecture, AI tooling, and multi-storefront data consolidation.

## Features

- **Multi-storefront dashboard** — KPI cards and live event feed across SoleVault (sneakers), WaxStack (vinyl), CardHouse (trading cards)
- **Event-driven AI valuation** — item intake fires an Inngest event → background job calls Claude API → result pushed to browser via Inngest Realtime (no polling)
- **3-step intake form** — submit item → instant response → valuation appears when ready → operator accepts or adjusts
- **Valuation audit log** — every AI prompt, raw response, and accepted value stored with the Inngest run ID
- **Cross-storefront inventory** — filterable item table with status, category, and storefront filters

## Architecture

```
Intake Form
    │
    ▼
POST /api/items
    ├── saves item to DB (status: pending_valuation)
    └── fires event: item/intake.submitted
                │
                ▼
          [Inngest Event Bus]
                │
        ┌───────┴──────────────┐
        ▼                      ▼
  runAIValuation         notifyDashboard
  (calls Claude API)     (updates event feed)
        │
        ▼
  saves Valuation to DB
  fires: valuation/completed
                │
                ▼
        updateItemStatus
        (item → awaiting_approval)
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| UI | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL via Prisma v7 (Neon free tier) |
| Event system | Inngest (background jobs, retries, observability) |
| AI | Claude API (Anthropic SDK) with streaming |
| Deployment | Vercel |

## Local Setup

**Prerequisites:** Node.js 22+, npm

### 1. Clone and install

```bash
git clone <repo-url>
cd resale_application
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Add your database URL to `.env`:

```
DATABASE_URL="postgresql://..."
```

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma db seed
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Run Inngest local dashboard

```bash
npx inngest-cli@latest dev
```

Open [http://localhost:8288](http://localhost:8288) to see the event bus — every job run, retry, and payload visible in real time.

## Project Structure

```
src/
  app/
    page.tsx                    Dashboard
    inventory/page.tsx          Inventory table
    inventory/[id]/page.tsx     Item detail + valuation history
    intake/page.tsx             3-step intake form
    valuations/page.tsx         Audit log
    api/
      items/route.ts            GET + POST items
      inngest/route.ts          Inngest webhook endpoint
  components/
    sidebar.tsx                 Nav sidebar
  lib/
    prisma.ts                   Prisma client singleton
    valuationPrompt.ts          Category-aware Claude prompt builder
    claude.ts                   Anthropic SDK client

inngest/
  client.ts                     Inngest singleton
  functions/
    runAIValuation.ts           Core AI job — calls Claude, saves result
    updateItemStatus.ts         Transitions item status on events
    notifyDashboard.ts          Writes to event log

prisma/
  schema.prisma                 Database schema (5 models)
  seed.ts                       3 storefronts + 7 items + sample valuations
  migrations/                   SQL migration history
```

## Database Schema

```
Storefront → Item → Valuation   (one item has many valuations)
                 → Transaction  (sales history)
EventLog                        (every Inngest event stored)
```

## Why Event-Driven?

On Vercel, every API route runs as a **serverless function** — it spins up, handles one request, and shuts down. The default execution limit is 10 seconds.

A Claude API call takes 5–15 seconds. That call does not fit inside a 10-second HTTP handler.

Without Inngest:
- The POST handler stays open waiting for Claude
- Vercel kills it at 10s — the item is saved but never valued
- No retry happens — the failure is silent
- The operator has no idea anything went wrong

With Inngest:
- The POST handler saves the item and returns in <100ms
- Inngest runs the Claude call outside the request lifecycle, with no time limit
- If Claude fails, Inngest retries automatically with exponential backoff
- Every attempt is visible in the Inngest dashboard with full payload and error trace

The failure mode changes from **silent data loss** to **observable, recoverable error**.
