# Broken Vault (example)

A minimal example of an **INTERACTIVE** challenge package — demonstrates
the `environment:` block in the manifest and where build instructions
(`environment/Dockerfile`) would live in the archive.

**Importing this package creates a draft challenge whose "Launch
Instance" control honestly reports "not available on this deployment
yet"** — Sentry's interactive-challenge runtime is a real data model and
API today (ownership, authorization, the full lifecycle), but no actual
container ever gets built or started. See
`docs/challenges/interactive-challenges.md` for what that means in
practice, and `docs/architecture/challenge-runtime.md` for the extension
point a real runtime would plug into.

The `environment/Dockerfile` in this package is never read or executed by
the server — it's stored as an opaque reference file, included here only
to show where it would go.
