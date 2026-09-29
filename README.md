# Breach — CTF Management Platform

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
  submission engine, frontend/backend integration: in progress.

## Quick Start

Each app has its own README with setup instructions:

- [`client/README.md`](client/README.md)
- [`server/README.md`](server/README.md) (added in Phase 2)
