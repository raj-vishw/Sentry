# Administration Overview

Everything here lives in **Control Center**, the admin console inside
Sentry OS. It's a desktop window, not a separate app — open it from the
dock or desktop like any other application. Every section's data comes
from APIs independently gated by `requireRole('ADMIN')` server-side, so
nothing here is "security by hidden UI."

## Sections

- **Dashboard** — at-a-glance platform overview.
- **Challenges** — create/edit/publish/archive challenges, import/export
  portable challenge packages; see
  [`docs/challenges/creating-a-challenge.md`](../challenges/creating-a-challenge.md),
  [`docs/challenges/challenge-packages.md`](../challenges/challenge-packages.md).
- **Users** — search/filter accounts, view a user's solve history and
  badges, disable/enable accounts, export the full user list as CSV.
- **Teams** — view team rosters and standings.
- **Submissions** — every flag submission platform-wide, filterable by
  user/result; export as CSV; **invalidate** a specific correct submission
  (reverses its points, solve count, and leaderboard effect — use this
  when a solve shouldn't have counted, e.g. a leaked flag).
- **Categories** — manage the fixed challenge-category list (name,
  description, icon, active/inactive).
- **Writeups** — moderate player-submitted writeups (approve → published,
  reject, or archive).
- **Statistics** — platform-wide charts (users, challenges, submissions,
  teams, writeups) over a selectable time range.
- **Audit Log** — every admin mutation (challenge changes, user
  disable/enable, submission invalidation, settings changes, ...) with
  actor, timestamp, and metadata. Filterable by actor/action/date range.
  This is the first place to check "who changed what, and when."
- **Settings** — platform-wide configuration with no code or `.env`
  change required:
  - **Platform name / description** — shown throughout the UI.
  - **Registration enabled** — turn off once rosters are final.
  - **Maintenance mode** — immediately blocks every non-admin request
    platform-wide. See "Maintenance mode" below before you flip this on.

## Admin accounts are exempt from player-facing restrictions

By design, an authenticated ADMIN account bypasses every restriction meant
for regular play, so admins can freely test the platform without fighting
its own anti-abuse mechanisms:

- Flag-submission and team-invite-code rate limits don't apply.
- Hints are visible without cost and without needing to "unlock" them.
- Locked (prerequisite-gated) challenges are never locked for an admin.
- Unpublished (draft) challenges are visible in admin views.

None of this weakens the actual security model — every admin action is
still independently authorized (`requireRole('ADMIN')`) and, for
mutations, audit-logged.

## Maintenance mode

Turning this on from **Settings** immediately returns a clear
"temporarily unavailable" response to every request from a non-admin —
logged out or logged in. It's meant for mid-event configuration changes
you don't want players interacting with the platform during.

Safeguards, so you can never lock yourself out:

- An authenticated admin's own requests are never blocked, including the
  admin login route itself.
- Health check endpoints stay reachable (so your orchestrator/host doesn't
  think the whole platform crashed).
- The first-run setup wizard's status endpoint stays reachable.

Turn it back off from the same Settings toggle once you're done — there's
no automatic timeout, so don't forget it's on.

## Who can see what

- **Players** never see draft challenges, other players' emails, hidden
  flags, or admin-only metadata (prerequisite target, raw audit log).
- **Public profile pages** (`/profile/:username`, no login required) show
  less than a player sees about themselves — points, rank, solve count,
  streak, badges, and published writeups, but never email.
- **Audit log entries** are visible to admins only.
