# Security

This document summarizes Sentry's threat model and current security
posture. It reflects the Phase 5 hardening pass and is meant to be kept
current as the platform evolves, not a one-time audit snapshot.

## Actors

| Actor | Description |
|---|---|
| USER | Authenticated player — the only self-serve role. |
| ADMIN | Platform operator, promoted via direct DB write (no self-serve path). |
| Unauthenticated attacker | Anyone hitting the API with no session. |
| Malicious user | An authenticated USER acting in bad faith. |
| Automated bot | Scripted abuse — credential stuffing, scraping, flag brute-forcing. |

## Assets

User accounts and credentials · challenge flags · challenge files · scoring
and leaderboard integrity · team membership and invite codes · writeups and
reports · audit logs · the underlying MongoDB data.

## Threat model and mitigations

| Threat | Mitigation | Status |
|---|---|---|
| Account takeover / credential stuffing | bcrypt hashing, generic invalid-credential messages (no account enumeration), `authLimiter` (20/15min) on register/login/refresh | Mitigated |
| Admin API/login discovery by automated scanners | Both the admin management API and admin login are mounted under a configurable, non-default path (`ADMIN_ROUTE_PREFIX`); the public `/auth/login` route rejects ADMIN accounts and vice versa, with the identical generic error either way | Mitigated — defense-in-depth only, see `adminRoutePrefix.test.ts`, `adminAuthSplit.test.ts` |
| Privilege escalation via request body | Every mutable field is explicitly whitelisted server-side (never a raw `req.body` spread into a DB write); `role` is hardcoded on registration, never client-supplied | Mitigated — see `massAssignment.test.ts` |
| IDOR on user/team/writeup resources | Every ownership-sensitive service resolves the acting resource from the authenticated user, not a client-supplied id; writeup/team mutations check `author`/`owner` server-side | Mitigated — see `authorization.test.ts`, `teams.test.ts` |
| Unpublished challenge file disclosure | `getChallengeFile` now requires `published: true` (admin bypass), mirroring every other read path | Fixed in Phase 5 — see `fileUploads.test.ts`'s regression test |
| Flag leakage | `flagHash` is `select: false` at the schema level, re-selected only on the submit code path, and never appears in any response DTO | Mitigated — see `challenges.test.ts` |
| Duplicate-solve / scoring race | DB-level unique partial index on `{user, challenge, correct:true}`, not just an application-level check | Mitigated — see `submissions.test.ts`'s concurrent-submission test |
| NoSQL injection | Every input is Zod-typed as a primitive before it reaches a query; free-text search is regex-escaped | Mitigated — see `nosqlInjection.test.ts` |
| XSS via user-generated content (writeups) | Structural, not a sanitizer: markdown is rendered via `react-markdown` with no raw-HTML plugin, so embedded HTML/script is never interpreted | Mitigated |
| File upload abuse (path traversal, dangerous types) | Server-generated UUID storage keys (client filename never touches the filesystem path), blocked inline-renderable MIME types, 25MB/1-file limit with a clean 413 on overflow | Mitigated |
| Team invite-code brute force | Cryptographically random codes (`node:crypto.randomInt`, ~1M-combination keyspace) plus a dedicated per-user rate limiter on `/teams/join` | Mitigated |
| CSRF | Refresh token cookie is `httpOnly`, `sameSite: 'lax'`, scoped to `/api/v1/auth`; access tokens are bearer-only (never a cookie), so the primary API surface isn't cookie-authenticated at all | Mitigated |
| Open redirect / wildcard CORS | Explicit origin allow-list from `CLIENT_URL`, never falls back to `*` (required since credentials are used) | Mitigated |
| Information disclosure via errors | Centralized error handler strips stack traces/internals in production; dev-only verbosity is still just the error message, never a stack | Mitigated |
| Secret/credential leakage via logs | Structured pino logging with denylist redaction of passwords/tokens/flags/cookies; request bodies are never logged at all | Mitigated |
| Denial of service via oversized requests | 1MB JSON body limit, 25MB/1-file upload limit, tiered rate limiting (global/auth/submission/team-join) | Mitigated |
| Pagination abuse (pulling an entire collection) | Every list endpoint caps `limit` server-side via Zod (max 50–100 depending on endpoint) | Mitigated |
| Draft/archived challenge flag submission bypass | A migration from a boolean `published` field to a `status` enum left 9 query filters across 6 services still matching the removed field name; with `strictQuery` enabled, Mongoose silently stripped the stale filter clause rather than erroring, so a flag could be submitted and scored against a DRAFT or ARCHIVED challenge. Found during this phase's security pass and fixed — all 9 sites now filter on `status: 'PUBLISHED'` | Fixed — see `submissions.test.ts`'s regression test |

## Known, accepted trade-offs

- **Access-token trust window on account disable.** Disabling a user bumps
  `tokenVersion` (kills refresh), but an already-issued access token
  (≤15 min) keeps working until it expires. This is the same window the
  JWT access/refresh design accepts everywhere else, not a new weakness.
- **No distinct CSP on the backend API.** The Express server never renders
  HTML, so its CSP is maximally strict (`default-src 'none'`) rather than
  tuned to a page's sources — the real, page-serving CSP lives in
  `client/nginx.conf` for the production frontend image.

## Deliberately out of scope today

Automated anomaly/abuse detection, load testing, third-party error
tracking/APM, object storage migration, automated database backups, and a
CI→CD deploy stage are all explicitly deferred — see the Phase 4/Phase 5
scoping notes for why. None of these are silent gaps; they're documented
decisions to revisit once there's a real production hosting target.

## Reporting a vulnerability

Please report security issues privately rather than in a public GitHub
issue — especially anything that could be exploited against someone
else's self-hosted deployment. Open a private security
advisory on the repository (GitHub → Security → Advisories → Report a
vulnerability) if available, or contact the maintainer directly. Don't
include a live, unredacted exploit against any shared/deployed instance
in a public report.

This project has no bug-bounty program; please still allow a reasonable
amount of time for a fix before any public disclosure.
