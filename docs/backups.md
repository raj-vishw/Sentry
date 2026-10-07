# Backups

Nothing about a Docker deployment's filesystem should be assumed
permanent — back up before any risky change (an update, a migration, a
competition ending).

## What to back up

- **MongoDB** — every user, team, challenge, submission, writeup, audit
  log entry.
- **Uploaded challenge files** — the `uploads_data` volume.
- **Configuration** — your `server/.env` and `client/.env` (never commit
  these; keep your own copy somewhere safe).

## Using the scripts

```bash
./scripts/backup.sh
```

Writes `backups/<timestamp>/mongodb.gz` and `backups/<timestamp>/uploads.tar.gz`.
By default targets `docker-compose.production.yml` — set
`COMPOSE_FILE=docker-compose.yml` first if you're backing up a dev stack.

```bash
./scripts/restore.sh backups/<timestamp>
```

Restores both into the running deployment. **Destructive** — it drops the
current database and replaces the current uploads directory. Asks you to
type `restore` to confirm before doing anything.

These are thin wrappers around `mongodump`/`mongorestore`/`tar` run
against the already-running compose services — not a separate backup
system, so you can always fall back to running those commands by hand if
you need something the script doesn't cover.

## Where to keep backups

Not on the same host/disk as the deployment itself — if that disk fails,
you lose both the live data and the backup. Copy the output of
`backup.sh` somewhere else (another machine, object storage, whatever you
already use) as part of your normal routine, not just before risky
changes.

## Restoring onto a different machine

`restore.sh` works the same way regardless of whether you're restoring
onto the original host or a fresh one — as long as the target has the
same compose stack running (`docker compose up -d` first), pointing
`restore.sh` at your backup directory recreates the data there.
