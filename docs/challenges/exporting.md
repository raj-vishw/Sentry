# Exporting a Challenge Package

From **Control Center → Challenges**, click the export icon on any
challenge's row. This downloads a `.zip` package in the format described
in [`challenge-packages.md`](challenge-packages.md) — the manifest, its
hints, and its attached files.

## There is exactly one export mode

Earlier plans for this feature (and some other CTF platforms) describe a
"public" export (no flag) versus a "private" export (includes the real
flag, clearly marked sensitive). Sentry only has the first, and that's a
hard architectural fact, not a missing feature: flags are stored as a
one-way hash, so the plaintext genuinely does not exist anywhere to
export, for anyone, including the admin who set it. Every export is
therefore safe to share — it never contains a flag value under any
circumstance.

If you re-import an exported package, you'll need to type the flag in
again yourself (see [`importing.md`](importing.md)) — Sentry doesn't
remember it for you either.

## What's in the export

- `challenge.yml` — the manifest.
- `README.md` — a short auto-generated note.
- `files/` — every file currently attached to the challenge.
- Nothing from `environment/` is reconstructed on export today (the
  manifest's `environment:` block is included for INTERACTIVE/HYBRID
  challenges, but there's no build-file content to export since none is
  stored on import either — see `challenge-packages.md`).

Exporting is audit-logged (`ADMIN_EXPORTED_CHALLENGE`) and requires
admin access, same as every other challenge-management action.
