# VOC-079-T03 — Pre-merge verification and transition record

Date: 2026-08-19

Status: implementation candidate verified through T02; T03 exact-revision review,
one-time pre-transition implementation approval, stack merge, and post-merge
verification remain pending. This record grants no approval and makes no activation,
deployment, or hosted-enforcement claim.

## Authority boundary

VOC-079 was adopted under the R4 rule effective before this transition. Its exact
package candidate `25a3e246b8f66dd4b92ea9726eb5367c16363018` received independent
review and founder approval on PR #75. Those adoption records authorized implementation
but cannot approve the implementation revision, authorize their own replacement, or be
reused for later work.

The release plan also requires one exact-revision founder approval for the final
implementation candidate after independent review. That approval is **pending** and
must be recorded on the final T03 pull request. Until it exists and the stack is merged,
the package's deliberate `automatic_merge_allowed: false` remains the only correct live
adapter result. No agent may manufacture or infer the pending approval.

After transition, risk remains consequence-based. R4 retains the strongest decision,
impact, contingency, specialist, deterministic, exact-revision independent-review, and
blocking-finding-resolution evidence. Risk class alone creates no personal approval
gate. Contracts, spending, secrets or personal-data disclosure, production access,
irreversible external mutations, initial public or predefined major launches, and
genuinely triggered EHR remain separately evaluated holds.

## Stacked implementation evidence

| Task | Exact implementation SHA | Draft PR | Independent evidence | Hosted evidence |
|---|---|---|---|---|
| T00 — reconcile authority | `9ca0e64d5b88c72b5a7dcd9693cfa047c843ecf2` | [#80](https://github.com/KARSIFT/vocanova-platform/pull/80) | [PASS with no blocking findings](https://github.com/KARSIFT/vocanova-platform/pull/80#issuecomment-5346154712) | [four-workflow proof](https://github.com/KARSIFT/vocanova-platform/pull/80#issuecomment-5346205614) |
| T01 — read-only eligibility | `07104a3ba7fe59ef055c2d30c09d32fb1756d638` | [#81](https://github.com/KARSIFT/vocanova-platform/pull/81) | [machine-bindable PASS record](https://github.com/KARSIFT/vocanova-platform/pull/81#issuecomment-5347186697) | [four-workflow and live-adapter proof](https://github.com/KARSIFT/vocanova-platform/pull/81#issuecomment-5347203813) |
| T02 — package drafting | `282cdc3bffd469b5d37895acd1d70415fb02c0f1` | [#82](https://github.com/KARSIFT/vocanova-platform/pull/82) | [exact-SHA PASS](https://github.com/KARSIFT/vocanova-platform/pull/82#issuecomment-5347355771) | [four-workflow and live-adapter proof](https://github.com/KARSIFT/vocanova-platform/pull/82#issuecomment-5347407480) |
| T03 — final verification | recorded on the final T03 draft PR | pending | pending exact-revision independent review | pending exact-SHA hosted proof |

Every published PR is draft and retains its intended stacked base. None was self-
approved or self-merged.

## Acceptance and test inventory

- **VOC-079-AC-00 / TEST-00:** active governance sources define R0-R4 as consequence
  classes and prohibit a personal gate caused solely by risk label. Historical approval
  wording remains explicitly historical or action-specific.
- **VOC-079-AC-01 / TEST-01:** the evaluator and contributor guidance require distinct
  builder/reviewer identities and roles, exact-head PASS, and resolved blocking
  findings. Humans and AI agents may fill either role without permanent vendor status.
- **VOC-079-AC-02 / TEST-02:** the pure eligible-R4 fixture passes with complete evidence
  and no class-wide founder field. The evaluator performs no external action.
- **VOC-079-AC-03 / TEST-03:** missing/failed checks, missing/stale/self-authored review,
  unresolved findings, invalid risk, incomplete R4 evidence, active EHR, package opt-out,
  and unmet action authority each fail closed with concrete reasons.
- **VOC-079-AC-04 / TEST-04:** R0-R4 `true` defaults and reasoned `false` holds pass;
  unreasoned or placeholder holds fail. VOC-079 is pinned as the sole pre-transition R4
  exception, historical VOC-001 through VOC-078 records are unchanged, and VOC-080+
  packages are enforced.
- **VOC-079-AC-05 / TEST-05:** active governance, contributor guidance, templates,
  validators, and the four workflows agree. DOC-16 contains no `not R4` orchestrator
  exclusion; GitHub remains the canonical evidence layer.
- **VOC-079-AC-06 / TEST-06:** the exact final reverse-order rollback result is recorded
  on the T03 PR after the T03 commit exists. The rehearsal is repository-only and may
  not mutate settings, infrastructure, production, secrets, or external systems.

## Semantic inventory classification

The final inventory covers `AGENTS.md`, `CONTRIBUTING.md`, `.github` guidance and policy,
DOC-15, DOC-16 and active governance documents, ADRs, change-package templates,
governance scripts, the pure evaluator, adapter, schema, and workflow files.

- The workflow inventory is exactly `ci.yml`, `governance.yml`, `quality.yml`, and
  `security.yml`.
- No workflow calls `KARSIFT/karsift-ai-infra`, dispatches an agent, approves, comments,
  merges, closes, releases, deploys, polls servers, or mutates Cloudflare or Sentry.
- Founder references that remain active concern explicit product/external-effect
  authority or the one-time pre-transition VOC-079 implementation approval—not R4 by
  class. Earlier DOC-15 design rules are retained with correction or supersession
  markers and do not override DOC-15 §17 or DOC-16 v3.0.
- EHR remains exceptional and cannot become a standing approval layer.
- State mirrors keep production deployment and autonomous release disabled after
  VOC-078 retirement.

## Required final evidence

The final T03 PR must record, in this order:

1. complete local validation and the semantic inventory;
2. reverse-order rollback proof for T03, T02, T01, and T00 in a disposable worktree;
3. independent governance/security review bound to the exact T03 SHA;
4. all four hosted workflows and the read-only adapter result at that SHA;
5. the one-time exact-revision founder implementation approval required by the
   pre-transition release plan; and
6. post-merge verification before any statement that VOC-079 is active on `develop`.

The expected pre-merge adapter result remains `blocked` solely by `package.opt_out`.
No automatic merge, promotion to `main`, deployment, server monitoring, or repository
settings mutation is authorized by this record.
