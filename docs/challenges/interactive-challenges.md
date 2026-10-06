# Interactive Challenges

INTERACTIVE and HYBRID challenges (see
[`challenge-types.md`](challenge-types.md)) are meant to give each player
their own running environment instead of (or alongside) downloadable
files. This page is about what that actually means on a Sentry
deployment **today**, which is more limited than the words "interactive
challenge" might suggest — read this before promising players a working
environment.

## What's real today

- The data model: a challenge can declare an `environment` (runtime,
  port, protocol, CPU/memory limits, a timeout).
- A full API: a player can request an instance
  (`POST /api/v1/challenges/:id/instances`), check its status, and (once
  implemented) stop/restart it.
- Real ownership and authorization: an instance belongs to exactly the
  user who created it — another user gets a 404, not just a 403,
  attempting to look it up.
- An audit trail: every instance creation/stop request is logged.

## What's not real yet

**No container is ever actually built, pulled, or started.** Clicking
"Launch instance" on a challenge's page creates a real `ChallengeInstance`
record, but its status immediately comes back `FAILED` with a plain-
English reason ("Interactive challenge execution is not available on this
deployment yet"). This is deliberate — the alternative would be either
not building the feature's data model/API at all, or faking a working
console that silently does nothing, and both are worse than an honest
"not yet."

If you create an INTERACTIVE/HYBRID challenge today, treat it as a
**preview of the UI**, not a playable challenge — don't publish one to
real players expecting it to work end to end yet.

## Why

Actually running arbitrary challenge-author-supplied Docker images is a
large, security-critical feature on its own: real sandboxing, network
isolation between instances, resource enforcement, a worker process
genuinely separate from (and far more locked-down than) the main API
server. Building that casually, as a side effect of a package-import
feature, would be a bad trade — see
[`../architecture/challenge-runtime.md`](../architecture/challenge-runtime.md)
for the extension point a real implementation (a `ChallengeRuntime`) would
plug into without this API or data model needing to change.

## Admin side

Creating an INTERACTIVE/HYBRID challenge requires filling in the
Environment section (port, protocol, resource limits) before you can
publish it — this is validated the same way a missing flag would be. The
Challenge Manager shows a note in that section as a reminder that nothing
is actually executed yet.
