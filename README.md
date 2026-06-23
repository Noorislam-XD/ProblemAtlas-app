# ProblemAtlas

> **Startup opportunity discovery, on autopilot.**
> Scrapes Reddit & Hacker News for real user pain points, scores them with Gemini AI, and surfaces the ones worth building on.

🔗 **Live demo:** https://problem-atlas--animeforever69o.replit.app/

---

## What it does

Founders and indie hackers spend hours manually scrolling forums hunting for problems worth solving. ProblemAtlas automates that entire pipeline:

1. **Auto-scrapes** Reddit (`r/Entrepreneur`, `r/startups`, `r/SaaS`, `r/webdev`, `r/devops`, `r/productivity`) and Hacker News every 6 hours, filtering posts with keywords like "frustrated with", "wish there was", "no good tool for"
2. **AI-scores** each post using **Gemini 2.0 Flash Lite** across 6 dimensions — frequency, severity, market size, trend direction, competition level, and build feasibility
3. **Filters ruthlessly** — only opportunities with a composite score ≥ 6.0 / 10 are stored
4. **Presents a ranked feed** of vetted opportunities with full breakdowns: pain points, TAM estimates, competitor weaknesses, MVP spec, and risk analysis
5. **Accepts community submissions** — anyone can submit a problem manually for review

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 · Vite · Tailwind CSS · shadcn/ui · Framer Motion · Recharts |
| Backend | Node.js 24 · Express 5 · TypeScript 5.9 |
| Database | PostgreSQL · Drizzle ORM · drizzle-zod |
| AI | Google Gemini 2.0 Flash Lite (`@google/generative-ai`) |
| API contract | OpenAPI spec · Orval codegen (Zod schemas + React Query hooks) |
| Monorepo | pnpm workspaces |
| Deployment | Railway (API + static frontend) |
| Build | esbuild (CJS bundle for API) · Vite (frontend) |

---

## Repo Structure

```
.
├── artifacts/
│   ├── api-server/          # Express 5 backend
│   │   └── src/
│   │       ├── services/
│   │       │   ├── scraper.ts   # Reddit + HN scraper (runs every 6h)
│   │       │   └── gemini.ts    # Gemini AI scoring pipeline
│   │       └── routes/
│   │           ├── opportunities.ts  # CRUD + filter + submit endpoints
│   │           ├── admin.ts          # Admin scrape trigger
│   │           ├── stats.ts          # Aggregate stats
│   │           └── health.ts
│   └── problem-atlas/       # React frontend (Vite)
│       └── src/
│           └── pages/
│               ├── home.tsx      # Main discovery feed
│               ├── detail.tsx    # Full opportunity breakdown
│               ├── submit.tsx    # Community submission form
│               └── admin.tsx     # Admin panel
└── lib/
    ├── db/                  # Drizzle ORM schema + client
    ├── api-spec/            # OpenAPI spec (source of truth)
    ├── api-zod/             # Generated Zod validators
    └── api-client-react/    # Generated React Query hooks
```

---

## AI Scoring Model

Each post is evaluated by Gemini across 6 dimensions (0–10):

| Dimension | What it measures |
|---|---|
| **Frequency** | How often people face this problem |
| **Severity** | How painful the problem is |
| **Market** | Total addressable market potential |
| **Trend** | Whether the problem space is growing |
| **Competition** | How uncrowded the solution space is (10 = no competition) |
| **Feasibility** | How buildable a solution is |

The **composite score** is the unweighted mean of the six. Posts scoring below 6.0 are discarded. Approved entries include a full MVP spec, TAM/WTP estimate, named competitors and their weaknesses, and a bear-case risk analysis.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/opportunities` | List opportunities (filter by category, search, minScore, sortBy) |
| `GET` | `/api/opportunities/top` | Top N opportunities by score |
| `GET` | `/api/opportunities/:id` | Single opportunity detail |
| `POST` | `/api/opportunities/submit` | Submit a problem manually |
| `POST` | `/api/admin/scrape` | Trigger scraper manually |
| `GET` | `/api/stats` | Aggregate stats (total, avg score, top category) |
| `GET` | `/api/categories` | Category breakdown with counts and avg scores |
| `GET` | `/api/health` | Health check |

---

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm 9+
- PostgreSQL database
- Gemini API key ([get one free](https://aistudio.google.com/))

### Setup

```bash
# Clone the repo
git clone https://github.com/Noorislam-XD/ProblemAtlas-app.git
cd ProblemAtlas-app

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env
# Fill in DATABASE_URL and GEMINI_API_KEY

# Push DB schema
pnpm --filter @workspace/db run push

# Start the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# In a second terminal — start the frontend (port 5173)
pnpm --filter @workspace/problem-atlas run dev
```

### Build for production

```bash
pnpm run build
# Output: artifacts/api-server/dist/ + artifacts/problem-atlas/dist/
```

### Deploy to Railway

The repo includes `railway.json`. Connect the repo to a Railway project, add `DATABASE_URL` and `GEMINI_API_KEY` as environment variables, and Railway will handle the rest. The API server serves the compiled frontend as static files in production.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `GEMINI_API_KEY` | ✅ | Google AI Studio API key |
| `NODE_ENV` | — | Set to `production` to serve frontend from API |
| `PORT` | — | API server port (default: 5000) |

---

## Scripts

| Command | Description |
|---|---|
| `pnpm --filter @workspace/api-server run dev` | Run API server in dev mode |
| `pnpm --filter @workspace/problem-atlas run dev` | Run frontend dev server |
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes (dev only) |

---

## Opportunity Categories

`developer-tools` · `productivity` · `ai` · `fintech` · `saas` · `health` · `education` · `other`

---

## License

MIT — built by [Noor Islam](https://github.com/Noorislam-XD)

