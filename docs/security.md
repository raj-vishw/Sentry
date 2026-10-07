# Security (Deployment Checklist)

This page is about running a deployment safely. For the actual threat
model, mitigations, and how to report a vulnerability, see the root
[`SECURITY.md`](../SECURITY.md) — this page doesn't duplicate that, it's
the practical checklist for an operator going live.

## Before you go live

- [ ] **Real secrets** — `JWT_SECRET`/`JWT_REFRESH_SECRET` are not the
      example placeholders. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- [ ] **Non-default admin path** — `ADMIN_ROUTE_PREFIX` (and the matching
      client `VITE_ADMIN_ROUTE_PREFIX`) is not `admin`. See
      [Configuration](configuration.md).
- [ ] **HTTPS** — terminated at a reverse proxy in front of the frontend
      container (Caddy, Nginx, Traefik). See
      [Self-Hosting](deployment/self-hosting.md).
- [ ] **`CLIENT_URL` matches your real domain** — wrong values here
      manifest as CORS errors, and a too-broad value weakens the CORS
      allow-list's whole point.
- [ ] **The setup wizard was used to create the admin**, not
      `npm run seed` (which prints its credentials and is for local
      development only).
- [ ] **Registration policy decided** — leave it on for an open CTF,
      turn it off once your roster is final (Control Center → Settings).
- [ ] **Backups are actually happening** — see [Backups](backups.md),
      not just configured once and forgotten.

## If you're running a public demo (`DEMO_MODE=true`)

- The demo's admin credentials must never be shared publicly — `DEMO_MODE`
  gates the reset endpoint's existence, it is not a substitute for keeping
  admin access private.
- Expect the leaderboard/challenge set to be reset periodically (that's
  what the reset endpoint is for) — tell visitors this plainly (the
  `/demo` landing page already does).
- Don't point `DEMO_MODE=true` at a deployment that also hosts a real
  competition's data — the reset wipes all non-admin accounts and all
  challenges.

## Keeping up to date

Watch the repository for releases and re-read
[`CHANGELOG.md`](../CHANGELOG.md) before updating — a security fix will
be called out there. See [Self-Hosting](deployment/self-hosting.md)'s
"Updating" section for the actual update procedure.
