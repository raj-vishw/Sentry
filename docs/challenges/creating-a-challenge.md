# Creating a Challenge

This walks through the admin challenge-creation flow in **Control Center →
Challenges → New Challenge**. None of this requires touching source code —
challenge content lives in the database, not in the frontend.

## Fields

| Field | Notes |
|---|---|
| **Title** | At least 3 characters. |
| **Description** | Markdown-rendered to players. At least 10 characters. |
| **Category** | One of the fixed categories (Web, Crypto, Forensics, Reverse Engineering, Pwn, OSINT, Cloud, Mobile). Manage the list itself from **Control Center → Categories**. |
| **Difficulty** | Easy / Medium / Hard / Insane — cosmetic (a badge shown to players), not scored differently. |
| **Points** | 0–10,000. Fixed, not decaying — every solver earns the same amount regardless of solve order (see "Explicitly deferred" in the project's phase notes if you're wondering why there's no dynamic scoring). |
| **Flag** | The exact string a player must submit. Stored hashed, never returned by any API response, including to admins viewing the challenge afterward — if you need to check it later, you'll need to re-set it. Leave blank on an *update* to leave the existing flag unchanged. |
| **Flag format** | A hint shown to players about the expected shape, e.g. `flag{...}`. Purely cosmetic — submissions are checked against the real flag regardless of what a player types here. |
| **Published** | Unpublished challenges (drafts) are invisible to players — visible only in the admin console. Nothing becomes visible to players until you explicitly publish it. |
| **Requires** (prerequisite) | Optional. Gates this challenge behind another published challenge — players see a locked teaser (no description/flag format/hints/files) until they solve the prerequisite. Capped at one level deep: you can't chain a prerequisite onto a challenge that already has one, or make a challenge a prerequisite for more than one other challenge. Admins always see every challenge unlocked. |
| **Hints** | Each hint has its own point cost (0 for a free hint) deducted from the player's score when they unlock it, and an `active` flag to disable one without deleting it. Admins see every hint's content without cost or needing to "unlock" it. |
| **Files** | Attached downloads (source archives, binaries, pcaps, etc.). Served as opaque attachments — binaries are never executed server-side. |

## Workflow

1. Fill in the **Identity** fields (title, description) and **Classification**
   (category, difficulty, points).
2. Set the **flag** and (optionally) a flag format hint.
3. Add any **hints** and attach **files**.
4. Leave **Published** off while you're still working on it — it stays a
   draft, invisible to players, and you can safely iterate on it.
5. When it's ready, test it yourself: as an admin you can view the full
   challenge detail the same way a player eventually will. There's no
   separate "preview as player" mode today — the admin detail view and the
   player detail view share the same data, just with the admin-only fields
   (flag, prerequisite id) visible only to you.
6. Toggle **Published** on. It now appears in the public challenge list
   immediately (subject to any prerequisite lock).

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
- **Challenge needs to come down entirely**: unpublish it rather than
  deleting it, unless you're sure no one should ever see it existed —
  deleting removes it from admin history too.
