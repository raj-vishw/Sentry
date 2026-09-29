# Sentry — Backend (Phase 2)

Production-oriented Express + TypeScript + MongoDB backend for the Sentry
CTF platform: authentication, RBAC, challenge management, and the flag
submission/scoring engine.

## Tech Stack

Node.js, Express 5, TypeScript, Mongoose (MongoDB), Zod, JWT, bcrypt,
Helmet, CORS, express-rate-limit, Pino (structured logging), Multer (file
uploads), Vitest + Supertest + mongodb-memory-server (tests).

## Architecture

```
src/
├── config/       env validation, database connection, security (CORS/Helmet), uploads
├── controllers/  thin HTTP layer — parse request, call a service, send response
├── services/     all business logic lives here
├── models/       Mongoose schemas (User, Category, Challenge, Hint, Submission)
├── routes/       route wiring + which middleware guards which endpoint
├── middleware/   auth, RBAC, validation, rate limiting, centralized error handling
├── validators/   Zod schemas — the backend's authoritative validation
├── utils/        jwt, password/flag hashing, errors, response shape, logger
├── scripts/      seed.ts (development-only data)
├── app.ts        Express app assembly (no listening)
└── server.ts     boot: connect DB, listen, graceful shutdown
```

Controllers never touch Mongoose directly — that's the services' job — and
services never touch `req`/`res`. This keeps the business logic (and its
tests) independent of HTTP.

## Authentication Architecture

Short-lived **access token** (JWT, default 15m) + long-lived **refresh
token** (JWT, default 7d) with rotation:

- On login/register/refresh, the access token is returned **in the JSON
  body only**. The frontend keeps it in memory (a Zustand store that is
  explicitly *not* persisted to localStorage) and attaches it as
  `Authorization: Bearer <token>`. It is never written to localStorage,
  a cookie, or anywhere else — that's what keeps it inaccessible to an XSS
  payload.
- The refresh token is set as an **HttpOnly cookie**, scoped to
  `/api/v1/auth`, `Secure` in production, `SameSite=Lax`. Being HttpOnly
  means frontend JavaScript can never read it, only the browser can send it
  back automatically to the refresh/logout endpoints.
- **Rotation**: every user has a `tokenVersion` counter. A refresh token
  embeds the version it was issued with. `POST /auth/refresh` checks the
  version matches, then *increments* it and issues a new pair — so the
  refresh token just used can never be replayed again. Logout also
  increments the version, invalidating every outstanding refresh token
  immediately (effectively a server-side session kill switch, without
  needing a token blocklist).
- **Session restoration**: on app load, the frontend calls `POST
  /auth/refresh` once (the cookie is sent automatically) to silently obtain
  a fresh access token if a valid session cookie exists, otherwise the user
  is simply logged out.

### Why not just localStorage for everything?

A token in localStorage is readable by any script running on the page —
one dependency with an XSS bug and every session is compromised. Keeping
the access token in memory and the refresh token in an HttpOnly cookie
means an XSS payload can, at worst, use the app as the logged-in user while
the tab is open; it cannot exfiltrate a long-lived credential.

### Dev/prod cookie note

The client dev server proxies `/api` to this backend (see
`client/vite.config.ts`), so the browser sees them as the same origin and
`SameSite=Lax` cookies work without needing `Secure`/HTTPS locally. In
production, deploy behind the same reverse-proxy pattern (frontend and
`/api` on one origin) so this continues to hold; if you ever split them
across real origins, switch to `SameSite=None; Secure` and serve both over
HTTPS.

## Flag Security

- Flags are **never** stored in plaintext — only a bcrypt hash
  (`Challenge.flagHash`, `select: false` so it's excluded from every query
  by default, including the admin edit-form fetch).
- The flag is never present in any API response, ever — not on create, not
  on the admin edit form (which can only *replace* the flag, never read
  it), not on the public challenge detail endpoint.
