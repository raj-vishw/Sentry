# Importing a Challenge Package

See [`challenge-packages.md`](challenge-packages.md) first for the
package format itself — this page is just the workflow.

## Steps

1. **Control Center → Challenges → Import.**
2. Choose a `.zip` package.
3. Type in the real flag — packages never carry one (see
   `challenge-packages.md` for why), so this is always required.
4. Submit.

If anything about the archive is invalid, you'll get a specific reason
back (not just "import failed") — a few examples:

- "Unsupported schemaVersion." — the manifest declares a schema version
  this instance doesn't understand.
- "Archive entry \"...\" attempts to escape the archive root." — a path
  traversal attempt (`../...`) was found in the archive.
- "Archive is too large once extracted." — the archive's declared
  uncompressed size exceeds the cap, checked before any byte is actually
  decompressed (the zip-bomb defense).
- "Manifest references \"files/x\" but it is not present in the
  archive." / "Archive contains \"files/y\", which the manifest does not
  reference." — the `files:` list and the archive's actual `files/`
  contents don't match exactly.

## What happens on success

A new challenge is created as a **draft** — regardless of anything in
the manifest, an import is never auto-published. Review it (edit, add
files if needed, preview as a player) before publishing.

The import is recorded in the audit log (`ADMIN_IMPORTED_CHALLENGE`) with
the challenge's slug, title, type, and file count.

## If the slug is already taken

The importer treats the manifest's `slug` as a starting point, not a
guarantee — if another challenge on this instance already has that slug,
a numeric suffix is appended automatically (the same de-duplication logic
every challenge's slug already goes through, whether created by hand or
imported).
