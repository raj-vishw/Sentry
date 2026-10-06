# Challenge Runtime

The extension point for actually running interactive challenges. See
[`../challenges/interactive-challenges.md`](../challenges/interactive-challenges.md)
for the player/admin-facing explanation of what this means today — this
page is the implementation side.

## The abstraction

```ts
// server/src/services/runtime/ChallengeRuntime.ts
interface ChallengeRuntime {
  createInstance(challengeId: string, userId: string): Promise<ChallengeInstanceDto>;
  getInstance(instanceId: string): Promise<ChallengeInstanceDto>;
  stopInstance(instanceId: string): Promise<void>;
  restartInstance(instanceId: string): Promise<void>;
}
```

`ChallengeInstance` (`server/src/models/ChallengeInstance.ts`) is the
persisted record: which challenge, which user (and optionally team),
`status` (`STARTING | RUNNING | STOPPING | STOPPED | FAILED | EXPIRED`),
an `endpoint`, a `failureReason`, and expiry/activity timestamps.

Everything above the interface — the API routes
(`routes/challengeInstance.routes.ts`, the `/instances` route nested
under challenges), ownership enforcement
(`services/challengeInstance.service.ts`), authorization, and audit
logging — is real and fully tested. None of it depends on which
`ChallengeRuntime` implementation is plugged in.

## `NotImplementedRuntime`

The only implementation that exists today
(`services/runtime/NotImplementedRuntime.ts`). `createInstance` genuinely
writes a `ChallengeInstance` row (so the model/ownership/API above it
stays fully exercised and testable) but immediately marks it `FAILED`
with a clear, honest reason — it never pretends to start anything.
`stopInstance`/`restartInstance` respond `501 Not Implemented`.

## Building a real implementation

A future `LocalDockerRuntime`, `KubernetesRuntime`, or
`RemoteWorkerRuntime` would implement the same `ChallengeRuntime`
interface and get swapped in (`services/challengeInstance.service.ts`'s
single `challengeRuntime` import) — nothing above that layer needs to
change. Concretely, a real implementation needs to solve, at minimum:

- **Isolation from the main API process** — this interface exists
  specifically so challenge execution never happens inside the Express
  server itself. A real implementation should run as a genuinely
  separate, more locked-down worker/orchestrator.
- **Building/pulling images safely** — an admin-supplied `Dockerfile` (see
  the challenge package's `environment/` directory) is untrusted input;
  building it needs the same care as running any other user-supplied
  code, not just "run `docker build`."
- **Network isolation between instances** — one player's instance must
  not be reachable by, or able to reach, another's.
- **Resource enforcement** — the `environment.cpuLimit`/`memoryLimitMb`/
  `timeoutSeconds` fields already exist on the model; a real runtime
  needs to actually enforce them (and have a hard global ceiling an
  individual challenge's declared limits can never exceed).
- **Lifecycle correctness** — expiring idle instances, cleaning up
  `STOPPED`/`EXPIRED` ones, not leaking resources on a crash.

None of this is implemented here. This phase's job was the honest,
testable scaffolding — not a security-critical sandboxing system
attempted as a side effect of a package-import feature.
