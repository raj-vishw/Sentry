# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/) once the first tagged release
ships.

## [Unreleased]

This is a retroactive baseline of the feature set as of the open-source
self-hosting foundation work, not a reconstruction of every prior commit.

### Added

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
