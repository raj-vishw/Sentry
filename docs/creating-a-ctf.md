# Creating a CTF

A practical walkthrough for running your first competition on a fresh
Sentry instance — the organizer's path through everything else in these
docs, in order.

## 1. Deploy

Follow [Getting Started](getting-started.md) or
[Self-Hosting](deployment/self-hosting.md) to get a running instance and
create your admin account through the setup wizard.

## 2. Brand it (optional)

**Control Center → Settings**: platform name, description, logo/favicon
URLs, accent color, boot message. See [Customization](customization.md).

## 3. Set up the competition

**Control Center → Competition**: name, description, rules (Markdown —
this is what players read before they start), and optionally start/end
dates for display. Decide whether the leaderboard should be visible
during play or hidden until you reveal it.

## 4. Build your challenge catalog

Either create challenges by hand (**Control Center → Challenges → New
Challenge** — see [Creating a Challenge](challenges/creating-a-challenge.md))
or import existing [challenge packages](challenges/challenge-packages.md)
from [`examples/challenges/`](../examples/challenges/) or elsewhere.
Everything starts as a draft — invisible to players until you publish it.

Use [prerequisites](challenges/creating-a-challenge.md) if you want an
unlock chain (solve challenge A before challenge B appears).

## 5. Decide on teams

Team play works out of the box — players create or join teams via invite
code from their own **Teams** app. There's no separate "enable teams"
switch; if you don't want team play, just don't mention it to players
(solo scoring works identically either way).

## 6. Test it yourself

Use **Preview as player** on a draft challenge to see exactly what a
player will see, including the flag-submission flow, before publishing.
Solve a couple yourself to sanity-check the whole loop (flag format,
hints, first-blood tracking).

## 7. Decide on registration

Leave registration open for an open/public CTF. Turn it off (**Control
Center → Settings**) once your roster is final, or if you're handling
registration out-of-band (e.g. for a private/invite-only event).

## 8. Publish and share

Publish each challenge when it's ready — they don't all need to go live
at once; staggering releases during a multi-day event works fine. Share
your platform's URL with participants.

## 9. During the event

- **Control Center → Submissions** — watch activity, flagged for review
  if unusually frequent.
- **Control Center → Statistics** — solve rates, participation over time.
- **Control Center → Audit Log** — who changed what, when.
- **Maintenance mode** (Settings) if you need to make a disruptive change
  mid-event without players seeing a broken state.
- If a solve shouldn't have counted (leaked flag, etc.), invalidate that
  specific submission from **Submissions** rather than editing the
  challenge — see [Creating a Challenge](challenges/creating-a-challenge.md#if-you-make-a-mistake-after-players-have-started-solving).

## 10. After it ends

Archive challenges you don't want to reuse (Control Center → Challenges)
rather than deleting them — archived challenges keep their submission
history but disappear from the player-facing list. Back up before you
tear anything down — see [Backups](backups.md).
