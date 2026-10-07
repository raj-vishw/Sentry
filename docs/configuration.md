# Configuration

Two `.env` files — `server/.env` and `client/.env` — and a handful of
database-backed admin settings (see
[`customization.md`](customization.md) and
[`administration/overview.md`](administration/overview.md)). Nothing is
scattered beyond these; the backend reads every environment variable
through one validated module (`server/src/config/env.ts`), not ad-hoc
`process.env` reads spread across the codebase.

## `server/.env`

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No (default `4000`) | |
| `NODE_ENV` | No (default `development`) | `development` \| `test` \| `production` |
| `MONGODB_URI` | **Yes** | MongoDB connection string. |
| `JWT_SECRET` | **Yes** | At least 16 characters. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | **Yes** | Same as above, a different value. |
| `JWT_ACCESS_EXPIRES_IN` | No (default `15m`) | |
| `JWT_REFRESH_EXPIRES_IN` | No (default `7d`) | |
| `CLIENT_URL` | No (default `http://localhost:5173`) | Comma-separated if more than one origin needs to make credentialed requests. |
| `ADMIN_ROUTE_PREFIX` | No (default `admin`) | Change this for every real deployment — see [Self-Hosting](deployment/self-hosting.md). Must match the client's `VITE_ADMIN_ROUTE_PREFIX`. |
| `DOCS_DIR` | No | Where the repo's `docs/` folder lives on disk. Leave unset for bare-metal dev; both Docker compose files set it explicitly. |
| `DEMO_MODE` | No (default `false`) | Only set `true` on a deployment meant to be a public demo. See [Getting Started](getting-started.md). |
| `SEED_ADMIN_*`, `SEED_USER*_*` | Only for `npm run seed`/`npm run seed:demo` | Local development/demo seed credentials — never used in the real setup-wizard flow. |

## `client/.env`

Only non-secret, browser-exposed values belong here — Vite inlines every
`VITE_`-prefixed variable into the built JS bundle.

| Variable | Required | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | No | Backend API base URL, if not same-origin. |
| `VITE_ADMIN_ROUTE_PREFIX` | No (default `admin`) | Must match the backend's `ADMIN_ROUTE_PREFIX` exactly. |

## Database-backed settings

Everything an admin can change from **Control Center → Settings** and
**Control Center → Competition** — platform branding, registration
toggle, maintenance mode, competition name/description/rules/dates,
leaderboard visibility — lives in MongoDB, not in an environment
variable, and takes effect immediately without a restart. See
[`customization.md`](customization.md).

## A note on naming

If you've seen other self-hosted projects use `DATABASE_URL`/`APP_URL`
as generic names: this project intentionally keeps `MONGODB_URI` and
`CLIENT_URL` instead. They mean the same thing — renaming working,
already-documented, already-tested variable names for naming-convention
purity alone wasn't worth the churn.
