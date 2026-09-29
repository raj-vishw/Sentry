# Breach — CTF Platform (Phase 1)

A production-grade frontend foundation for a competitive cybersecurity
challenge platform. Phase 1 delivers the complete UI/UX, design system,
routing, and mock service layer — no backend is connected yet.

## Overview

Breach lets operators solve security challenges across eight categories
(web, crypto, forensics, reverse engineering, pwn, OSINT, cloud, mobile),
earn XP, climb a leaderboard, and compete solo or as a team. There are
exactly two roles: `user` and `admin`.

This phase is frontend-only. Every list, stat, and profile you see is mock
data served through an async service layer (`src/services/*`) shaped
exactly like the real API calls Phase 2 will make — swapping the
implementations is the only work required to go live.

## Tech Stack

- **React 19** + **TypeScript** (strict)
- **Vite** — build tool and dev server
- **Tailwind CSS v4** — CSS-first theme via `@theme` tokens
- **React Router** — routing, nested layouts, route guards
- **Framer Motion** — animation
- **TanStack Query** — server-state fetching/caching for mock services
- **Zustand** — minimal global state (`authStore`, `uiStore`)
- **React Hook Form + Zod** — form state and validation
- **Recharts** — admin analytics charts
- **Lucide React** — icon set
- **Vitest + Testing Library** — unit/component tests

## Architecture

```
src/
├── app/               # router, providers, site-wide config
├── components/        # design-system primitives, shared across features
│   ├── ui/             Button, Input, Card, Modal, Table, ...
│   ├── layout/          AppShell, AdminShell, AuthLayout, Footer, ...
│   ├── navigation/      Sidebar, PublicNavbar, MobileNav, Logo
│   ├── animation/       AnimatedBackground, FadeIn, variants
│   └── feedback/        Toaster, EmptyState, ErrorState, Skeleton
├── features/           one folder per product area
│   ├── landing/          public marketing page + sections
│   ├── authentication/   login/register + auth-only primitives
│   ├── dashboard/        player dashboard
│   ├── challenges/       explorer + detail + flag submission
│   ├── leaderboard/      global/weekly/monthly rankings
│   ├── teams/            my team + team discovery
│   ├── profile/          account/profile page
│   └── admin/            operations-center UI (separate visual identity)
├── services/           mock API layer (auth, challenge, leaderboard, ...)
├── stores/             Zustand stores (auth session, UI state)
├── hooks/              reusable hooks (media queries, reduced motion)
├── lib/                utilities, category/difficulty metadata, mock delay
├── types/               shared TypeScript types
└── styles/              design tokens + global CSS
```

Each `features/*/data/mock*.ts` file is the single source of mock data for
that area. Components never hardcode content — they consume mock data
through the matching `services/*Service.ts` module. Phase 2 replaces the
body of each service function with a real HTTP call; call signatures and
return shapes are designed to stay stable.

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

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

### Demo access

Phase 1 auth is fully mocked — any identifier/password combination signs
you in. Use an identifier that starts with `admin` (e.g. `admin`) to
preview the `/admin` operations center; anything else lands in the regular
player dashboard.

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

None are required for Phase 1. See [`.env.example`](.env.example) for the
variable Phase 2 will introduce once the backend is connected.

## Future Phases

- **Phase 2**: connect the real Express/MongoDB backend — replace each
  `services/*Service.ts` mock implementation, wire real JWT-based auth and
  role checks into the existing route guards, real flag validation.
- **Phase 3+**: writeups, hints economy, team creation/invites flows,
  real-time leaderboard updates, admin CRUD for challenges/users, seasons.
