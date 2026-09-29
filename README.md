# Sentry — CTF Management Platform

A full-stack competitive cybersecurity challenge platform. Users solve
challenges across eight categories, earn points, and climb a leaderboard;
admins manage the challenge catalog. Two roles only: `USER` and `ADMIN`.

## Structure

```
ctf-platform/
├── client/   React + TypeScript + Vite frontend (see client/README.md)
└── server/   Node + Express + TypeScript + MongoDB backend (see server/README.md)
```

## Status

- **Phase 1** — Frontend UI/UX foundation: done (mock data/services).
- **Phase 2** — Production backend, auth/RBAC, real challenge + flag
  submission engine, frontend/backend integration: **done**. Register →
  login → browse real challenges → submit flags → earn points all work
  end-to-end against a real MongoDB-backed API. Teams, the public
  leaderboard, and admin user/team management still run on Phase 1 mocks —
  see server/README.md "What's Out of Scope for Phase 2".

## Quick Start

```bash
docker compose up   # frontend :5173, backend :4000, MongoDB :27017
```

Or run each app individually — see their READMEs for setup:

- [`client/README.md`](client/README.md)
- [`server/README.md`](server/README.md)
