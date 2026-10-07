# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/) once the first tagged release
ships.

## [Unreleased]

This is a retroactive baseline of the feature set as of the open-source
self-hosting foundation work, not a reconstruction of every prior commit.

### Added

- Public product routing: the authenticated app now lives under `/app`
  (`/app/dashboard`, `/app/admin/...`, etc.) alongside a genuinely public
  site at `/` (marketing landing), `/docs` (in-app documentation browser,
  backend-served from the repo's `docs/` folder), and `/demo` (live-demo
  landing page). Components shared between the public and authenticated
  experience (challenge cards, leaderboard, writeups, command palette,
  landing CTAs) are now auth-aware so a logged-in visitor always lands
  back in their OS, not the logged-out page.
- Demo mode: a backend-enforced `DEMO_MODE` env flag, a 15-challenge demo
  seed script (`npm run seed:demo`), and an admin-only, rate-limited
  `POST /admin/demo/reset` endpoint that only exists (404s otherwise) when
  `DEMO_MODE=true` — never a publicly triggerable reset.
- Competition settings, modeled separately from platform settings: name,
  description, rules, start/end time (display-only), and leaderboard
  visibility (`public`/`hidden`, with real enforcement — non-admins see a
  "hidden" placeholder, admins always see live standings). New admin
  Control Center section at `/app/admin/competition`.
- Platform branding extended: logo URL, favicon URL, accent color, and a
  custom boot-screen message, configurable from Settings with no code or
  `.env` changes, applied at boot via a new public, no-auth
  `GET /api/v1/public/platform-config` endpoint.
- `scripts/backup.sh` / `scripts/restore.sh` — copy-pasteable wrappers
  around the `mongodump`/`mongorestore` + uploads-volume commands already
  documented in `docs/deployment/self-hosting.md`.
- New docs: `configuration.md`, `customization.md`, `backups.md`,
  `security.md` (deployment/ops posture), `creating-a-ctf.md`,
  `contributing.md`.
- Fixed a critical stale-filter bug: 9 query sites across 6 services still
  filtered on a `published: true` field removed by an earlier migration to
  a `status` enum; because Mongoose's `strictQuery` silently drops unknown
  filter keys rather than erroring, this let a player submit a correct
  flag against a `DRAFT`/`ARCHIVED` challenge and get credited for it.
  Regression test added.
- Core CTF engine: categories, challenges (flags, hints with a point cost,
  attached files, difficulty, points), flag submission with duplicate-solve
  and race-condition safety, challenge prerequisites/unlock chains, first
  blood tracking.
- Accounts and teams: JWT access/refresh authentication, role-based access
  control (`USER`/`ADMIN`), team creation/joining via invite code with
  live-computed standings.
- Leaderboard: global/weekly/monthly rankings, team rankings, "your
  position" even when off-page, streak tracking.
- Writeups: draft → submitted → published/rejected workflow, public
  writeup pages, admin moderation.
- Achievements/badges: a fixed catalog (first solve, solve-count
  milestones, streaks, first blood, category mastery, published writeup,
  team founder), surfaced on profiles and public profile pages
  (`/profile/:username`).
- Admin console: dashboard, challenge/user/team/submission/category/
  writeup management, statistics, audit log, CSV export (users,
  submissions), submission invalidation (reverses points/solve
  count/leaderboard effect), configurable platform settings (branding,
  registration toggle, maintenance mode).
- First-run setup wizard — creates the first admin account through the
  browser instead of requiring direct database or script access.
- Security hardening: a configurable, non-default admin API route prefix;
  split public/admin login surfaces; per-endpoint rate limiting (admin
  accounts exempt); audit logging for every admin mutation.
- "Sentry OS" desktop-shell presentation layer: boot sequence, draggable/
  resizable windows, dock, command palette (Ctrl+K), 7 wallpapers, dark
  and light themes, adjustable accent color.
- Open-source self-hosting foundation: Docker Compose (dev and production
  variants), health check endpoints, CI (lint/typecheck/test/build on
  every PR), this changelog, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`,
  `LICENSE` (MIT), and the `docs/` directory.
- Challenge types (`STATIC`/`INTERACTIVE`/`HYBRID`, independent of
  category) and a formal `DRAFT`/`PUBLISHED`/`ARCHIVED` lifecycle
  (replacing a plain published/unpublished boolean).
- Portable challenge packages: a versioned YAML manifest + zip format,
  full import (strict validation against path traversal, zip bombs,
  oversized archives, schema mismatches — always lands as a draft) and
  export (never contains a flag value — flags are a one-way hash with no
  recoverable plaintext, by design). Two example packages under
  `examples/challenges/`.
- The data model and API for interactive challenges (environment
  definition, `ChallengeInstance` lifecycle, ownership/authorization) —
  deliberately without real container execution yet; the one runtime
  implementation shipped (`NotImplementedRuntime`) honestly reports
  "not available on this deployment" rather than simulating one.
- A minimal `StorageProvider` abstraction (local-disk only) used by the
  package import/export pathway.
- Admin Challenge Manager: sectioned create/edit form (identity,
  classification, flag, resources, environment, lifecycle), import/export
  actions, archive/restore actions, a "preview as player" link reusing
  the real player-facing challenge view.
