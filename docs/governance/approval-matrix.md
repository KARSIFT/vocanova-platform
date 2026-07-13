# Approval Matrix

Verification answers whether evidence supports the change. Approval answers whether
an accountable authority authorizes it. Both may be required.

## Current authority assignment

- Founder: `@m-e-h-r-d-a-a-d`
- Qualified Human Technical Steward: `@m-e-h-r-d-a-a-d`
- Current relationship: the same verified human serves in two explicitly separate
  capacities, as recorded in
  [technical-steward-appointment.md](technical-steward-appointment.md)

R3 approval is available from the recorded steward. R4 founder approval remains
independently required. A combined R3/R4 change requires explicit approval in both
capacities; the same account may evidence both only when the approval text names both
roles and the exact reviewed revision. The builder and independent verifier remain
separate from both human approval capacities.

| Change/action | Builder | Independent verifier | Technical steward | Founder | Automation permission |
|---|---|---|---|---|---|
| R0 non-behavioral change | May implement | Required, lightweight for trivial changes | Not required | Not required | Merge/release after applicable checks |
| R1 reversible implementation | May implement approved spec | Required | Not required | Not required | Merge/release after all gates |
| R2 moderate implementation | May implement approved spec | Required with relevant specialist coverage | Optional domain review; required if verifier detects protected effect | Not required | Merge/release only after stronger checks and rollback evidence |
| R3 protected technical change | May implement; cannot self-approve | Required | Required from a qualified accountable human | Not required unless also R4 | No protected merge/release before steward approval |
| R4 consequential decision/change | May implement only after decision approval | Required | Required if technically protected | Required | No protected merge/release before founder approval |
| Initial public or major launch | May prepare release | Required release review | Required for included R3 changes | Required go/no-go | Publish only after recorded founder approval |
| Initial DOC-16/A-002 governance adoption | May prepare the one bootstrap PR | Required Claude Code verification with no unresolved Critical/High finding | One-time exception because no steward exists; must be recorded as unsatisfied, not approved | Required | Merge to `develop` only; no production deployment or autonomous release authority |
| Emergency protective rollback using approved runbook | May execute only through authorized workflow | Post-action verification required | Pre-authorized runbook owner or incident authority | Notify; approval required for any new R4 decision | May run automatically when predefined trigger and safer-than-waiting condition are met |
| Change to CI/CD, ownership, approval, agent authority, or this matrix | May propose | Independent governance/security review required | Required | Required when authority or R4 policy changes | Cannot self-modify into effect |

## Approval evidence

An approval is valid only when it is attributable to the configured GitHub identity,
bound to the reviewed commit or pull-request revision, recorded in GitHub, and not
dismissed by later material changes. Private chat approval is insufficient.

If one person serves as both founder and qualified technical steward, the release
record must state both roles explicitly. One GitHub approval may evidence both roles
only when repository policy formally records that dual capacity.

The initial DOC-16/A-002 bootstrap row is the only exception to an otherwise
applicable steward requirement. It expires when that initial pull request merges.
The later appointment of a steward does not retroactively change PR #3 evidence and
does not convert Claude Code review into steward approval.

## Independent verifier result

The verifier reports `PASS`, `PASS WITH NON-BLOCKING FINDINGS`, or `FAIL`. Any open
Critical, High, or required Medium finding blocks merge. The builder cannot be the
independent verifier. If the verifier authors a substantial correction, all checks
rerun and a separate independent review is required for the correction.
