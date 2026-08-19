# VOC-079 — Acceptance Criteria

## VOC-079-AC-00 — Active governance is approval-neutral by risk class

- Decisions: `VOC-079-D00`, `VOC-079-D04`
- Tasks: `VOC-079-T00`, `VOC-079-T03`
- Tests: `VOC-079-TEST-00`, `VOC-079-TEST-05`
- Evidence: `VOC-079-EV-00`, `VOC-079-EV-05`
- Result: pending

Every active canonical policy says R4 requires stronger consequence-specific evidence
but no founder approval solely because it is R4. Historical records remain accurate and
are not treated as current authority.

## VOC-079-AC-01 — Separation of duties applies to humans and agents

- Decisions: `VOC-079-D01`, `VOC-079-D05`
- Tasks: `VOC-079-T00`, `VOC-079-T01`
- Tests: `VOC-079-TEST-01`
- Evidence: `VOC-079-EV-01`
- Result: pending

Active guidance and validation require different builder and reviewer roles, exact-
revision verdicts, and resolution of blocking findings for every meaningful plan and
implementation. No vendor-specific identity is made permanent policy.

## VOC-079-AC-02 — R4 is not a hard merge-eligibility block

- Decisions: `VOC-079-D02`, `VOC-079-D06`
- Tasks: `VOC-079-T01`
- Tests: `VOC-079-TEST-02`, `VOC-079-TEST-03`
- Evidence: `VOC-079-EV-02`, `VOC-079-EV-03`
- Result: pending

The local, read-only eligibility evaluator and its policy tests prove an R4 package
with `automatic_merge_allowed: true`, passing checks,
complete R4 evidence, an exact-revision independent PASS, no active EHR, and no explicit
external-effect hold is eligible under the same policy as R0–R3. The risk value alone
must not block it. The evaluator performs no merge or other GitHub write.
On a real pull request, the Governance workflow's read-only adapter reports the same
decision and reasons in its job summary/check result.

## VOC-079-AC-03 — Unsafe R4 changes still fail closed

- Decisions: `VOC-079-D00`, `VOC-079-D01`, `VOC-079-D03`
- Tasks: `VOC-079-T01`
- Tests: `VOC-079-TEST-03`
- Evidence: `VOC-079-EV-03`
- Result: pending

Negative tests block missing/failed CI, missing or self-authored review, stale-revision
review, incomplete R4 evidence, unresolved blocking findings, active EHR, unparseable
risk, explicit package opt-out, and unmet action-specific authority.

## VOC-079-AC-04 — Package drafting is consistent across R0–R4

- Decisions: `VOC-079-D02`
- Tasks: `VOC-079-T00`, `VOC-079-T02`
- Tests: `VOC-079-TEST-04`
- Evidence: `VOC-079-EV-04`
- Result: pending

`AGENTS.md`, the change-package template, examples, and validation agree that
`automatic_merge_allowed` is examined for every package, defaults to `true` for R0–R4,
and may be set to `false` only with a package-local reason. This transition package's
pre-transition `false` is explicitly historical and exempt from the new default.

## VOC-079-AC-05 — All active descriptions and enforcement agree

- Decisions: all
- Tasks: `VOC-079-T00` through `VOC-079-T03`
- Tests: `VOC-079-TEST-00`, `VOC-079-TEST-05`
- Evidence: `VOC-079-EV-00`, `VOC-079-EV-05`
- Result: pending

A repository-wide semantic inventory accounts for every R4/founder/approval/automatic-
merge reference in active documents, templates, scripts, and workflows. No active
called external workflow continues to hard-block R4. Contradictions fail validation.
DOC-16's amendment history and a dedicated decision record preserve the transition,
reviewed revision, and old/new authority boundary.
DOC-16's orchestrator-originated path no longer excludes R4 by class and delegates to
the same evidence contract used for every contributor type.

## VOC-079-AC-06 — Change is reversible and has no live-system effect

- Decisions: `VOC-079-D03`, `VOC-079-D04`
- Tasks: `VOC-079-T03`
- Tests: `VOC-079-TEST-06`
- Evidence: `VOC-079-EV-06`
- Result: pending

The implementation changes repository policy only, performs no deployment or settings
mutation, and can be reverted to the pre-transition governance revision with validation
passing under the restored rules.
