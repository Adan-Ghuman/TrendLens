# TrendLens

A full-stack snapshot system that captures GitHub Trending data and serves it through a stable API and dashboard.

## Overview

- TrendLens scrapes GitHub Trending at scheduled intervals and stores each successful run as a snapshot.
- The backend API serves data from the latest successful snapshot only.
- The frontend dashboard presents the snapshot with pagination, limit controls, and system status.
- Core idea: keep responses deterministic and avoid live scraping during user-facing API requests.

## Demo (Optional)

- Live link: Not available in this repository.
- Screenshot: Add `docs/screenshot.png` if needed.

## Architecture

- Flow: Scraper -> Snapshot Storage -> API -> Frontend Dashboard
- Scraper:
  - Pulls GitHub Trending sources on cron schedule.
  - Normalizes repository metadata.
- Snapshot storage:
  - Writes each successful scrape as a run-scoped dataset (`runId`).
  - Promotes one active snapshot for serving.
- API:
  - Reads from active snapshot only.
  - No live scraping in request path.
- Frontend:
  - Fetches paginated data and renders stable snapshot view.

## Key Design Decisions

- Snapshot model:
  - Chosen to provide consistent reads for all users during a run window.
- No live scraping in API:
  - Prevents request latency spikes, partial payloads, and source coupling.
- Deterministic sorting:
  - Ordered by stars descending, then repoId ascending for stable pagination.
- Cron-based updates:
  - Simpler operational model and lower runtime complexity than continuous real-time scraping.

## Features

- Snapshot-based data serving
- API pagination (`page`) and limit selection (`limit`)
- Repository list controls in dashboard
- System status indicators:
  - last updated
  - next update countdown
  - health status
- Auto-refresh logic on countdown/poll checks
- Compact, reviewer-friendly dashboard UI

## Tech Stack

Backend:

- Bun
- Elysia
- MongoDB (Mongoose)
- Cheerio
- node-cron

Frontend:

- Next.js (App Router)
- React
- TailwindCSS-style utility conventions in design decisions
- Custom global CSS (current implementation)

## Getting Started

### 1. Clone repo

```bash
git clone <repo-url>
cd investkaar_screening_task
```

### 2. Install dependencies

```bash
cd backend
bun install
cd ../frontend
bun install
```

### 3. Setup environment variables

Create `backend/.env`:

```env
MONGODB_URI=
PORT=3001
NODE_ENV=development
SCRAPE_SOURCE_URL=https://github.com/trending
SCRAPE_SCHEDULE_CRON=*/1 * * * *
SCRAPE_SCHEDULE_MINUTES=1
SCRAPE_TIMEOUT_MS=10000
SCRAPE_MIN_ITEMS=10
SCRAPE_SCHEDULER_MODE=in-process
```

### 4. Run project

Backend:

```bash
cd backend
bun run dev
```

Frontend:

```bash
cd frontend
bun run dev
```

## API Example

Request:

```http
GET /api/trending?page=1&limit=10
```

Scheduled scrape trigger (external scheduler only):

```http
POST /api/scrape
Authorization: Bearer <SCRAPE_TRIGGER_SECRET>
```

Sample response shape:

```json
{
  "items": [
    {
      "runId": "string",
      "repoId": "owner/repo",
      "title": "string",
      "description": "string | null",
      "language": "string | null",
      "stars": 0,
      "url": "https://github.com/owner/repo",
      "scrapedAt": "ISO date"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 30,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "lastSuccessfulRunAt": "ISO date",
    "isStale": false
  }
}
```

## Project Structure

- `backend/`
  - scraper, scheduler, snapshot services, API routes, models, tests
  - `api/*.ts` serverless handlers for Vercel deployment
- `frontend/`
  - Next.js app router pages, dashboard components, API client, styles

## Vercel Deployment

### Deployment Architecture

- Frontend project (Vercel, root directory: `frontend`):
  - Deploy Next.js App Router app.
  - Set `NEXT_PUBLIC_API_URL` to the backend Vercel URL.
- Backend project (Vercel, root directory: `backend`):
  - Deploy only serverless API handlers in `backend/api`.
  - Do not run in-process cron on Vercel.

### Backend Endpoints (Serverless)

- `GET /api/health`
- `GET /api/meta`
- `GET /api/trending?page=1&limit=10`
- `POST /api/scrape` (protected trigger for scheduled scraping)

### Environment Variables

Frontend (`frontend` Vercel project):

- `NEXT_PUBLIC_API_URL=https://<backend-project>.vercel.app`

Backend (`backend` Vercel project):

- `MONGODB_URI=<mongodb-atlas-uri>`
- `NODE_ENV=production`
- `SCRAPE_SCHEDULER_MODE=external`
- `SCRAPE_TRIGGER_SECRET=<strong-random-secret>`

### Cron Handling (External Scheduler)

Use a scheduler outside Vercel execution runtime and call the protected scrape endpoint.

Example with GitHub Actions schedule:

1. Add repository secret `SCRAPE_TRIGGER_SECRET`.
2. Create a workflow with `on.schedule` (for example every 5 minutes).
3. In the workflow job, call backend endpoint:

```bash
curl -X POST "https://<backend-project>.vercel.app/api/scrape" \
  -H "Authorization: Bearer $SCRAPE_TRIGGER_SECRET"
```

This keeps Vercel serverless functions stateless and avoids long-running cron workers.

## Trade-offs

- Fixed scrape windows instead of dynamic source crawling
- Cron-based refresh over push-based real-time updates
- Simplicity prioritized over distributed scalability in current version

## Future Improvements

- Real-time update channel for client refresh
- Distributed scraper workers and run coordination
- Read-through caching layer for high-traffic API usage
- Auth/role controls if reviewer-only views need protection

## Thinking Process

- Broke the system into clear layers first: scraper, storage, API, frontend.
- Defined deterministic data contract before UI iteration.
- Preferred reliability and consistency over feature breadth.
- Used agent/tooling support for planning and verification, while keeping final implementation decisions manual.
