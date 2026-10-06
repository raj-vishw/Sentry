# Architecture Overview

This is a short map of the codebase for anyone extending it — see
`server/README.md` and `client/README.md` for the deep version of each
side.

```
ctf-platform/
├── client/   React 19 + TypeScript + Vite — "Sentry OS" desktop shell
└── server/   Express 5 + TypeScript + MongoDB
```

## Backend layering

```
routes/        — Express routers, one file per resource, wires
                  middleware (auth, validation, rate limits) to controllers
controllers/   — thin: parse the request, call a service, send the response
services/      — all real logic (business rules, DB queries) lives here
validators/    — zod schemas; the authoritative request validation
models/        — Mongoose schemas
```

Every admin-only route is independently gated by `requireRole('ADMIN')`
server-side — the frontend hiding a button is never the real access
control.

## Challenge subsystem specifically

- `models/Challenge.ts` — the core document: identity fields, `category`
  (subject matter) and `type` (STATIC/INTERACTIVE/HYBRID, independent of
  category), `status` (DRAFT/PUBLISHED/ARCHIVED), an embedded
  `environment` (metadata only for interactive challenges), a
  `prerequisite` self-reference (unlock chains, capped at depth 1).
- `models/Hint.ts` — hints are their own collection (`challenge: ObjectId`
  ref), not embedded, since they're queried/mutated somewhat
  independently (unlocking one is a separate action from editing the
  challenge).
- `services/challenge.service.ts` — CRUD, publish/unpublish/archive/
  restore lifecycle, prerequisite validation.
- `services/challengePackage.service.ts` — import/export; see
  [`storage.md`](storage.md) and the `docs/challenges/` package docs.
- `services/challengeInstance.service.ts` +
  `services/runtime/ChallengeRuntime.ts` — the interactive-challenge
  abstraction; see [`challenge-runtime.md`](challenge-runtime.md).

## Frontend shell

The entire authenticated experience lives inside one OS shell
(`client/src/os/`) — windows, a dock, a command palette — rather than
conventional pages. Player-facing and admin-facing features are both
"apps" inside this shell; see `client/README.md` for how the window
manager and app registry work.

The admin Challenge Manager (`client/src/features/admin/`) reuses the
same player-facing challenge component
(`features/challenges/components/ChallengeWorkspace.tsx`) for "Preview as
player" — there is no separate, divergent preview UI to keep in sync.
