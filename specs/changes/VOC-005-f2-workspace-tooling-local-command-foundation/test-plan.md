# VOC-005 Test Plan

Exact root script names may be finalized by the approved implementation, but they must
cover every procedure below and the implementation PR must record the committed
commands verbatim. Tests use no secret or production data.

## VOC-005-TEST-01 — Existing governance baseline

Run the repository governance unit suite, repository validator, governance wrapper,
shell syntax checks, and `git diff --check`.

Expected: all pass without modifying or weakening governance controls.

## VOC-005-TEST-02 — Canonical application tree

Inspect tracked files and assert `apps/web` and `apps/api` exist while `services/api`,
root `backend`, and `apps/mobile` do not.

Expected: only approved application roots are present.

## VOC-005-TEST-03 — Workspace membership

Inspect pnpm workspace resolution and enumerate recursive projects; inspect the root
layout and `infra/` contents.

Expected: root/web/shared packages resolve; `apps/api` is not a pnpm project; existing
`docs/` and `scripts/` remain; `infra/` contains no deployment behavior.

## VOC-005-TEST-04 — Go validation

Run Go formatting verification, `go vet`, `go build`, and `go test` for `apps/api`.

Expected: all pass; formatting drift or compile/test failures return nonzero.

## VOC-005-TEST-05 — Clean reproducible installation

From a clean checkout with documented tool versions, run frozen pnpm installation and
verify the Go module/toolchain declaration.

Expected: no lockfile mutation, floating package-manager resolution, or undocumented
prerequisite.

## VOC-005-TEST-06 — Root command matrix

Run every documented root development smoke check, validation, lint, type-check, test,
build, format-check, and audit command applicable to the initialized skeleton.

Expected: each command resolves to real child work and succeeds.

## VOC-005-TEST-07 — Failure propagation

In an isolated disposable copy, introduce representative lint, type, formatting, Go
test, and child-command failures and run the corresponding root commands.

Expected: each root command returns nonzero and identifies the failing workspace/tool.

## VOC-005-TEST-08 — Web validation

Run the initialized web build, lint, and type-check paths and inspect the source tree.

Expected: checks pass with no product screen, feature, or unauthorized framework
selection/change.

## VOC-005-TEST-09 — Documentation rehearsal

Follow the checked-in prerequisite, clean installation, and root-command instructions
from a clean checkout.

Expected: commands are complete, repository-relative, and reproducible on WSL2/Linux
or an equivalent normal CI environment.

## VOC-005-TEST-10 — Dependency audit and negative controls

Run the approved pnpm audit command and verify no placeholder claims exist for
deployment, migration, integration, accessibility, staging, or production checks.

Expected: audit satisfies the documented policy; unavailable capabilities are omitted
or explicitly unavailable, never falsely passing.

## VOC-005-TEST-11 — Diff and safety inspection

Inspect exact changed files, stats, full diff, ignored/untracked files, dependency
manifests, and secret-sensitive configuration.

Expected: only VOC-005 scope, no secrets/generated clutter, and no excluded behavior.

## VOC-005-TEST-12 — Risk and exact-SHA review

Run the repository classifier against exact base/head and the complete PR declaration;
inspect hosted checks; have Claude independently review the actual diff and evidence.

Expected: declaration is not below the path floor, all required checks pass, and
Claude returns `PASS` or `PASS WITH NON-BLOCKING FINDINGS` for the exact final SHA.

## Pass and failure rules

Any failed applicable test, unresolved Critical/High finding, unwaived Medium finding,
scope expansion, missing authority, lockfile drift, masked command failure, or lower
risk declaration blocks implementation merge. Material correction invalidates the
prior exact-SHA review and requires affected tests plus a fresh review.
