# Challenge Types

Every challenge has a **category** (the subject matter — Web, Crypto,
Forensics, Reverse Engineering, Pwn, OSINT, Cloud, Mobile) and a separate
**type** (how it executes). These are independent — a Web challenge can
be STATIC or INTERACTIVE, same as a Reverse Engineering challenge.

## STATIC

The player downloads files and submits a flag. No running environment —
this is the original, and still most common, challenge shape. Most
Forensics, Reverse Engineering, OSINT, and Crypto challenges are STATIC.

## INTERACTIVE

The player launches a running environment (a "Launch Instance" control
appears on the challenge page instead of, or alongside, files) and
interacts with it directly — typically Web exploitation, Pwn, or
network-service challenges.

**Current limitation**: Sentry ships the full data model and API for
interactive challenges — ownership, ChallengeInstance records, the
lifecycle endpoints — but no actual container ever gets built or started
yet. Launching an instance today honestly reports "not available on this
deployment yet" rather than pretending to work. See
[`interactive-challenges.md`](interactive-challenges.md) for what that
means in practice, and
[`../architecture/challenge-runtime.md`](../architecture/challenge-runtime.md)
for the extension point a real implementation would plug into.

## HYBRID

Both — downloadable files *and* a running environment. Useful for, e.g.,
a web challenge that also ships its source code.

## Setting the type

Pick it in the Challenge Manager's **Identity & Classification** section
when creating or editing a challenge. Changing a challenge's type later
is allowed — if you change it to INTERACTIVE/HYBRID, you'll need to fill
in the Environment section before you can publish it (see
[`creating-a-challenge.md`](creating-a-challenge.md)).

## Backward compatibility

Every challenge created before this field existed is treated as `STATIC`
automatically — no migration step is required, and no admin needs to
revisit old challenges. If you're curious about the mechanism: it's a
schema default that Mongoose applies to any document read back from the
database that's simply missing the field.
