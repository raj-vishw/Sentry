# Challenge Package Format

A challenge package is a `.zip` archive that fully describes one
challenge — enough to recreate it on another Sentry instance via
**Import**. Two example packages live in
[`examples/challenges/`](../../examples/challenges/) — `midnight-packet`
(STATIC) and `broken-vault` (INTERACTIVE) — worth reading alongside this
page.

## Layout

```text
midnight-packet/
├── challenge.yml       # required — the manifest, see below
├── README.md           # optional — human notes, never parsed
├── files/              # the challenge's downloadable files
│   └── incident-notes.txt
└── environment/        # only for INTERACTIVE/HYBRID — see note below
    └── Dockerfile
```

Zip the **contents** of this directory (not the directory itself) so
`challenge.yml` sits at the archive root.

## The manifest (`challenge.yml`)

```yaml
schemaVersion: 1

challenge:
  slug: midnight-packet
  title: Midnight Packet
  shortDescription: A short one-line summary.
  description: |
    The full description, rendered as Markdown to players.
  category: forensics          # one of: web, crypto, forensics, reverse,
                                # pwn, osint, cloud, mobile, misc
  type: STATIC                 # STATIC | INTERACTIVE | HYBRID
  difficulty: MEDIUM           # EASY | MEDIUM | HARD | INSANE
  points: 300
  tags: [pcap, dns]
  originalAuthor: some-username  # display-only metadata, see below

flag:
  format: "flag{...}"          # a hint shown to players — never a real value, see below

hints:
  - title: First Lead
    cost: 25
    content: Look at the DNS traffic.

files:
  - files/incident-notes.txt   # every path here must exist under files/
                                # in the archive, and every file under
                                # files/ must be listed here — no extras
                                # in either direction

environment:                   # present only when type is INTERACTIVE/HYBRID
  runtime: docker
  port: 8080
  protocol: HTTP                # HTTP | TCP | UDP
  cpuLimit: 1
  memoryLimitMb: 512
  timeoutSeconds: 3600
```

`schemaVersion` is versioned starting at `1`. An importer that doesn't
recognize a package's `schemaVersion` rejects it outright rather than
guessing at compatibility.

## Why there's no flag value

Flags in Sentry are stored as a one-way bcrypt hash — the plaintext is
never retained anywhere after it's first set, not even for the admin who
set it. A package can therefore only ever declare the flag's *format*
(the hint shown to players), never the real value. **Importing a package
always requires the admin to type the real flag in directly**, the same
way creating a challenge by hand already does.

## `originalAuthor`

Purely cosmetic metadata, carried through on import for attribution. It
is never treated as a real account on the importing instance — the
imported challenge's actual `author` is always set to whoever ran the
import.

## The `environment/` directory

For INTERACTIVE/HYBRID challenges, you can include reference build files
(a `Dockerfile`, a `config.yml`, whatever helps someone else reproduce
your environment by hand). **Today, the importer never reads or acts on
these files** — they're accepted into the archive (counted toward the
size/file-count limits below) but not extracted or stored anywhere. This
is deliberate: see
[`../architecture/challenge-runtime.md`](../architecture/challenge-runtime.md)
for why actually building/running arbitrary uploaded Dockerfiles is a
large, separate, security-critical feature this phase doesn't attempt.

## Limits

| Limit | Value |
|---|---|
| Archive size | 50MB |
| Total extracted size | 200MB |
| File count | 200 |
| Filename length | 255 characters |

Exceeding any of these is rejected before extraction, as is any entry
that's a symlink, an absolute path, a path that tries to escape the
archive root (`../...`), or a duplicate path.

See [`importing.md`](importing.md) and [`exporting.md`](exporting.md) for
the actual import/export workflow.
