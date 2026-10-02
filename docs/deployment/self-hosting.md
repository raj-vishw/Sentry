# Self-Hosting

This covers running Sentry for a real competition, not just local
development — see [`docs/getting-started.md`](../getting-started.md) for
the quick local version of these same steps.

## Requirements

- A machine reachable by participants (a VPS, a dedicated server, a cloud
  VM, or a machine on your local network for an in-person event).
- Docker + Docker Compose. Nothing else — MongoDB and both app processes
  run as containers; no separate Node or MongoDB install is required.

## 1. Configure secrets

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

At minimum, change these in `server/.env` before exposing the platform to
anyone:

| Variable | Why it matters |
|---|---|
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Signs session tokens. The example values are obvious placeholders — generate real ones: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_ROUTE_PREFIX` | The admin API is mounted at `/api/v1/<this value>` instead of the predictable `/api/v1/admin` — defense-in-depth against automated scanners, not a replacement for the real `requireRole('ADMIN')` check underneath. Generate something non-guessable: `node -e "console.log(require('crypto').randomBytes(8).toString('hex'))"` |
| `MONGODB_URI` | Only needs to change if you're pointing at a MongoDB you manage yourself instead of the one `docker-compose.yml` provisions. |
| `CLIENT_URL` | Must match the real URL(s) participants use, comma-separated if more than one (e.g. `http://`/`https://` during a migration). Wrong values here manifest as CORS errors. |

If you changed `ADMIN_ROUTE_PREFIX`, set the matching
`VITE_ADMIN_ROUTE_PREFIX` in `client/.env` to the same value — the
frontend needs to know where to find the admin API. This value ends up in
the built JS bundle (like every `VITE_`-prefixed variable), so it's not a
secret — it only deters mass-scanning bots, not a targeted attacker who
already has your frontend bundle.

## 2. Start the production stack

```bash
docker compose -f docker-compose.production.yml up -d
```

Unlike the local dev compose file, this one:

- Builds the production Dockerfiles (an nginx-served static frontend, a
  compiled backend) instead of running dev servers with hot reload.
- Never exposes MongoDB's port to the host — only reachable by the other
  containers on the compose network.
- Reads every secret from the environment instead of hardcoding dev
  placeholders — it refuses to start if `JWT_SECRET`, `JWT_REFRESH_SECRET`,
  or `CLIENT_URL` aren't set.

This stack has no TLS termination and no managed MongoDB built in — see
"HTTPS" and "Reverse proxy" below for what you still need to add.

## 3. Reverse proxy and HTTPS

Put a reverse proxy (Nginx, Caddy, or Traefik all work fine) in front of
the frontend container and terminate TLS there — the application itself
doesn't manage certificates. A minimal shape:

```
Internet → HTTPS reverse proxy → frontend container (:80) → backend API
```

Caddy is the least configuration for a first deployment (automatic
Let's Encrypt certificates from just a domain name in its Caddyfile); Nginx
or Traefik work the same way with more config.

## 4. Open it and run the setup wizard

Visit your domain. You'll see the **System Initialization** screen — this
creates the platform's first admin account through the browser, safely
runnable exactly once (see `server/src/services/setup.service.ts` if
you're curious how the "exactly once, even under concurrent requests" part
is enforced). There is no other supported way to create the first admin
on a real deployment — don't run `npm run seed` against production data;
that script is for local development only and prints its credentials to
the console.

## 5. Configure the platform

From **Control Center → Settings** (admin-only), you can change without
touching any code or environment variable:

- **Platform name / description** — shown in the UI.
- **Registration enabled** — turn off once your roster is final, so no new
  accounts can be created while the competition runs.
- **Maintenance mode** — immediately blocks every non-admin request
  platform-wide (useful during a mid-event configuration change). Admin
  accounts are always exempt, including the admin login route itself, so
  you can never lock yourself out.

## Data persistence

MongoDB's data and uploaded challenge files live in named Docker volumes
(`mongo_data`, `uploads_data`), not inside the containers themselves —
`docker compose down` followed by `docker compose up -d` does not lose
data. Only `docker compose down -v` (or manually removing the volumes)
does.

## Backups

There's no bespoke backup tool — use MongoDB's own standard tools against
the running container:

```bash
# Backup
docker compose exec mongodb mongodump --archive --gzip > backup-$(date +%F).gz

# Restore (into a running, empty deployment)
docker compose exec -T mongodb mongorestore --archive --gzip < backup-2026-01-01.gz
```

Uploaded challenge files live in the `uploads_data` volume — back that up
the same way you'd back up any Docker volume
(`docker run --rm -v uploads_data:/data -v $(pwd):/backup alpine tar czf /backup/uploads.tar.gz /data`).

## Updating

```bash
git pull
docker compose -f docker-compose.production.yml up -d --build
```

Every schema change so far has been additive (new optional fields with
defaults) — there is no migration step to run. If a future release
introduces a breaking schema change, it will be called out explicitly in
[`CHANGELOG.md`](../../CHANGELOG.md) with its own upgrade instructions.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Setup wizard appears again after you already created an admin | You're looking at a different MongoDB than the one setup ran against — e.g. you switched between the dev compose file's database and the production one. Confirm `MONGODB_URI` and which `docker-compose*.yml` you're running. |
| "Invalid credentials" on the admin login page | Admin accounts authenticate only through the hidden admin route, never the normal `/login` page used by players — make sure you're on the right page, and that `ADMIN_ROUTE_PREFIX`/`VITE_ADMIN_ROUTE_PREFIX` match between `server/.env` and `client/.env`. |
| CORS errors in the browser console | `CLIENT_URL` in `server/.env` doesn't match the URL you're actually visiting the frontend from. |
| Container won't start, port already in use | Something else on the host is already bound to `4000`/`5173`/`27017`/`80` — change the host-side port mapping in the compose file, or stop the conflicting process. |
| Upload fails with a permission error | The `uploads` directory inside the backend container isn't writable — check the `uploads_data` volume mount in your compose file hasn't been overridden. |
