# GitHub Configuration

This directory contains repository contribution and governance controls:

- `pull_request_template.md` records traceability, risk, evidence, impact, verification,
  and approvals with a lightweight R0 path.
- `ISSUE_TEMPLATE/` provides governed change intake and private security routing.
- `CODEOWNERS` uses the verified human repository identity for review routing. It is
  not approval evidence and does not create a standing post-A-003 authority.
- `workflows/ci.yml` runs the repository's deterministic validation command.
- `workflows/governance.yml` validates repository structure, prevents a pull request
  from declaring a risk below its changed-path floor, and reports the read-only
  normalized merge-eligibility decision and concrete reasons.
- `workflows/quality.yml` runs path-filtered accessibility and Lighthouse checks.
- `workflows/security.yml` audits dependencies and scans changed history for secrets.

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

The four target workflows use read-only repository permissions and deterministic local
commands. They do not call an AI model or write to GitHub. Requirements, human/agent
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
