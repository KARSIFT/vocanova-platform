# VOC-083 — Implementation Plan

## Preconditions and protected areas

These preconditions governed the completed implementation and were satisfied before T00
began: the remediation revision received a fresh independent exact-SHA plan review, the
applicable decision owner adopted it, and `implementation_authorized` became true. The
prior SHA `682b33ec1a126e8924395f7d7f7eb26191f2a57a` received FAIL at PR #111 comment
5385262973; it remains historical evidence, not a passed review. After adoption, T00
alone was authorized for upstream evidence plus bounded disposable isolated candidate
probes, and T01+ remained blocked until T00 recorded a provisional candidate decision.
The builder started from the adopted revision, re-checked locked versions/current
primary Cloudflare/Sentry documentation, and remained within the declared surfaces. No
Sentry/Cloudflare credentials, API calls, source-map upload, deployment, account query,
billing action, or inherited-hold action was authorized.

## Completed Sequence

1. **T00 — Provisional selection (post-adoption, non-landing evidence/probes).**
   Completed at exact SHA `71db51d1dd2571d01e9ee3b3c13ebc2c00e43514`, merged by PR
   #113 as `e79f04402055d7ebbb1ccfbaf8e7a1dd1b85185c`. The task reproduced #105 on the
   locked base, captured sanitized generated-bundle locations and workerd output,
   compared the three candidates in `VOC-083-R00`, and recorded the provisional
   Workers-native selection without changing the canonical task branch runtime.
2. **T01 — Implement the selected narrow repair.** Completed at exact SHA
   `9f11195ed186e214fade57884e66ca96f2498ebc`, merged by PR #115 as
   `8b1f83a54ca72edebce0b7b5ed9f7d99e00a37d6`. The task applied only the selected
   configuration/import/adapter and necessary lockfile changes while preserving the
   separated client/server reporting paths and non-network test seams.
3. **T02 — Canonically qualify the selection and make bundle/log safety executable.**
   Completed at exact SHA `e3a71a13eedfc8fef05b580280047e41f320de48`, merged by PR
   #116 as `23da9da69bb27529994e70d4bf6e9a0a78ea26b6`. The task added the complete
   generated-bundle scanner, Wasm fixtures, fail-closed manifest checks, CI ordering,
   and bounded log classification after preserving the earlier FAIL on exact SHA
   `ab1b24d527f2d71649efb61cc1a8475535de282b`.
4. **T03 — Reconcile and verify.** Completed at exact SHA
   `bd7d98fc9bc2af9683b42d2fb1807794d27cda1a`, merged by PR #117 as
   `d4078924ae6d0be52628973e84be51734d93a5a9`. The task reviewed every affected
   runtime/config/test/doc/lockfile file, updated only documentation made inaccurate,
   received the different-role exact-SHA Cloudflare/Workers/Sentry specialist PASS
   after preserving the earlier FAIL on exact SHA
   `987d38caf461eece780ba0421594305d759fa7c4`, and completed the ordinary repository
   rollback rehearsal in a disposable worktree.

## Selection constraints

The decision record must show why configuration-only, version update, and native adapter
were accepted or rejected. A configuration alias may be chosen only if it is scoped to
the proven build-only path and cannot mask unrelated runtime imports. A package update
may be chosen only with a reviewed lockfile and upstream compatibility proof. A native
adapter may be chosen only with a documented mapping for Next request errors, global
errors, browser capture, trace/context behavior if retained, and non-network test
transport. Do not retain an obsolete `@sentry/nextjs` server import merely for API
convenience if it reintroduces the unsafe graph.

Before T01 modifies a selected candidate surface, reconcile it with the affected-area
inventory: OpenNext config/wrapper, Wrangler config/generated binding and environment
contract, instrumentation/capture paths, package/lockfile, compatibility and smoke
owners, local supervisor/policy, CI, and active docs. A candidate requiring an omitted
surface is a stop-and-scope-change condition, not permission to broaden this package.

## Validation and independent verification

At minimum, run the commands that exist on the implementation revision:

```bash
pnpm install --frozen-lockfile
pnpm --filter @vocanova/web cloudflare:build
pnpm --filter @vocanova/web cloudflare:compatibility # consumes same-job fresh build/dry run manifest
pnpm --filter @vocanova/web cloudflare:preview:test # consumes same-job fresh build lineage
pnpm test:local-stack
pnpm ci:web
pnpm ci:local-stack
pnpm audit --audit-level high
pnpm validate
bash scripts/governance/validate-governance.sh
bash scripts/governance/classify-change-risk.sh
git diff --check
```

`ci:web` must enforce the same build -> compatibility -> dry-run -> smoke lineage, and
`test:local-stack` must create/build/scan a new local artifact lineage before its
two-Worker smoke; neither may accept a previous job's `.open-next` output. Run a
narrower command only when the revision demonstrates that a listed command is
unavailable; record that fact rather than reporting it as passing. The independent
Cloudflare/Workers/Sentry specialist receives the exact SHA, candidate matrix, bundle
scan output, sanitized smoke logs, lockfile diff/audit, reporting-equivalence evidence,
and rollback result. They independently inspect the final diff and do not start live
services or duplicate long-running suites.

## Deployment and rollback

There is no deployment or live release. A merged implementation only changes repository
history; VOC-080-HOLD-00/01/02 remain unmodified. Roll back with a normal revert of the
selected task commits, then rerun the corresponding predecessor checks. Trigger rollback
on a rejected bundle scan, unexpected workerd diagnostic, lost reporting capture,
privacy/credential regression, dependency audit issue, or documentation overclaim.
