# AI Task Platform — Analysis & Completion Roadmap

> **Status (2026-06-11): Phases 1–4 complete and pushed to GitHub.** The original
> roadmap below is fully delivered — real Claude AI, the full task feature set,
> 41 passing tests, CI, structured logging, OpenAPI docs, readiness probes, and a
> worker dead-letter queue. The bug/feature lists are kept for historical context;
> see **Phase status** and **What's next** for the current picture.

## Phase status

| Phase | Scope | Status |
|---|---|---|
| 0 — Initialize | Dedicated git repo + first commit | ✅ Done |
| 1 — Stabilize | Global error handler, validation (400s), Redis guard, 401 auto-logout, axios timeout, Dashboard errors, TaskDetail polling fix | ✅ Done |
| 2 — Real AI | Claude-backed ops (summarize/rewrite/translate/keywords/sentiment/explain/custom), prompt+model fields, token logging, prompt caching | ✅ Done |
| 3 — Feature set | Status filter + search + pagination, re-run (PUT) & delete (DELETE), shared op config, toasts | ✅ Done |
| 4 — Quality & Ops | 41 tests (Jest/supertest, pytest, Vitest), GitHub Actions CI, pino + structlog logging, OpenAPI/Swagger, readiness probe, dead-letter queue + retry, JWT_SECRET via env | ✅ Done |

## Overview

This is a full-stack **asynchronous task-processing platform** built on a producer → queue → consumer pattern. It started as a fresh scaffold with no real AI, no tests, no CI, and several concrete bugs — all addressed across Phases 1–4.

---

## Architecture (as-is)

| Service | Stack | Port | Role |
|---|---|---|---|
| Frontend | React 18 + Vite, React Router 6, Axios, Context API | 3000 | SPA: auth, dashboard, task detail with polling |
| Backend | Express 5, Mongoose 9, JWT, bcrypt, helmet, rate-limit | 5000 | REST API: auth + task CRUD, enqueues to Redis |
| Worker | Python 3.11, `worker/worker.py` + `operations.py` | — | BRPOP consumer, runs operation, writes status/logs |
| MongoDB | v7 | 27017 | users + tasks |
| Redis | v7 | 6379 | FIFO queue `task_queue` |

**Flow:** submit task → stored in Mongo (`pending`) + pushed to Redis → worker consumes, sets `running` → `success`/`failed`, appends logs → frontend polls `GET /tasks/:id` every 3s.

---

## Current Features (what exists)

- User registration/login — bcrypt (12 rounds), JWT (7-day expiry), password-strength meter on register
- JWT auth middleware + axios interceptor attaching `Bearer` token
- Task create / list (filter + search + paginate) / get-by-id / re-run / delete, all user-scoped
- 4 string ops (`uppercase`, `lowercase`, `reverse`, `wordcount`) **+ Claude AI ops** (`summarize`, `rewrite`, `translate`, `keywords`, `sentiment`, `explain`, `custom`) with model selection
- Live status (pending/running/success/failed) with color-coded badges + activity logs (incl. token usage)
- Dashboard with stats cards (total/pending/running/success/failed)
- Rate limiting (global 300, auth 10, tasks 100 / 15min), Helmet, CORS
- Mongo indexes: `userId`, `status`, compound `{userId, createdAt}`
- Full Docker Compose (5 services, health checks, non-root images, multi-stage builds, prod Nginx reverse-proxy)
- Comprehensive README

---

## Errors & Bugs (prioritized)

### High
1. **No global error handler.** `backend/src/middleware/errorHandler.js` is an empty file and is **never imported** in `backend/src/app.js`. Unhandled errors fall through to Express defaults.
2. **No input validation.** `createTask` and the auth controller trust `req.body` directly — no checks on email format, password length, title/inputText presence, or `operation` value (only the Mongo enum guards it, surfacing as a 500 instead of a 400).
3. **Redis client not null-guarded.** `taskController.js` calls `getRedisClient()` then immediately `lPush`; if Redis is down the task is saved as `pending` but never enqueued (silent stuck task), or throws.

### Medium
4. **401s don't auto-logout on the frontend.** Axios has a request interceptor but no response interceptor — an expired token leaves the user "logged in" with silently failing requests.
5. **No token validation on app load.** `AuthContext` restores the user from `localStorage` without verifying the token.
6. **Dashboard swallows fetch errors** — `catch` only `console.error`s; the user sees an empty list instead of an error.
7. **TaskDetail polling effect keyed on `task?.status`** — re-runs and risks stacking intervals / extra requests. Should key on `id` only and gate inside.
8. **No request timeout on axios** — hung requests block the UI indefinitely.

### Low / polish
9. `STATUS_FILTERS` defined in `TaskList.jsx` but never wired up (dead code, half-built filter).
10. Operation icons/labels hard-coded in `TaskForm`/`TaskCard` — adding a backend operation silently breaks the UI.
11. No success toast after task creation; no loading skeleton on Dashboard.
12. `GET /tasks` returns **all** tasks unbounded (no pagination).
13. Generic `{ message: err.message }` responses risk leaking internals; no structured logging anywhere (console only).
14. `docker-compose.yml` has a hard-coded `JWT_SECRET` instead of sourcing `.env`.

---

## How Much Work Was Left (now done)

