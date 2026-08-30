# GitHub Configuration

This directory contains repository contribution and governance controls:

- `pull_request_template.md` records traceability, risk, evidence, impact, verification,
  and approvals with a lightweight R0 path.
- `ISSUE_TEMPLATE/` provides governed change intake and private security routing.
- `CODEOWNERS` uses the verified human repository identity for review routing. It is
  not approval evidence and does not create a standing post-A-003 authority.
- `actions/setup-toolchain/action.yml` is the shared pinned Node/pnpm
  bootstrap. It installs the frozen dependency graph and caches only
  correctness-neutral download stores.
- `workflows/ci.yml` runs stable foundation, shared-package, OpenNext/workerd web,
  Worker API/local-D1, disposable two-Worker local-stack, retirement-policy, and held
  delivery checks plus the single `CI / ci required` aggregate. The aggregate requires
  the local-stack result and fails closed when it fails or is cancelled.
- `workflows/governance.yml` validates repository structure, prevents a pull request
  from declaring a risk below its changed-path floor, and reports the read-only
  normalized merge-eligibility decision and concrete reasons.
- `workflows/quality.yml` runs path-filtered accessibility and Lighthouse checks plus
  `Quality / quality required`.
- `workflows/security.yml` audits dependencies, scans changed history for secrets,
  proves the scanner's synthetic rejection contract, and publishes
  `Security / security required`.

## VOC-078 transition

T00 proved the four replacement workflows on a real pull request. T01 removed the
three external control-plane callers (`pipeline.yml`, `change-package.yml`, and
`package-release.yml`). GitHub Actions no longer plans, adopts, implements, reviews,
remediates, merges, releases, opens task issues, or advances packages, and no workflow
references `KARSIFT/karsift-ai-infra`.

T02 also removed the repository-local orchestrator, Claude subagent assets, vendor
state, and package launch scripts. T03 removed server-bound deployment and scheduled
monitoring workflows without changing runtime infrastructure or servers. T04 removed
the five superseded standalone quality/governance workflows after their replacement
jobs passed on real pull requests. The workflow inventory is now exactly the four files
listed above.

The four target workflows use explicit Bash semantics, read-only repository
permissions, immutable action SHAs, non-persisted checkout credentials, pinned runner
images, timeouts, cancellation, bounded failure artifacts, and deterministic local
commands. Subsystem jobs do not hide one another's results, while stable aggregate
checks provide durable check names. The shared cache cannot change correctness: frozen
installation and every validation command still execute. The workflows do not call an
AI model or write to GitHub. Requirements, human/agent work, independent review, and
merge decisions are recorded through ordinary issues, branches, pull requests, and
comments. The repository is public, current as observed at 2026-08-24, but public
availability does not mean a ruleset, branch protection, security feature, or other
hosted enforcement control is configured. Automatic deletion of merged branches is
enabled as the one VOC-092 setting change; it is not branch protection or merge
automation. See the [current point-in-time settings record](../docs/governance/repository-settings-current.yaml).

Branch finalization after a release also requires post-promotion history
synchronization. After `develop` is merge-committed to `main`, a separately reviewed
short-lived synchronization branch must merge current `main` ancestry and then
merge-commit back to `develop`; permanent `main` is never the pull-request head.
Completion evidence proves `main` is an ancestor of `develop` and `develop` is zero
commits behind `main`. The loop does not change repository settings and does not
deploy or invoke Cloudflare. The enabled source-branch setting may automatically
delete only the merged short-lived head after its exact SHA and recreation command
are recorded.

Governance is role- and evidence-based across R0-R4. Every meaningful plan or
implementation is built and independently reviewed by different human or AI roles, with
the verdict bound to the exact revision and blocking findings resolved. R4 requires the
strongest risk evidence but no founder approval solely because of its label. Explicit
action-specific authority and genuinely triggered EHR remain separate gates.

A role is a responsibility and an actor is an attributable human or separately
instantiated AI participant. A different actor that did not author the exact revision
is required for review; relabeling, another session, or model/provider provenance does
not create separation or authority. A reviewer who materially edits a SHA is its
builder and requires fresh checks and a different reviewer. The read-only eligibility
decision cannot satisfy an action-specific authority hold.

For new change packages, `automatic_merge_allowed` defaults to `true` across R0–R4;
any `false` requires a non-placeholder package-local `automatic_merge_hold_reason`.
VOC-079 retains its explicit pre-transition exception.

