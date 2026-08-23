# VOC-084 — Reconcile completed change-package closure state: Specification

## Objective and requirement source

Current GitHub issue [#118](https://github.com/KARSIFT/vocanova-platform/issues/118)
establishes a repository-governance truthfulness defect. The canonical API object was
created on 2026-08-23 and has no `pull_request` field; historical commit-message uses
of the same number are not the current issue identity. VOC-080 through
VOC-083 have merged implementation chains and exact evidence, but active package files
retain pre-integration lifecycle language. VOC-084 must make those active records agree
with GitHub without fabricating, backdating, or erasing evidence.

The exact planning base is
`d4078924ae6d0be52628973e84be51734d93a5a9` on `develop`.

## Scope

In scope:

- an immutable, machine-readable inventory of the exact existing closure evidence for
  VOC-080, VOC-081, VOC-082, and VOC-083;
- reconciliation of active package lifecycle, task, acceptance, README,
  specification, and evidence wording that contradicts that inventory;
- preservation of historical failed reviews and failed/cancelled hosted runs as
  non-approval evidence;
- explicit separation of repository implementation completion from Cloudflare
  staging, production, production-data, launch, or settings activation;
- a deterministic local validator and negative fixtures that compare the committed
  inventory with the committed active package claims; and
- post-merge closure records on issue #85 and issue #118 when their repository-only
  objectives are actually satisfied.

Out of scope:

- application, Worker, D1, dependency, workflow, API, UI, or product behavior;
- repository/environment settings and the public-repository drift in issue #119;
- live Cloudflare, Sentry, server, DNS, secret, spending, or production-data action;
- release, deployment, activation, branch deletion, or `develop` to `main` promotion;
- changing the substance of historical reviews, failures, task implementations, or
  accepted decisions; and
- dynamically querying GitHub from deterministic repository validation.

## Risk and protected areas

The semantic class is R3. The change affects canonical governance evidence and may
influence later issue closure and planning. It includes a root validation hook and
touches an R4 package record, but does not change the R4 architecture, authority,
external holds, runtime, or hosted enforcement.

Protected areas are the four adopted package records, the new closure inventory,
foundation validation aggregation, historical independent-review evidence, and the
VOC-080 external-effect holds.

## Decisions

### VOC-084-D00 — GitHub integration evidence is reconciled after, not before, merge

A candidate task commit must not claim its own future PR number, hosted outcome,
review, merge, or post-merge run. A later governed reconciliation may record those
facts only when exact canonical evidence exists. VOC-084 is that later reconciliation
for the already integrated packages.

### VOC-084-D01 — Closure is an exact immutable evidence inventory

For each package and task, the implementation inventory must record, as applicable:

- implementation task ID and exact implementation head;
- PR number and normal merge commit;
- exact-revision independent review verdict and URL;
- resolved blocking findings and preserved earlier FAIL URLs;
- hosted workflow run URLs and applicability, including path-filtered non-runs;
- repository rollback evidence; and
- post-merge `develop` checks or a documented reason they are not part of the task's
  historical contract.

The inventory must also enumerate every committed file in each target package and
classify it as exactly one of:

- `active-claim`: current lifecycle, task, acceptance, evidence, or limitation state
  that must agree with the task inventory;
- `historical`: explicitly labelled immutable drafting, failed-review, failed-run, or
  superseded-candidate evidence; or
- `prospective`: explicitly labelled future work, activation, release, or hold state
  that must not be converted into a completed repository claim.

No target-package file may be unclassified, multiply classified, or silently excluded.

The inventory is committed data. Validation must not use network calls and must not
turn a mutable GitHub response into a local build dependency.

### VOC-084-D02 — Repository completion and activation are separate states

VOC-080 repository implementation may be `complete` while all of these remain held:

- `VOC-080-HOLD-00`: Cloudflare staging resources and secrets;
- `VOC-080-HOLD-01`: production deployment, routing, or production D1 migration; and
- `VOC-080-HOLD-02`: production learner-data access or migration.

No reconciled wording may say deployed, activated, released, migrated in production,
or verified live. VOC-081 F2 is repository/local complete; later F3/A1/product work is
not implied. VOC-082 closes its role-separation package only. VOC-083 closes the
workerd/Sentry compatibility package only.

### VOC-084-D03 — Failure history is immutable non-approval evidence

Every recorded plan, implementation, metadata, or hosted FAIL remains identified as
a FAIL. Reconciliation may link the later correcting PASS but must never overwrite,
omit, or reinterpret the earlier failure as approval.

### VOC-084-D04 — Active claims and the inventory fail closed together

The validator must parse the committed inventory and active package files. It must
fail with concrete package/task/criterion reasons when:

- a completed inventory item is still labelled pending, blocked, candidate-only, or
  integration-pending in a designated active field;
- a package claims completion without the required exact evidence fields;
- a required historical FAIL is missing or labelled PASS;
- an inherited hold is absent, released, or conflated with repository completion;
- a task/acceptance identifier is absent, duplicated, or mapped inconsistently;
- an evidence URL, SHA, merge commit, or result is placeholder-shaped; or
- a committed target-package file is missing from the file classification, has an
  invalid or duplicate classification, or contradicts its classification; or
- the foundation aggregate omits the validator.

Historical drafting text may use words such as “pending” when explicitly labelled as
historical. The validator must target structured/designated active claims rather than
ban words globally.

### VOC-084-D05 — Issue closure is evidence-driven and narrow

After the final VOC-084 implementation merges and post-merge checks pass:

- issue #85 may close as repository-only VOC-080 completion, with all three live holds
  repeated and no live outcome claimed;
- issue #118 may close with the exact reconciliation evidence; and
- current GitHub issue
  [#119](https://github.com/KARSIFT/vocanova-platform/issues/119) remains open because
  settings truth and desired hosted enforcement are a separate governed problem. Its
  canonical API object was created on 2026-08-23 and has no `pull_request` field.

## Evidence anchors to reconcile

The implementation must verify, not merely copy, at least these final boundaries:

| Package | Plan PR | Final implementation PR | Final head                                 | Merge commit                               |
| ------- | ------- | ----------------------- | ------------------------------------------ | ------------------------------------------ |
| VOC-080 | #86     | #100                    | `3d6699c5eb378b9a00679d61a5c28b6b7e27c32c` | `a05ab5c60534f36d1b89d9b9d32296469e9942bf` |
| VOC-081 | #102    | #108                    | `a8694932671ad9c44fd2a97c128b14e6089e5faf` | `36d526bdec83e28b17aa30a6814d42b92f058ec1` |
| VOC-082 | #110    | #114                    | `9b52963eba5b1dee30e0a63936de2c9ff0b82337` | `eb13979a7ad59e5dd1eef0680116b84eeadb059a` |
| VOC-083 | #111    | #117                    | `bd7d98fc9bc2af9683b42d2fb1807794d27cda1a` | `d4078924ae6d0be52628973e84be51734d93a5a9` |

The task-level inventory must include the intermediate implementation PRs named by
issue #118, not only these final rows.

## Security, privacy, data, analytics, and accessibility

No secret, credential, personal data, production data, provider payload, or live
telemetry is needed. The implementation reads only committed repository content and
public canonical GitHub evidence during preparation/review. It changes no schema or
data. Analytics, UI, and accessibility behavior are unaffected. Any HTML visual or UI
addition would be unrelated scope and is prohibited.

## Role separation

The plan candidate requires a different non-author exact-SHA reviewer before adoption.
Every implementation task requires a different non-author reviewer and a separately
operated merge. A model/provider label is provenance, not authority. Review evidence
does not satisfy the inherited live-action holds.