| Area | Status |
|---|---|
| Core task pipeline | ✅ Done |
| Bug fixes (items 1–8 above) | ✅ Done (Phase 1) |
| Real AI processing (Claude) | ✅ Done (Phase 2) |
| Update/Delete task endpoints | ✅ Done (Phase 3) |
| Validation + global error handler | ✅ Done (Phase 1) |
| Tests (backend + worker + frontend) | ✅ Done — 41 tests (Phase 4) |
| CI/CD (GitHub Actions) | ✅ Done (Phase 4) |
| UX polish (filters, pagination, toasts, auto-logout) | ✅ Done (Phases 1 & 3) |

---

## Suggested New Features

**AI / core value (priority — using Anthropic Claude):**
- Replace `worker/operations.py` `process_operation()` with real **Claude API** calls. Add operations like `summarize`, `rewrite`, `translate`, `extract-keywords`, `sentiment`, `qa`. Keep the existing 4 string ops as a free/offline fallback.
- Stream or chunk long inputs; record token usage + cost per task in `Task.logs`.
- Add a `model` + `prompt`/`systemPrompt` field to the Task schema so users pick the Claude model and steer the operation.

**Product features:**
- Task **filtering** (wire up `STATUS_FILTERS`), **search**, **pagination**, **delete**, and **re-run**.
- **WebSocket / SSE** live updates to replace 3s polling.
- **Usage quotas / billing tier** per user; per-user rate limits.
- **File/document input** (upload `.txt`/`.pdf`, process with Claude).
- **Profile / settings** page; password reset + email verification; refresh-token rotation.
- **Export results** (copy, download as `.txt`/`.json`).

**Platform maturity:**
- Structured logging (pino/winston backend, structlog worker) + request IDs.
- Health/readiness probes that check Mongo + Redis; worker heartbeat.
- OpenAPI/Swagger docs.
- Metrics (Prometheus) + a simple admin dashboard.
- Dead-letter queue + retry/backoff for failed tasks.

---

## Roadmap (phased) — ✅ all delivered

### Phase 0 — Initialize ✅
- `git add` + initial commit (currently zero commits) so progress is tracked.

### Phase 1 — Stabilize (fix the bugs) ✅
- Implement `errorHandler.js` and mount it last in `app.js`; convert controllers to `next(err)`.
- Add validation (lightweight `express-validator` or hand-rolled guards) on auth + task create → return 400s.
- Null-guard Redis in `taskController.js`; if enqueue fails, mark task `failed` with a log instead of leaving it stuck.
- Frontend: axios response interceptor → auto-logout on 401; add request timeout; surface Dashboard fetch errors; fix TaskDetail polling effect deps.

### Phase 2 — Real AI (Anthropic Claude) ✅
- Add `anthropic` SDK to `worker/requirements.txt`; read `ANTHROPIC_API_KEY` from env (add to `.env.example` + compose).
- Rewrite `worker/operations.py` to route AI operations through Claude (default `claude-opus-4-8` for quality / `claude-haiku-4-5` for speed); keep string ops as fallback. **Use prompt caching** for any shared system prompt.
- Extend `Task` operation enum + frontend operation pills; add optional `prompt`/`model` fields.
- Log token usage + latency into `task.logs`.

### Phase 3 — Complete the feature set ✅
- Add `PUT /tasks/:id` (re-run) and `DELETE /tasks/:id`; wire delete/re-run buttons in `TaskCard`/`TaskDetail`.
- Implement status filtering (`STATUS_FILTERS`), search, and pagination (`GET /tasks?status=&page=&limit=`).
- Toasts + Dashboard loading skeleton; drive operation metadata from a shared config so backend/frontend stay in sync.

### Phase 4 — Quality & Ops ✅
- Tests: backend (Jest + supertest for auth/task routes), worker (pytest for operations), frontend (Vitest + React Testing Library for forms/auth).
- GitHub Actions: lint + test + docker build on PR.
- Structured logging; move `JWT_SECRET` to `.env`; OpenAPI doc; dead-letter queue + retry in worker.

---

## What's next (beyond the original roadmap)

The roadmap is complete; these are optional enhancements, roughly by value:

- **Live updates** — replace the 3s polling in `TaskDetail`/`Dashboard` with WebSocket or SSE pushed from the worker.
- **Verify CI is green** on GitHub Actions (watch the first `docker-build` run in particular).
- **Dead-letter visibility** — surface `task_dead_letter` entries (admin view or a retry-from-DLQ endpoint).
- **Auth hardening** — password reset + email verification, refresh-token rotation.
- **File/document input** — upload `.txt`/`.pdf` and process with Claude.
- **Quotas & metrics** — per-user usage limits, Prometheus metrics + a small admin dashboard.
- **Export results** — copy / download task results as `.txt`/`.json`.

---

## Verification

- **Run the stack:** `docker compose up --build` (or run Mongo/Redis via compose and `npm run dev` in `backend/`, `npm run dev` in `frontend/`, `python worker/worker.py`).
- **Smoke test the flow:** register → login → create a task for each operation → confirm status transitions `pending → running → success` and the result appears in `TaskDetail`.
- **AI check (Phase 2):** submit a `summarize` task with a paragraph; confirm a real Claude-generated summary plus token-usage log entry.
- **Bug-fix checks:** hit a route with a bad/expired token → expect auto-logout; POST a task with a missing field → expect `400` (not `500`); stop Redis → create a task → expect it marked `failed` with a clear log, not stuck `pending`.
- **Tests (Phase 4):** `npm test` (backend + frontend) and `pytest` (worker) green in CI.
