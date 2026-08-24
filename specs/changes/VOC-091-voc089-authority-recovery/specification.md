# VOC-091 - Recover VOC-089 implementation authority prospectively: Specification

## Objective and requirement source

Issue [#148](https://github.com/KARSIFT/vocanova-platform/issues/148) records that
PR #141 merged despite an explicit final pre-merge normalized Governance adapter result
of `eligible: false`. The exact later review was genuine evidence, but it came after
the adapter evaluated a blank evidence binder; the body was never refreshed and no new
adapter run established eligibility. The merge thus cannot satisfy the normal governed
activation boundary described by DOC-16. VOC-089 implementation authority is not
effective, and PR #147 must remain blocked.

The desired outcome is a small, prospective, repository-only recovery that makes the
current VOC-089 record truthful, preserves every incident fact, and provides the only
path by which VOC-089 authority may later become effective. It does not normalize the
invalid merge retroactively.

## Scope

In scope:

- Correct the nine active VOC-089 package records listed in `change.yaml` to state
  that PR #141 merged but did not activate implementation authority because the
  required pre-merge decision was blocked.
- Preserve the exact blocked adapter JSON, later review, inaccurate readiness claim,
  merge SHA, post-merge evidence, incident-audit verdict, and PR #137 distinction.
- Define one recovery implementation PR and one task that may establish authority only
  through its own exact review, populated binder, genuine pre-merge
  `eligible: true` / `reasons: []`, normal merge, and applicable post-merge checks.
- Keep PR #147 open as a draft blocked record; after recovery it must rebase/refresh to
  the recovery merge and independently satisfy the normal implementation gates anew.

Out of scope:

- Editing VOC-087, PR #147, any product source/test, workflow, evaluator, validator,
  repository setting, Cloudflare/live system, deployment, `main`, secret, production
  data, branch, or external system.
- Rewriting PR #141, its body, comments, runs, merge, or post-merge history.
- Treating any earlier review, check, or result on PR #147 as future authority.
- Closing issue #140 or issue #148 before their separately defined completion bounds.

## Requirements and decisions

- `VOC-091-D00` — Preserve, verbatim in meaning and with exact anchors, the PR #141
  incident: bookkeeping head `09290d7f745e5b66e4611c47d4f1ee27861611d9`, base
  `66c2cd20ab7197dd9af34dc2b78a4d03b2c5b48d`, adapter run `32722390643`, timestamp
  `2026-08-24T11:33:44Z`, decision `blocked`, `eligible: false`, all five reason codes,
  later review comment `5394643309`, inaccurate readiness comment `5394657645`, merge
  `925faf774ded5128c8aef2a298a8d6f506164ee0`, post-merge CI `32722900390`, Governance
  `32722900352`, Security `32722900426` (all passing on that merge SHA), and audit
  `5394825877`. The post-merge passes must be recorded as valid deterministic evidence
  that cannot retroactively validate the missing pre-merge eligibility decision.
- `VOC-091-D01` — Change VOC-089 active authority fields so they make no claim that
  PR #141 was a normal merge or that it activated implementation. The original
  semantic-candidate PASS and adoption decision remain valid adoption/authorization
  evidence, while `implementation.authority_effective: false` records that their
  effectiveness was not established through PR #141. Preserve
  `implementation_authorized: true` and add a machine-readable recovery-pending
  distinction; recovery completion may make the existing bounded authorization
  effective without rewriting the decision.
- `VOC-091-D02` — Define exactly one future recovery implementation PR, limited to the
  nine listed VOC-089 package files. It must record its own exact final SHA review by a
  different non-author actor, one fully populated `merge-eligibility-evidence-v1`
  binder bound to that SHA, a real pre-merge adapter JSON with `eligible: true` and
  `reasons: []`, normal merge, and applicable post-merge CI/Governance/Security evidence
  before authority is effective. A passing job conclusion alone is never sufficient.
- `VOC-091-D03` — Require an auditable binder check: reviewer identity and role,
  reviewed SHA equal to the final head, passing verdict, resolved blocking findings,
  and evidence URL must be populated before the eligibility run. Any later body or
  code change invalidates that result and requires fresh exact review/binder/run.
- `VOC-091-D04` — PR #147 may remain open only as a draft with its existing authority
  hold. After VOC-091's recovery implementation merge and applicable post-merge passes,
  it must rebase or otherwise refresh onto the recovered `develop`, update its body to
  cite the recovery evidence, rerun applicable checks, receive a new different-actor
  exact-SHA review, populate its own binder, obtain its own genuine pre-merge
  `eligible: true` / `reasons: []`, merge normally, and pass post-merge checks. If it
  cannot safely rebase or its approved VOC-089 scope is no longer exact, it must close
  and return to governed planning; neither option transfers its current evidence.
- `VOC-091-D05` — Issue #148 may close only after the VOC-091 recovery implementation
  merge and applicable post-merge checks. Issue #140 remains open until the later PR
  #147 completion boundary is met. No recovery result authorizes a deployment or any
  action outside repository history.
- `VOC-091-D06` — The recovery must preserve the PR #137 sequencing audit as a distinct
  precedent: it had genuine pre-merge eligibility; its substantive-validity finding
  cannot be copied to PR #141.
- `VOC-091-D07` — Preserve VOC-089's adopted objective and inactive future
  implementation contract: D00-D05, AC00-AC04, their task/test/evidence mappings, the
  exact eight-file VOC-087 allowlist, one `VOC-089-T00` implementation PR, R3 risk,
  non-goals, rollback, and issue #140 completion boundary. Add an authority/incident
  overlay only; do not delete, broaden, substitute, or silently repurpose that contract.

## Risk and protected areas

The effective semantic risk is R3: the change corrects canonical implementation
authority and lifecycle evidence in a protected governance record. It has no R4
semantic trigger because it does not alter governance policy or enforcement, confer
standing authority, create an irreversible external action, or expand system autonomy;
it applies the existing fail-closed contract to a single prior breach. The changed-path
classifier may report a lower structural floor, which does not lower the declared R3.

The protected areas are canonical package lifecycle evidence and implementation
authority evidence. No EHR or action-specific external authority is triggered.
