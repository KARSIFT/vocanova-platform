# GitHub Configuration

This directory contains repository contribution and governance controls:

- `pull_request_template.md` records traceability, risk, evidence, impact, verification,
  and approvals with a lightweight R0 path.
- `ISSUE_TEMPLATE/` provides governed change intake and private security routing.
- `CODEOWNERS` uses the verified human repository identity for review routing. It is
  not approval evidence and does not create a standing post-A-003 authority.
- `actions/setup-toolchain/action.yml` is the shared pinned Node/pnpm/optional-Go
  bootstrap. It installs the frozen dependency graph and caches only
  correctness-neutral download stores.
- `workflows/ci.yml` runs stable foundation, shared-package, web, and transitional
  Go-API checks plus the single `CI / ci required` aggregate.
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
checks provide durable branch-protection names. The shared cache cannot change
correctness: frozen installation and every validation command still execute. The
workflows do not call an AI model or write to GitHub. Requirements, human/agent
work, independent review, and merge decisions are recorded through ordinary issues,
branches, pull requests, and comments. GitHub Free does not technically enforce private-
repository branch protection, so policy and evidence must not be described as a hosted
enforcement capability that does not exist.

Governance is role- and evidence-based across R0-R4. Every meaningful plan or
implementation is built and independently reviewed by different human or AI roles, with
the verdict bound to the exact revision and blocking findings resolved. R4 requires the
strongest risk evidence but no founder approval solely because of its label. Explicit
action-specific authority and genuinely triggered EHR remain separate gates.

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
T01 provides the refactored CI foundation; later tasks add credential-free
OpenNext/Worker/D1 checks.
Only `ci.yml` may eventually contain held Cloudflare version/deployment jobs, keeping
the four-file invariant. Pull-request jobs never receive deployment credentials.

Ruflo runs outside the repository and GitHub Actions. It may coordinate separate
participants, but no issue/comment trigger, tracked launcher, workflow, or Ruflo tool
may approve, merge, close, dispatch, deploy, access Cloudflare credentials, or consume
production data. GitHub evidence and the read-only eligibility result remain canonical.
