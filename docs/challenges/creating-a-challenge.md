# Creating a Challenge

This walks through the admin challenge-creation flow in **Control Center →
Challenges → New Challenge**. None of this requires touching source code —
challenge content lives in the database, not in the frontend.

## Fields

| Field | Notes |
|---|---|
| **Title** | At least 3 characters. |
| **Short description** | Optional, up to 160 characters — shown in listings/cards. |
| **Description** | Markdown-rendered to players. At least 10 characters. |
| **Tags** | Optional, comma-separated. Not yet filterable in the player-facing list — mainly useful for your own organization and for challenge packages (see below). |
| **Category** | One of the fixed categories (Web, Crypto, Forensics, Reverse Engineering, Pwn, OSINT, Cloud, Mobile). Manage the list itself from **Control Center → Categories**. |
| **Type** | STATIC, INTERACTIVE, or HYBRID — independent of category. See [`challenge-types.md`](challenge-types.md). |
| **Difficulty** | Easy / Medium / Hard / Insane — cosmetic (a badge shown to players), not scored differently. |
| **Points** | 0–10,000. Fixed, not decaying — every solver earns the same amount regardless of solve order (see "Explicitly deferred" in the project's phase notes if you're wondering why there's no dynamic scoring). |
| **Flag** | The exact string a player must submit. Stored hashed, never returned by any API response, including to admins viewing the challenge afterward — if you need to check it later, you'll need to re-set it. Leave blank on an *update* to leave the existing flag unchanged. |
| **Flag format** | A hint shown to players about the expected shape, e.g. `flag{...}`. Purely cosmetic — submissions are checked against the real flag regardless of what a player types here. |
| **Environment** | Only shown for INTERACTIVE/HYBRID — port, protocol, CPU/memory limits, timeout. Required before you can publish a non-STATIC challenge. See [`interactive-challenges.md`](interactive-challenges.md) for the current limitation (no real execution yet). |
| **Published** | Unpublished challenges (drafts) are invisible to players — visible only in the admin console. Nothing becomes visible to players until you explicitly publish it. |
| **Requires** (prerequisite) | Optional. Gates this challenge behind another published challenge — players see a locked teaser (no description/flag format/hints/files) until they solve the prerequisite. Capped at one level deep: you can't chain a prerequisite onto a challenge that already has one, or make a challenge a prerequisite for more than one other challenge. Admins always see every challenge unlocked. |
| **Hints** | Each hint has its own point cost (0 for a free hint) deducted from the player's score when they unlock it, and an `active` flag to disable one without deleting it. Admins see every hint's content without cost or needing to "unlock" it. |
| **Files** | Attached downloads (source archives, binaries, pcaps, etc.). Served as opaque attachments — binaries are never executed server-side. |

## Lifecycle: Draft, Published, Archived

A challenge is always in exactly one of three states:

- **Draft** — invisible to players. The default for a new or imported
  challenge.
- **Published** — visible and solvable.
- **Archived** — invisible to players, distinct from Draft (useful for
  "this ran in a past event and shouldn't be edited or shown again" while
  still keeping its submission history). Publishing/unpublishing isn't
  available while archived — **restore to draft first**, then publish
  again if you want it live.

## Workflow

1. Fill in the **Identity & Classification** fields (title, description,
   category, type, difficulty, points).
2. Set the **flag** and (optionally) a flag format hint.
3. Add any **hints** and attach **files**.
4. If the type is INTERACTIVE/HYBRID, fill in the **Environment** section.
5. Leave **Published** off while you're still working on it — it stays a
   draft, invisible to players, and you can safely iterate on it.
6. When it's ready, click **Preview as player** in the form — this opens
   the actual player-facing challenge page (the same component players
   use once it's published), not a separate mock-up.
7. Toggle **Published** on. It now appears in the public challenge list
   immediately (subject to any prerequisite lock).

## Importing instead of creating by hand

A challenge can also be created from a **challenge package** (a `.zip`
with a manifest) via **Import** — useful for sharing challenges between
instances or bringing in a community-authored challenge. See
[`challenge-packages.md`](challenge-packages.md),
[`importing.md`](importing.md), and [`exporting.md`](exporting.md). An
imported challenge always lands as a draft, same as one created by hand.

## First blood

The first correct submission for a challenge is tracked automatically (no
configuration needed) and shown on the challenge detail page once there's
at least one solve — a small incentive distinct from the fixed point value.

## If you make a mistake after players have started solving

- **Wrong flag, no one has solved it yet**: just edit the challenge and
  re-set the flag.
- **Wrong flag, someone already solved it with the old one**: edit the
  flag for future solvers, but the earlier solve stands — there's no bulk
  "re-check all submissions" tool. If a specific solve genuinely
  shouldn't count (e.g. it leaked), use **Control Center → Submissions**
  to invalidate that one submission — it reverses the points, solve count,
  and leaderboard effect for that user. Achievements already earned from
  that solve are not revoked (they're treated as a lifetime record, not a
  live scoring input).
- **Challenge needs to come down entirely**: archive it rather than
  deleting it, unless you're sure no one should ever see it existed —
  deleting removes it from admin history too.
