# Sentry — CTF Platform Frontend (Phase 2)

A production-grade frontend for a competitive cybersecurity challenge
platform, now connected to a real backend: authentication, RBAC, challenge
browsing, and flag submission all talk to the Express/MongoDB API in
`../server`.

## Overview

Sentry lets operators solve security challenges across eight categories
(web, crypto, forensics, reverse engineering, pwn, OSINT, cloud, mobile),
earn XP, climb a leaderboard, and compete solo or as a team. There are
exactly two roles: `user` and `admin`.

Auth, challenges, submissions, hints, and the profile/dashboard are backed
by the real API (`src/services/*` → `../server`). Teams, the public
leaderboard, and some admin screens (users/teams/statistics) still run on
Phase 1 mock data — see `../server/README.md` "What's Out of Scope for
Phase 2" for the exact list and why.

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite** — build tool and dev server (proxies `/api` to the backend)
- **Tailwind CSS v4** — CSS-first theme via `@theme` tokens
- **React Router** — routing, nested layouts, route guards
- **Framer Motion** — animation
- **TanStack Query** — server-state fetching/caching, centralized error handling
- **Zustand** — minimal global state (`authStore`, `uiStore`)
- **React Hook Form + Zod** — form state and validation
- **Recharts** — admin analytics charts
- **Lucide React** — icon set
- **Vitest + Testing Library** — unit/component tests

## Architecture

```
src/
├── app/               # router, providers (incl. session restoration), site-wide config
├── components/        # design-system primitives, shared across features
│   ├── ui/             Button, Input, Card, Modal, Table, ...
│   ├── layout/          AppShell, AdminShell, AuthLayout, Footer, ...
│   ├── navigation/      Sidebar, PublicNavbar, MobileNav, Logo
│   ├── animation/       AnimatedBackground, FadeIn, variants
│   └── feedback/        Toaster, EmptyState, ErrorState, Skeleton
├── features/           one folder per product area, each with its own hooks/
│   ├── landing/          public marketing page + sections
│   ├── authentication/   login/register + auth-only primitives
│   ├── dashboard/        player dashboard (real data)
│   ├── challenges/       explorer + detail + real flag submission + hints
│   ├── leaderboard/      global/weekly/monthly rankings (mock — see above)
│   ├── teams/            my team + team discovery (mock — see above)
│   ├── profile/          account/profile page (real data)
│   └── admin/            operations-center UI + real challenge CRUD
├── services/           API layer — auth/challenge/user/admin are real; leaderboard/team are mock
├── lib/                apiClient (fetch wrapper, auth headers, silent refresh), queryClient, utils
├── stores/             Zustand stores (in-memory auth session, UI state)
├── hooks/              reusable hooks (media queries, reduced motion)
├── types/               shared TypeScript types
└── styles/              design tokens + global CSS
```

## Talking to the Backend

`vite.config.ts` proxies `/api/*` to the backend (`http://localhost:4000`
by default, overridable via `VITE_API_PROXY_TARGET` — see
`docker-compose.yml`). This makes the browser treat the API as same-origin,
which is what lets the HttpOnly refresh-token cookie work with
`SameSite=Lax` in development without HTTPS. See
`../server/README.md` "Authentication Architecture" for the full design
(short-lived in-memory access token + rotating HttpOnly refresh cookie).

`src/lib/apiClient.ts` is the only thing that calls `fetch`. It attaches
the access token, retries once via silent refresh on a 401, and normalizes
every error into an `ApiError` with a `status`/`code`. `src/lib/queryClient.ts`
wires a `QueryCache`/`MutationCache` `onError` that turns 403/429/5xx/network
errors into toasts centrally — 400/401/404 are left to individual
pages/forms, which already show inline errors for those.

## Design System

- **Color**: near-black surfaces (`--color-bg`, `--color-surface*`), one
  primary accent (signal teal, `--color-accent`) and one secondary accent
  (electric violet, `--color-secondary`), used sparingly. All tokens live in
  [`src/styles/tokens.css`](src/styles/tokens.css) — change a value there to
  re-theme the whole app.
- **Typography**: Space Grotesk for display/headings, Inter for UI text,
  JetBrains Mono for flags, technical metadata, and system status.
- **Motion**: Framer Motion variants in `components/animation/variants.ts`;
  everything respects `prefers-reduced-motion`.
- **Visual identity**: player areas ("PLAYER") use the primary accent and a
  competitive tone; the admin area ("ADMIN") uses the secondary accent and
  reads as an operations center — same primitives, different mode.

## Development Setup

Needs the backend running too (see `../server/README.md`, or just run
`docker compose up` from the repo root, which starts everything including
MongoDB):

```bash
npm install
npm run dev      # http://localhost:5173 — proxies /api to :4000
```

### Getting an account

Registration is real now — create an account via `/register`, or seed a
dev admin: from `../server`, run `npm run seed` (creates
`admin@dev.local` / `DevAdmin123!` plus sample users/challenges — obvious
dev-only credentials, printed to the console, never for production).

## Scripts

| Script                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Vite dev server            |
| `npm run build`         | Type-check and build for production  |
| `npm run preview`       | Preview the production build         |
| `npm run lint`          | Lint with oxlint                     |
| `npm run format`        | Format the codebase with Prettier    |
| `npm run format:check`  | Check formatting without writing     |
| `npm run test`          | Run the test suite once              |
| `npm run test:watch`    | Run tests in watch mode              |

## Environment Variables

None required to run the dev server against a local backend — see
[`.env.example`](.env.example). `VITE_API_PROXY_TARGET` (used by
`vite.config.ts`, not read by app code) points the dev proxy at a
non-default backend URL, e.g. inside Docker Compose.

## Future Phases

- **Phase 3+**: writeups, team creation/invite flows, a real backend for
  the leaderboard and teams, admin CRUD for users/teams, seasons.