VOC-079-T01 adds a pure provider-neutral evaluator under
`tooling/governance/merge-eligibility/`. The Governance adapter may read contents,
checks, pull-request metadata, changed files, reviews, and PR review comments. It binds
the declared review evidence URL to a live exact-SHA passing record and writes only
normalized evidence, its decision, and reasons to the Actions job summary; it has no approval,
comment, merge, dispatch, or other GitHub write path. A blocked policy decision is
reported as data rather than turning the reporting job into a merge executor. The job
conclusion reports adapter execution, while the summary reports eligibility; external
reviewer identity is recorded provenance, not falsely claimed hosted attribution.

See [`docs/governance/repository-settings.md`](../docs/governance/repository-settings.md)
for the continuously maintained built-versus-pending record. DOC-17 and DOC-18's
unbuilt Control Plane remains superseded and archived under `docs/archive/`.

## VOC-080 direction

The workflow inventory remains exactly four. T00 documents the Cloudflare target and
external Ruflo boundary; it does not change workflow behavior or repository settings.
T01 provides the refactored CI foundation. T03 extends its stable `web` entry point
with an OpenNext transformation followed by generated Wrangler type verification,
Worker compatibility scans, credential-free dry-run and size/startup checks, and
representative local workerd requests through an API service binding. T04 and later
tasks extend the Cloudflare migration with API and data checks.
T04 adds a distinct credential-free `worker api` job for generated bindings,
Hono/OpenAPI and canonical-contract drift, local D1 migrations, workerd tests,
safety scans, build, and Wrangler dry-run.
T05 keeps that same job and workflow inventory while extending it with the second
forward D1 migration and 13 identity/account operations. Contract evidence now binds
method, path, operation ID, primary success status, parameters, and public field shape
to the migration contract snapshot; workerd fixtures cover hashing, expiry, replay,
requester isolation, CSRF, rate/kill switches, idempotency, and injected D1 failures.
T06-T08 complete Worker contract/domain parity, and T09 adds synthetic-only
PostgreSQL-to-D1 conversion and exact reconciliation. T10 keeps the four-file
invariant and adds the held delivery state machine only to `ci.yml`; PR/push jobs
dry-run local/staging/production configurations without credentials. VOC-094 Phase 1
later created and rollback-proved the exact synthetic staging Workers, seven-migration
D1, and two Custom Domains without using this workflow. VOC-100 prospectively replaces
the superseded custom binder with a standard GitHub environment model: a manual,
SHA-bound `develop` dispatch; required validation; a fresh non-author AI review
decision; an unchanged mechanical approval proxy; and first-step approval-history
validation before a Cloudflare secret is evaluated. In this PR1 state,
`cloudflare-staging` and both environment secrets are absent, so staging fails closed.
A separate settings action and immediate doc-only PR2 are required before the first
dispatch.

<!-- VOC-101-STAGING-CREDENTIAL-POLICY-BEGIN -->
The operator-revoked standing least-privilege staging token is valid until revoked.
Its exact account, two permissions, environment-only secret placement, redaction,
delivery controls, and production holds remain unchanged; the
[delivery runbook](../docs/operations/cloudflare-delivery.md) owns fail-closed
revocation and replacement ordering. Ordinary dispatches, revocations, and
replacements need no package or pull request, but any later meaningful policy or
behavior change still requires governed intake and adoption. Credential lifecycle
never grants dispatch or review judgment.
<!-- VOC-101-STAGING-CREDENTIAL-POLICY-END -->

Production retains all sentinels and holds. See the
[delivery runbook](../docs/operations/cloudflare-delivery.md).

T11 removes the active Go/PostgreSQL runtime, Dockerfiles, Compose/Nginx/host assets,
the remote server E2E harness, and their CI/toolchain dependencies after the T03-T10
parity chain. The foundation retirement policy prevents those executable surfaces or
stale commands from returning. Historical change packages and archived evidence are
unchanged; compact API-contract and PostgreSQL-schema snapshots remain only as
deterministic Worker conversion fixtures. No live server was inspected or stopped.

VOC-081 keeps the four-file inventory. Its `local stack` job uses no credential,
remote binding, Cloudflare account, or deploy path; it builds and starts disposable
local workerd/D1 processes, proves the web-to-API service binding and D1 restart
persistence, then requires bounded cleanup before `CI / ci required` may pass.

Ruflo runs outside the repository and GitHub Actions. It may coordinate separate
participants, but no issue/comment trigger, tracked launcher, workflow, or Ruflo tool
may approve, merge, close, dispatch, deploy, access Cloudflare credentials, or consume
production data. GitHub evidence and the read-only eligibility result remain canonical.
VOC-080-T02's [external runbook](../docs/operations/ruflo-external-orchestration.md)
records the exact locked installation and rehearsal. Repository guards reject local
Ruflo/Claude Flow state or dependencies, generated instruction replacement, launchers,
autonomous GitHub writes, and held external-effect commands.
