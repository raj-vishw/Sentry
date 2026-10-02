# Getting Started

Sentry is a self-hostable CTF competition platform, presented to players
and admins alike through an original desktop-OS shell ("Sentry OS") rather
than a conventional page-by-page web app.

This page gets you from zero to a running instance on your own machine.
For a production deployment, read
[`docs/deployment/self-hosting.md`](deployment/self-hosting.md) instead —
it covers the same steps plus the things that matter once real participants
are involved (secrets, HTTPS, backups).

## 1. Clone and configure

```bash
git clone <your-repository-url>
cd ctf-platform
cp server/.env.example server/.env
cp client/.env.example client/.env
```

The defaults in both `.env` files work for local development as-is. The
only thing worth changing immediately is `JWT_SECRET`/`JWT_REFRESH_SECRET`
in `server/.env` if you're going to leave this running — see the comments
in that file for how to generate real values.

## 2. Start the stack

```bash
docker compose up
```

This starts MongoDB, the backend API (`:4000`), and the frontend (`:5173`)
together, with your local source bind-mounted for hot reload. No separate
MongoDB/Node install is required for this path.

(If you'd rather run each piece directly on your machine instead of in
Docker — e.g. for backend debugging — see "Development Setup" in
[`server/README.md`](../server/README.md) and
[`client/README.md`](../client/README.md).)

## 3. Open it and create the admin account

Open `http://localhost:5173`. On a fresh database, you'll see a **System
Initialization** screen instead of the login page — this is the first-run
setup wizard. Fill in a username, email, and password; this becomes the
platform's first (and, through this flow, only) administrator account.

This is safe to run exactly once per deployment — once setup completes,
this screen never appears again, and attempting it a second time is
rejected.

## 4. Create your first challenge

Once logged in as the admin, open **Control Center → Challenges → New
Challenge**. See
[`docs/challenges/creating-a-challenge.md`](challenges/creating-a-challenge.md)
for the full walkthrough — categories, flags, hints, files, and the
publish step.

## 5. Share the platform URL

Anyone who can reach the platform's URL can register their own `USER`
account (unless you've turned registration off from **Control Center →
Settings**) and start solving published challenges.

## Local demo data (optional)

If you want sample categories/challenges/users to poke around with instead
of starting from a blank slate, run the seed script against your local
database:

```bash
cd server && npm run seed
```

This is a separate, local-development-only path — it is independent of
the setup wizard and should never be run against a real deployment's
database (see `server/.env.example` for the account values it creates).
