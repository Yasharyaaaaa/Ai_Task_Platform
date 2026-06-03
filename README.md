# AI Task Platform

A full-stack **asynchronous task-processing platform**. Users register, log in, and submit
text-processing jobs that are queued and executed by a background worker, then watch the
status, results, and logs update on a dashboard.

It follows the classic **producer → queue → consumer** pattern: an Express API produces jobs,
Redis buffers them, and a Python worker consumes them — so the API and the worker scale
independently. The processing step is intentionally simple (basic string operations), making
this a clean template: swap the worker's `process_operation` for real AI/ML inference and you
have a production-shaped pipeline ready to go.

---

## Architecture

```
                 ┌─────────────┐
                 │   Frontend  │  React + Vite (served by Nginx)
                 │   :3000     │
                 └──────┬──────┘
                        │  REST + JWT
                 ┌──────▼──────┐         ┌──────────────┐
                 │   Backend   │ LPUSH   │    Redis     │
                 │  Express 5  ├────────►│  task_queue  │
                 │   :5000     │         └──────┬───────┘
                 └──────┬──────┘                │ BRPOP
                        │                 ┌──────▼──────┐
                  read/write              │   Worker    │
                        │                 │   Python    │
                 ┌──────▼──────────────── ┴─────────────┘
                 │   MongoDB   │  users + tasks
                 │   :27017    │
                 └─────────────┘
```

| Component    | Stack                                          | Role                                                        |
|--------------|------------------------------------------------|-------------------------------------------------------------|
| **frontend** | React 18, Vite, React Router, Axios            | SPA: auth pages, dashboard, task detail. Nginx in prod.     |
| **backend**  | Node.js, Express 5, Mongoose, JWT, bcrypt      | REST API for auth + tasks; enqueues jobs to Redis.          |
| **worker**   | Python, redis-py, pymongo                      | Pops jobs off the queue, runs the operation, writes results.|
| **MongoDB**  | mongo:7                                         | Stores users and tasks.                                     |
| **Redis**    | redis:7                                         | Job queue (`task_queue` list).                              |

---

## How it works

1. **Auth** — `POST /api/auth/register` or `/login` returns a 7-day JWT. Passwords are hashed
   with bcrypt; the token is stored in `localStorage` and attached to every request.
2. **Submit** — `POST /api/tasks` creates a Task in MongoDB (status `pending`) and `LPUSH`es
   `{ taskId }` onto the Redis `task_queue`.
3. **Process** — The worker `BRPOP`s the queue, sets status `running`, runs the operation,
   then writes `success` + result (or `failed`), appending timestamped log entries throughout.
4. **View** — The frontend polls `GET /api/tasks` and `GET /api/tasks/:id` to show live
   status, results, and logs.

### Supported operations

| Operation   | Result                          |
|-------------|---------------------------------|
| `uppercase` | Text in UPPERCASE               |
| `lowercase` | text in lowercase               |
| `reverse`   | Text reversed                   |
| `wordcount` | `Word count: N`                 |

---

## API

All `/api/tasks` routes require an `Authorization: Bearer <token>` header.

| Method | Endpoint              | Auth | Description                          |
|--------|-----------------------|------|--------------------------------------|
| POST   | `/api/auth/register`  | —    | Create account, returns token        |
| POST   | `/api/auth/login`     | —    | Log in, returns token                |
| POST   | `/api/tasks`          | ✓    | Create a task (`title`, `inputText`, `operation`) |
| GET    | `/api/tasks`          | ✓    | List the current user's tasks        |
| GET    | `/api/tasks/:id`      | ✓    | Get a single task                    |
| GET    | `/health`             | —    | Health check                         |

**Rate limiting** (express-rate-limit): a global limiter on all routes, strict on `/api/auth`
(10 req / 15 min) and moderate on `/api/tasks` (100 req / 15 min). Helmet and CORS are enabled.

---

## Data model

**User** — `name`, `email` (unique), `password` (bcrypt-hashed via a pre-save hook).

**Task**
```js
{
  userId,                       // ref: User
  title,
  inputText,
  operation,  // uppercase | lowercase | reverse | wordcount
  status,     // pending | running | success | failed
  result,
  logs: [{ message, timestamp }],
  createdAt, updatedAt
}
```
Indexed on `userId`, `status`, and a compound `{ userId, createdAt }` for fast per-user queries.

---

## Running it

### With Docker Compose (recommended)

Spins up all five services (MongoDB, Redis, backend, worker, frontend):

```bash
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:5000
- MongoDB  → localhost:27017
- Redis    → localhost:6379

> ⚠️ Change `JWT_SECRET` in `docker-compose.yml` before deploying anywhere real.

### Local development

Each service can run on its own. Create the `.env` files from the provided examples first.

**Backend**
```bash
cd backend
cp .env.example .env      # set MONGO_URI, REDIS_URL, JWT_SECRET
npm install
npm run dev               # nodemon on :5000
```

**Worker**
```bash
cd worker
cp .env.example .env      # set MONGO_URI, REDIS_URL
pip install -r requirements.txt
python worker.py
```

**Frontend**
```bash
cd frontend
cp .env.example .env      # set VITE_API_URL (default http://localhost:5000/api)
npm install
npm run dev               # Vite dev server on :3000
```

---

## Environment variables

**backend/.env**
```
MONGO_URI=mongodb://localhost:27017/ai_tasks
REDIS_URL=redis://localhost:6379
JWT_SECRET=change_this_to_a_long_random_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
```

**worker/.env**
```
MONGO_URI=mongodb://localhost:27017/ai_tasks
REDIS_URL=redis://localhost:6379
```

**frontend/.env**
```
# Relative path: Vite proxies /api → backend in dev, nginx does in prod.
# Use a full URL only to point at a remote backend.
VITE_API_URL=/api
```

> 🔒 Never commit real credentials. Use placeholders in `.env.example` and keep actual secrets
> out of version control.

---

## Project structure

```
ai_task_platfrom/
├── docker-compose.yml
├── backend/                # Express REST API
│   └── src/
│       ├── app.js
│       ├── config/         # db.js, redis.js
│       ├── controllers/    # authController.js, taskController.js
│       ├── middleware/      # auth.js, rateLimiter.js, errorHandler.js
│       ├── models/         # User.js, Task.js
│       └── routes/         # authRoutes.js, taskRoutes.js
├── worker/                 # Python queue consumer
│   ├── worker.py
│   └── operations.py
└── frontend/               # React + Vite SPA
    └── src/
        ├── api/            # axios.js
        ├── components/     # Auth/, Layout/, Tasks/
        ├── context/        # AuthContext.jsx
        └── pages/          # Home, Dashboard, TaskDetail
```

---

## Extending it

The worker is the natural extension point. To add real processing, edit
`worker/operations.py` (and the `operation` enum in `backend/src/models/Task.js`) — for
example, call an LLM or run an ML model instead of a string transform. The queue, auth, status
tracking, and logging all keep working unchanged.
