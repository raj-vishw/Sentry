# Customization

Everything here is admin-configurable at runtime — no source code or
`.env` changes, no rebuild, no restart. Two separate places, because
they're two separate concerns:

## Platform settings (Control Center → Settings)

About the deployment itself:

- **Platform name / description** — shown throughout the UI and in the
  browser tab title.
- **Logo URL / favicon URL** — paste a link to an image you host
  elsewhere (not a file upload in this version — see "What's not here
  yet" below).
- **Accent color** — a hex code (e.g. `#00e5ff`) applied as the
  instance-wide default. Individual players can still pick their own
  accent from their own Settings app; this is just what new/first-time
  visitors see.
- **Boot message** — shown on the Sentry OS boot sequence.
- **Registration enabled** — turn off once your roster is final.
- **Maintenance mode** — see
  [`administration/overview.md`](administration/overview.md).

These apply platform-wide and are picked up by every visitor's next page
load — the frontend fetches them once at boot from a public, no-auth
endpoint (there's nothing sensitive in this set) and applies the title,
favicon, accent override, and boot message automatically.

## Competition settings (Control Center → Competition)

About the event currently running on this deployment — deliberately a
separate model from platform settings, so you could in principle reset
and reconfigure one without touching the other:

- **Name, description, rules** (rules supports Markdown).
- **Start time / end time** — informational/display only in this
  version; nothing currently blocks submissions outside this window (see
  "What's not here yet").
- **Leaderboard visibility** — `public` (default) or `hidden`. When
  hidden, every non-admin (logged in or not) sees a "hidden" placeholder
  instead of standings; admins always see the real leaderboard. Useful
  for keeping scores secret until a reveal moment.

## What's not here yet

- **Logo/favicon as a real upload** — v1 only supports pasting a URL to
  an image you already host. A real upload pipeline is a natural
  follow-up (the backend's storage abstraction from the challenge-
  package work could back it) but wasn't built in this pass.
- **Enforcing the competition start/end window** — storing and showing
  the dates is supported; actually blocking submissions or hiding
  challenges outside that window is a deliberately separate, bigger
  feature (same reasoning as dynamic scoring and scoreboard freezes —
  it changes the trust contract of several existing, tested behaviors,
  and deserves its own pass rather than being bundled in here).
- **Per-feature toggles** (disabling teams, hints, or writeups platform-
  or competition-wide) — these are always-on today; turning any of them
  off would need real enforcement plumbing through several services,
  not just a settings checkbox.
- **An instance-wide default wallpaper** — the existing 7-wallpaper,
  per-user-customizable picker (each player's own **Settings** app)
  already covers this well.
