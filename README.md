# Sentry — CTF Competition Platform

A full-stack competitive cybersecurity challenge platform. Users solve
challenges across eight categories, earn points, climb a leaderboard, and
compete solo or as a team; admins manage the challenge catalog. Two roles
only: `USER` and `ADMIN`.

The authenticated player experience is presented as **Sentry OS** — a
desktop-environment UI (boot sequence, draggable/resizable windows, a dock,
workspaces) rather than a conventional page-by-page web app. See
`client/README.md` for how that's built.

## Structure

```
ctf-platform/
├── client/   React + TypeScript + Vite frontend (see client/README.md)
└── server/   Node + Express + TypeScript + MongoDB backend (see server/README.md)
```

## Status

- **Phase 1** — Frontend UI/UX foundation: done (mock data/services).
- **Phase 2** — Production backend, auth/RBAC, real challenge + flag
  submission engine, frontend/backend integration: **done**.
- **UI overhaul** — the frontend was rebuilt twice after Phase 2: first into
  an "Observatory" visual identity, then into **Sentry OS**, a full desktop
  metaphor (boot screen, window manager with drag/resize/snap, a dock, a
  top bar, workspaces, a Ctrl+K command palette) replacing the original
  page-based player UI. Dark and light themes are both fully supported.
  Authentication, authorization, and all API contracts were untouched —
  this was presentation-layer only. See `client/README.md` for the
  architecture.
- **Phase 3** — Player competition ecosystem: **done**. Real backend-driven
  Teams (create/join via invite code, ownership, live-computed standings)
  and Leaderboard (global/weekly/monthly + team rankings, "your position"
  even off-page), real streak tracking, and backend-driven challenge
  search/filter/pagination. See `server/README.md` "What's Out of Scope for
  Phase 3" for what's deliberately still deferred (activity history,
  notifications backend, public profile pages, a few others).

Everything above runs end-to-end against real MongoDB data — no critical
player-facing feature is backed by mock data anymore.

## Quick Start

```bash
docker compose up   # frontend :5173, backend :4000, MongoDB :27017
```

Or run each app individually — see their READMEs for setup:

- [`client/README.md`](client/README.md)
- [`server/README.md`](server/README.md)
