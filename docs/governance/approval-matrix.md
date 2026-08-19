# Approval Matrix

Verification answers whether evidence supports the change. Approval answers whether
an accountable authority authorizes it. Both may be required.

## Current approval-neutral authority assignment

- Founder: `@m-e-h-r-d-a-a-d`
- Historical Qualified Human Technical Steward: `@m-e-h-r-d-a-a-d`
- Historical relationship: the same verified human served in two explicitly separate
  capacities for the completed VOC-002 migration, as recorded in
  [technical-steward-appointment.md](technical-steward-appointment.md)

A-003 remains historical authority for retiring the standing steward role. VOC-079
extends the evidence-driven model across R0-R4: no class requires founder or standing
technical-steward approval merely because of its label. R4 still requires the strongest
decision, impact, contingency, specialist, deterministic, and exact-revision review
evidence. EHR applies only when an actual exceptional trigger exists.

Every meaningful plan and implementation has a builder and a different reviewer.
Builders cannot verify, approve, or merge their own revision. Independent verification
must name the exact revision and all blocking findings must be resolved. Humans and AI
agents may fill either role; vendor identity does not create authority.

| Change/action | Independent verification and controls | Additional action-specific authority | Automation permission |
|---|---|---|---|
| Routine R0-R2 | Proportionate deterministic checks and exact-revision independent verification | None from risk class | Only where separately implemented and proven |
| Routine R3 protected technical work | Strengthened risk-specific controls, specialist evidence, and exact-revision independent verification | None from risk class | Only where every applicable technical gate is implemented and proven |
| R4 consequential decision/change | R3 controls too when technically protected; explicit decision and impact records; contingency/rollback evidence; exact-revision independent verification | None from risk class; separately named external-effect authority still applies | Eligible only when the complete R4 evidence contract and every explicit hold pass |
| Initial public or predefined major launch | Complete R4 and independent release evidence plus every applicable technical gate | Recorded go/no-go from the role explicitly assigned launch authority | Publish only after that authority and technical activation are evidenced |
| Emergency protective rollback using approved runbook | Post-action verification and permanent evidence | Pre-authorized runbook/incident authority; any new external effect uses its separately defined authority | Only a predefined safer-than-waiting action may execute automatically |
| Change to CI/CD, ownership, approval, agent authority, or this matrix | Independent governance/security review, privilege analysis, contingency evidence, and fail-closed validation | None from risk class; the pre-change rules govern the transition | Cannot self-modify into effect |
| EHR escalation | Operation stops and qualified expertise is recorded | Exceptional qualified human review for the triggered matter only | Not a routine approval layer |

The one-time VOC-002 migration approval and the pre-transition VOC-079 founder approval
are exhausted and must never be reused. CODEOWNERS remains review routing and is not
approval evidence. No historical record supplies approval for later work.

## Approval evidence

An approval or action-specific authority record is valid only when it is attributable
to the accountable role, bound to the reviewed commit or action, recorded in GitHub,
and not dismissed by later material changes. Private chat approval is insufficient.

The completed VOC-002 approval explicitly named both founder and technical-steward
capacities and remains historical evidence only; it cannot approve later work.

The historical initial DOC-16/A-002 bootstrap row was the only exception to the
steward requirement then applicable. It expired when that initial pull request merged.
The later appointment of a steward does not retroactively change PR #3 evidence and
does not convert Claude Code review into steward approval.

VOC-002 was not an exception: it used the pre-A-003 requirements in full. Its
technical-steward approval was a one-time migration requirement, is now exhausted,
and is not a standing future rule.

VOC-079 likewise used the R4 founder rule effective before its transition. The founder
approval on PR #75 applies only to the adopted package candidate and cannot be treated
as a class-wide or future approval requirement under the new model.

## Independent verifier result

For an exact revision, the verifier reports `PASS`, `PASS WITH NON-BLOCKING FINDINGS`,
or `FAIL`. Any open Critical, High, or required Medium finding blocks merge. The builder cannot be the
independent verifier. If the verifier authors a substantial correction, all checks
rerun and a separate independent review is required for the correction.
