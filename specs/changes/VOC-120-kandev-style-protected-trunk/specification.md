# VOC-120 — Specification

## Problem

VocaNova's active governance is larger and harder to operate than the product it is
meant to protect. Routine changes currently cross an issue, nine-file package, plan
PR, exact-revision review, adoption bookkeeping revision, new review, implementation
PR, full CI, body-declared evidence, non-author merge, release PR, and reverse history
synchronization. Historical evidence and repeated policy prose execute on ordinary
product changes.

The result is measurable: 104 packages contain 1,049 files and 111,396 lines;
foundation policy contains 21,512 lines versus 14,218 lines of API and web source;
and plan PRs generated 245 of 415 recent PR workflow executions. Meanwhile live
GitHub readback found no rulesets or protected permanent branch and disabled native
secret/dependency protections.

## Desired outcome

The repository should feel like Kandev's public contribution workflow without
copying Kandev's project-scale complexity. A contributor or agent can understand the
normal path immediately, routine changes have one PR, and safety comes primarily
from native protection, relevant deterministic checks, attributable review, limited
credentials, and explicit external-action authority.

## Operating lanes

### Standard

Applies to reversible documentation, tests, UI, maintenance, and ordinary product
behavior without protected data or external effects.

```text
optional issue -> short-lived branch -> focused PR -> affected checks -> review -> merge
```

An issue is required for a discovered bug when the repository's reporting rule
applies, unclear scope, or work needing maintainer discussion. No separate plan PR or
change package is required.

Standard classification is fail-closed: only configured non-protected paths with no
protected semantic effect qualify. Unknown effects or classifier failure become
Protected. Standard behavior changes require an attributable exact-head semantic
review check; docs-only changes may merge without an approving Review after all
deterministic gates pass.

### Protected

Applies to authentication, authorization, personal data, migrations, AI provider or
safety boundaries, GitHub Actions, infrastructure, governance, release behavior, and
other high-consequence technical controls.

```text
issue with acceptance criteria
  -> compact design/ADR only when a decision must precede code
  -> implementation PR
  -> affected deterministic and specialist checks
  -> independent review
  -> protected merge
```

Exact-revision review is required when stale evidence could invalidate the protected
decision. Harmless PR-description edits must not invalidate an unchanged code SHA.
Protected changes require one non-author native approving Review plus applicable
CODEOWNERS or specialist evidence. Missing reviewer capability blocks rather than
falling back to self-declared identity.

### External Action

Applies to secrets, spending, contracts, production access, DNS, learner data,
irreversible mutations, and public launch.

```text
explicit human authority -> exact action and rollback -> protected environment
  -> execution -> sanitized readback
```

Repository merge eligibility does not grant this authority.

## Canonical artifacts

The final active tree should contain:

- one concise normative governance/workflow document;
- root and scoped `AGENTS.md` files describing architecture, commands, and links;
- one concise issue template and one concise PR template;
- ADRs or compact specifications only for durable product/architecture decisions;
- one small machine-readable check/path policy if generation or validation benefits;
- GitHub PRs, reviews, checks, releases, deployments, and Git history as lifecycle
  evidence;
- a deterministic digest/index for removed historical governance artifacts when
  required for audit lookup.

It should not contain active nine-file packages, manually synchronized lifecycle
state, PR-body evidence JSON, or validators that re-interpret old GitHub comments and
URLs on every change.

## GitHub topology

The final repository uses `main` as the single protected trunk. Required properties:

- deletion and non-fast-forward protection;
- squash-only linear history;
- pull requests for changes;
- required conversation resolution;
- stable required aggregate checks;
- merge queue when parallel PR integration is active;
- immutable `v*` release tags;
- stale-review dismissal after every pushed revision;
- one non-author approving Review for Protected paths;
- automatic deletion of merged short-lived branches where safe;
- no permanent `develop` branch or main-to-develop synchronization loop.

No permanent administrator bypass should be installed. A future break-glass path
requires an explicit, time-bounded decision and audit record.

## CI behavior

Required workflows start on `pull_request`, `push` to `main`, and `merge_group` where
the check participates in the merge queue. Each has a cheap change detector and a
stable aggregate gate that uses `if: always()` or equivalent semantics. Relevant
work runs by path; irrelevant expensive work skips while the aggregate reports a
valid result. Missing/invalid comparison bases cause more tests to run.

The smallest initial gate set should cover:

1. repository policy and action pinning;
2. web/package checks;
3. API/D1 checks;
4. integration/quality checks;
5. security checks.

The implementation may consolidate further if it preserves clear ownership and
stable ruleset names. Documentation-only work must not start expensive application
and local-stack suites merely to produce an unrelated gate.

## Review behavior

GitHub-native review objects, inline threads, check runs, and authenticated bot/app
identities are the evidence source. Automated reviewers:

- receive least privilege;
- cannot edit, push, merge, change settings, access deployment secrets, or execute
  untrusted fork content in a secret-bearing context;
- treat issue/PR content as untrusted;
- report concrete file/line findings and confidence;
- rerun when requested or when protected code materially changes.

Ordinary Standard work needs proportionate review. Protected work requires a
different non-author reviewer with relevant scope. External Action always retains
the separately accountable human.

## EHR

EHR applies only to irreducible high-consequence uncertainty. The runbook records:

- exact operation stopped;
- exact disputed question and competing evidence;
- selector/owner;
- required reviewer qualification;
- response target;
- permitted additional technical adjudication;
- outcomes: uphold, reject, narrow correction, revert, abandon, or supersede;
- evidence URL and clearing statement;
- unchanged external-action holds.

Existing PR #215 and issue #231 remain scoped under the pre-change EHR record.
No file, validator, release mechanism, branch, or policy that is the subject of those
records may be removed or functionally superseded before its qualified-human
disposition. Issue #191 prohibits promotion and release/ref action until both outcomes
and required corrections are permanently complete.

## Transition

PR1 stages the dual-compatible future model and permanent policy aggregate without
replacing active authority; it may merge to `develop` but cannot be promoted while the
release EHR stop remains. PR2 applies qualified-human outcomes for PR #215 and issue
#231 plus every correction or exact one-time release procedure their outcomes require.
PR1/PR2 use legacy gates plus the exact tracked verifier digest. Additive settings
action A then protects immutable verifier/rollback refs, keeps merge commits and old
gates, and adds
`main` to the staging policy; immediate doc-only PR3 records live truth. PR4 performs
the coherent cleanup under the ref-pinned old verifier and receives the final
merge-commit promotion/synchronization. Only afterward may action B enable squash-only
linear main, merge queue, future gates/reviews, sole-main staging, and ordered develop
retirement. Immediate doc-only PR5 is still required to pass the immutable old verifier
through permanent `Policy / required`; the future model governs ordinary work only
after PR5 merges.

## Security, privacy, data, and accessibility

This package changes repository process, not product behavior. It must preserve all
existing application security, privacy, migration, API, AI-safety, and accessibility
tests applicable to their paths. It may change when they run, never silently remove
their ability to block an applicable PR or release.
