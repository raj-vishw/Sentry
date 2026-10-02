# Contributing to Sentry

Thanks for considering a contribution. This document covers local setup,
how changes get validated, and the conventions this codebase follows.

## Project layout

```
ctf-platform/
├── client/   React 19 + TypeScript + Vite frontend ("Sentry OS" desktop shell)
└── server/   Express 5 + TypeScript + MongoDB backend
```

Each side has its own `README.md` with architecture notes specific to it —
read those before making non-trivial changes:

- [`server/README.md`](server/README.md) — auth architecture, flag
  security, duplicate-solve/race-condition safety, scoring model.
- [`client/README.md`](client/README.md) — the OS shell, theming, state
  management conventions.

## Local development

```bash
git clone <your-fork-url>
cd ctf-platform
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up
```

Or run each side individually without Docker — see the "Development Setup"
section in each README. You'll need Node 22+ and a local or containerized
MongoDB either way.

Seed some sample data (categories, an admin, two sample users, and a few
challenges) for local development:

```bash
cd server && npm run seed
```

For a real deployment, do **not** use the seed script to create the first
admin — use the first-run setup wizard instead (see
[`docs/deployment/self-hosting.md`](docs/deployment/self-hosting.md)).

## Before opening a pull request

Both sides must pass their full validation locally — this is exactly what
CI (`.github/workflows/ci.yml`) runs on every PR:

```bash
# server
cd server && npm run lint && npm test && npm run build

# client
cd client && npm run lint && npx tsc -b && npm test && npm run build
```

- `lint` on the server is `tsc --noEmit`; on the client it's `oxlint`.
- Add tests for new backend behavior (`server/tests/`, Vitest + Supertest
  against an in-memory MongoDB — see `server/tests/helpers/testServer.ts`
  for the pattern every test file follows).
- Keep PRs focused — one feature or fix per PR is easier to review than a
  bundle of unrelated changes.

## Conventions worth knowing before you dig in

- **Compute derived values live, don't cache them.** Points, rank, and
  leaderboard standing are always computed from source data (submissions,
  solved-challenge records), never stored redundantly. If you add a new
  derived value, follow the same pattern.
- **Every admin mutation is independently authorized server-side** via
  `requireRole('ADMIN')` — never rely on the frontend hiding a button as
  the actual access control.
- **Express 5 route ordering matters**: a static path (`/export.csv`,
  `/me`, `/create`) must be registered before a dynamic sibling
  (`/:id`, `/:username`, `/:slug`) sharing the same prefix, or the dynamic
  route swallows it.
- **Distrust client-supplied identity fields.** A request body's `role`,
  `userId`, etc. are never trusted — identity comes from the verified JWT
  (`req.user`), set by `requireAuth`/`attachUserIfPresent` only.

## Reporting bugs / requesting features

Open a GitHub issue. For security vulnerabilities, follow
[`SECURITY.md`](SECURITY.md) instead of a public issue.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md).
