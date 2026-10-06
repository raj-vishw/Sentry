# Storage

Challenge files (direct uploads, and files extracted from an imported
package) live under one local directory on the server
(`server/uploads/` by default — see `config/uploads.ts`'s `UPLOAD_DIR`).
On-disk filenames are always server-generated random identifiers — a
file's real display name is only ever used for the download's
`Content-Disposition` header, never to build a filesystem path. That's
what actually prevents path traversal here, independent of any filename
validation elsewhere.

## `StorageProvider`

```ts
interface StorageProvider {
  upload(buffer: Buffer, opts: { filename: string }): Promise<{ storageKey: string; size: number }>;
  download(storageKey: string): Promise<Buffer>;
  delete(storageKey: string): Promise<void>;
  exists(storageKey: string): Promise<boolean>;
}
```

(`server/src/services/storage/StorageProvider.ts`)

A small interface introduced for, and currently only used by, the
challenge package import/export pathway
(`services/challengePackage.service.ts`) — the one place that needs to
write/read several files programmatically at once, unlike the existing
single-file admin upload route, which already works via multer's disk
storage directly and was left untouched (no reason to replace a working
system — see `config/uploads.ts`).

`LocalStorageProvider` (`services/storage/LocalStorageProvider.ts`) is
the only implementation. It wraps the same `UPLOAD_DIR` the existing
upload route writes into, so there's one storage namespace regardless of
which code path wrote a given file.

## Why no S3/MinIO implementation yet

The interface is designed so a cloud implementation could be dropped in
without the import/export code changing, but core self-hosting doesn't
need one — local disk is correct and sufficient for the only deployment
target that exists today (Docker Compose, with the uploads directory in
a named volume — see `docs/deployment/self-hosting.md`'s "Data
persistence" section). Building a second implementation with no second
real backend to justify it would be premature abstraction; add one when
an actual need shows up (e.g. a multi-node deployment that needs shared
storage).