- A submitted flag is compared with `bcrypt.compare` (constant-time) and
  otherwise only ever touches a one-way SHA-256 audit digest
  (`Submission.submittedFlagHash`) — the plaintext guess is never persisted.
- Wrong-flag responses are deliberately generic (`"Incorrect flag."`) and
  never hint at partial correctness.

## Duplicate-Solve & Race-Condition Safety

`Submission` has a **unique partial index** on `{ user, challenge }` where
`correct: true`. The application also checks "already solved" before
awarding points, but the index is the actual guarantee: if two correct
submissions from the same user ever race each other, MongoDB itself rejects
the second insert, and that request is told "already solved" instead of
double-awarding points. See `models/Submission.ts` and
`services/submission.service.ts`.

## Deletion Strategy (Challenges)

Deleting a challenge is a **hard delete** of the `Challenge` document and
its `Hint` documents, plus removal of its uploaded files from disk.
**Submissions are deliberately left in place** — they're an audit/abuse
log, not a live reference that needs to stay consistent with the challenge
catalog, and preserving them keeps historical analytics and audit trails
intact even after a challenge is retired. A dangling `Submission.challenge`
reference is an acceptable, documented trade-off; it is never treated as
"live" data.

## Admin Accounts

There is no public way to become an ADMIN — registration always creates a
`USER`, and the role is never read from the request body (see
`services/auth.service.ts`). For development, `npm run seed` creates one
obvious, printed-to-console dev admin account. **For a real deployment,
provision the first admin by hand** — e.g. run the seed script against a
disposable database, or insert a document directly with a properly hashed
password:

```ts
import { hashPassword } from './src/utils/password.js';
// role: 'ADMIN', passwordHash: await hashPassword('...')
```

## API Response Shape

```jsonc
// success
{ "success": true, "data": { ... } }
// error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] } }
```

Error `code`s: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN`
(403), `NOT_FOUND` (404), `CONFLICT` (409), `RATE_LIMITED` (429),
`INTERNAL_ERROR` (500).

## Development Setup

```bash
cp .env.example .env      # fill in real secrets for anything beyond local dev
npm install
npm run seed               # optional: dev admin + sample users/challenges
npm run dev                 # http://localhost:4000
```

Requires a running MongoDB reachable at `MONGODB_URI` (see
`docker-compose.yml` at the repo root for a one-command local Mongo, or run
your own). The automated test suite does **not** need this — it boots its
own isolated in-memory MongoDB per test file via `mongodb-memory-server`.

## Scripts

| Script            | Description                                    |
| ------------------ | ----------------------------------------------- |
| `npm run dev`       | Start the API with hot reload (tsx watch)       |
| `npm run build`     | Type-check and compile to `dist/`               |
| `npm start`         | Run the compiled build                          |
| `npm run seed`      | Reset and seed development data                 |
| `npm test`          | Run the backend test suite once                 |
| `npm run test:watch`| Run tests in watch mode                         |
| `npm run lint`      | Type-check without emitting (`tsc --noEmit`)    |

## Testing

38 tests across authentication, RBAC, challenge CRUD/publishing, flag
submission (correct/incorrect/duplicate/points), and the rate-limit
mechanism. Each test file boots an isolated in-memory MongoDB instance —
nothing touches a real database, and nothing needs Docker to run.

## What's Out of Scope for Phase 2

Documented here rather than left silently unfinished:

- **Teams and the public leaderboard** still run on the Phase 1 frontend
  mocks — no backend model/endpoints were requested for them this phase.
- **Admin user/team management** (listing, banning, etc.) is not wired to
  a backend endpoint; the Phase 1 admin UI for those screens still shows
  mock data.
- **Audit log storage** (section "Audit Foundation") — the data model
  supports it (every write path is centralized in a handful of service
  functions), but no `AuditLog` collection or write-path was added yet.
- **Hint unlock costs** are implemented (`POST
  /challenges/:id/hints/:hintId/unlock` deducts points once, idempotently)
  but there's no UI affordance yet to show a user their remaining points
  before unlocking.
