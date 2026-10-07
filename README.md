# Sentry — Open-Source, Self-Hostable CTF Platform

Sentry is a full-stack competitive cybersecurity challenge platform you can
clone, configure, and run your own CTF on — no SaaS account, no vendor
lock-in, your data stays on your server. Players solve challenges across
eight categories, earn points, climb a leaderboard, and compete solo or in
teams; admins manage the entire competition — challenges, users, teams,
submissions — from a single console. Two roles: `USER` and `ADMIN`.

The whole experience, for players and admins alike, is presented as
**Sentry OS** — an original desktop-environment UI (boot sequence,
draggable/resizable windows, a dock, a command palette, selectable
wallpapers) instead of a conventional page-by-page web app. Sentry OS
lives at `/app`; `/`, `/docs`, and `/demo` are public pages that never
require an account.

## Live demo

Want to try it before self-hosting? Run `npm run seed:demo` with
`DEMO_MODE=true` set and visit `/demo` — a real, playable CTF with 15
original challenges across five categories, reset on demand by an admin.
Demo data may be reset at any time; don't use a demo deployment for a
real competition.

## Features

- **Challenges** — categories, difficulty, flags, point-costed hints,
  attached files, prerequisite/unlock chains, first blood tracking.
  STATIC/INTERACTIVE/HYBRID challenge types (interactive execution is a
  real data model/API today, not yet a real running environment — see
  `docs/challenges/interactive-challenges.md`), a DRAFT/PUBLISHED/ARCHIVED
  lifecycle, and portable challenge packages (versioned manifest + zip,
  import/export between instances).
- **Scoring & competition** — fixed-point scoring, teams (create/join via
  invite code), a live global/weekly/monthly leaderboard, streaks,
  achievements/badges.
- **Writeups** — player-submitted, admin-moderated, publicly readable once
  approved.
- **Public profiles** — `/profile/:username`, no login required.
- **Admin console** — challenge/user/team/submission/category/writeup
  management, platform statistics, a full audit log, CSV export, and
  submission invalidation.
- **Self-hosting first-class**: a browser-based first-run setup wizard (no
  database shell required to create the first admin), platform settings
  configurable at runtime (branding, registration toggle, maintenance
  mode — no code or `.env` changes needed), health check endpoints, and a
  Docker Compose setup for both development and production.
- **Customization without touching source**: platform branding (name,
  logo, favicon, accent color, boot message) and competition-level
  settings (name, description, rules, start/end time, leaderboard
  visibility) are both configured from the admin console and applied at
  runtime — see [`docs/customization.md`](docs/customization.md).
- **In-app docs** at `/docs`, and a public, resettable **live demo** at
  `/demo` (see above) — both served straight from this repo, no separate
  deployment.
- **Security**: JWT access/refresh auth, a configurable non-default admin
  API route, split public/admin login surfaces, per-endpoint rate
  limiting, hashed flags never returned by any API response.

## Quick start

```bash
git clone <your-repository-url>
cd ctf-platform
cp server/.env.example server/.env
cp client/.env.example client/.env
docker compose up
```

Open `http://localhost:5173` — you'll land on the first-run setup wizard
to create your admin account, then straight into Sentry OS at `/app`. See
[`docs/getting-started.md`](docs/getting-started.md) for the full walkthrough,
including creating your first challenge.

Deploying for a real competition instead of local development? See
[`docs/deployment/self-hosting.md`](docs/deployment/self-hosting.md).

## Structure

```
ctf-platform/
├── client/   React + TypeScript + Vite frontend — "Sentry OS" (see client/README.md)
├── server/   Node + Express + TypeScript + MongoDB backend (see server/README.md)
└── docs/     Getting started, self-hosting, challenge creation, administration
```

## Documentation

- [Walkthrough](docs/walkthrough.md) — a plain-language tour of the whole
  site, for players and admins alike.
- [Getting Started](docs/getting-started.md)
- [Self-Hosting](docs/deployment/self-hosting.md)
- [Configuration](docs/configuration.md) ·
  [Customization](docs/customization.md) ·
  [Backups](docs/backups.md) · [Security](docs/security.md)
- [Creating a CTF](docs/creating-a-ctf.md)
- [Creating a Challenge](docs/challenges/creating-a-challenge.md)
- [Challenge Types](docs/challenges/challenge-types.md)
- [Challenge Package Format](docs/challenges/challenge-packages.md) ·
  [Importing](docs/challenges/importing.md) ·
  [Exporting](docs/challenges/exporting.md)
- [Interactive Challenges](docs/challenges/interactive-challenges.md)
- [Administration Overview](docs/administration/overview.md)
- [Architecture Overview](docs/architecture/overview.md) ·
  [Storage](docs/architecture/storage.md) ·
  [Challenge Runtime](docs/architecture/challenge-runtime.md)
- [`server/README.md`](server/README.md) — backend architecture, auth
  design, scoring/leaderboard model.
- [`client/README.md`](client/README.md) — frontend architecture, the OS
  shell, theming.

## Contributing

Contributions are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) for
local setup and what CI checks on every PR. This project follows the
[Contributor Covenant](CODE_OF_CONDUCT.md).

## Security

Found a vulnerability? Please follow [`SECURITY.md`](SECURITY.md) rather
than opening a public issue.

## License

[MIT](LICENSE).
