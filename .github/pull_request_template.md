## Objective and traceability

- Business/product objective:
- Approved Vocanova requirement or decision:
- Linked issue/specification (`VOC-###` where applicable):
- Change-package status and canonical path:
- Requirement source:
- Stable acceptance-criteria mapping:
- Implementation tasks/commits:
- Planned delivery shape (`1 package / 1 implementation PR / 1 minimum-sufficient task` by default):
- Planned implementation pull-request count:
- Task-to-PR mapping:
- Multi-PR rationale or `N/A — one coherent PR default`:

Change mode: <!-- Standard | Lightweight R0 -->
Risk classification: <!-- Replace with exactly R0, R1, R2, R3, or R4 -->

Use `Lightweight R0` only for a non-behavioral, non-policy documentation or small
maintenance change. For that path, complete the objective, scope, risk, checks, and
verifier result; mark genuinely irrelevant standard sections `N/A` with one reason.

## Summary and scope

- What changed:
- In scope:
- Out of scope:
- Largest-safe-coherent-unit evidence (backend/frontend/contracts/tests/docs/rollback/evidence sharing one outcome):

## Existing-file reconciliation

| Path | Classification                                                                                    | Preserved content | Reconciliation |
| ---- | ------------------------------------------------------------------------------------------------- | ----------------- | -------------- |
| path | present-compatible / present-needs-reconciliation / absent-approved-to-create / material-conflict |                   |                |

- Previous governance control:
- Proposed governance control:
- Active authority model (`VOC-079 approval-neutral` once the governed transition is activated):
- Governance lifecycle impact (`none` or direction/approval/adoption/activation/sync):

## Risk and approvals

- Risk rationale:
- CI-detected risk floor:
- Affected protected areas (or `None`):
- Required risk evidence:
  - [ ] R0-R2 — independent verifier and applicable gates
  - [ ] R3 — strengthened applicable controls and independent verification; no
        standing steward/founder approval solely because work is R3
  - [ ] R4 — decision and impact records, contingency/rollback evidence, applicable
        specialist and deterministic checks, and exact-revision independent review;
        no founder approval solely because work is R4
  - Historical VOC-002 migration — exhausted and permanently non-reusable
  - Historical initial DOC-16/A-002 bootstrap — expired with PR #3 and unavailable
    to later changes; no checkbox or waiver exists
- Exceptional-human-review evidence or `N/A — no EHR trigger`:
- Action-specific authority and evidence or `N/A`:
- Historical transition approval or `N/A — not reusable`:
- Exact reviewed head SHA:
- Blocking-findings resolution:
- Adopted `develop` SHA or `N/A — pre-merge`:
- Effective-activation evidence or `N/A — inactive`:

## Acceptance-criteria evidence

| Criterion | Test or observable evidence | Result |
| --------- | --------------------------- | ------ |
| AC-##     |                             |        |

## Validation evidence

- Commands executed and results:
- CI run:
- Preview deployment URL/status or `N/A` with reason:
- Independent-verifier report/result:
- Implementer provenance: actor identity, role, and authorship provenance
- Verifier provenance: actor identity, role, exact-SHA independence, and optional runtime provenance
- External-orchestrator provenance/version or `N/A` (provenance only; never authority):

Complete the machine-readable block after exact-revision independent review. Keep it
as JSON data; do not add shell expressions or credentials. Use an empty
`action_authority` array only when no action-specific hold applies.

<!-- merge-eligibility-evidence-v1
{
  "builder": { "identity": "", "role": "implementer" },
  "reviewer": {
    "identity": "",
    "role": "independent-reviewer",
    "reviewed_sha": "",
    "verdict": "",
    "blocking_findings_resolved": false,
    "evidence_url": ""
  },
  "risk_evidence": {
    "decision_record": false,
    "impact_assessment": false,
    "contingency_plan": false,
    "specialist_evidence": false,
    "deterministic_evidence": false
  },
  "ehr": { "active": false },
  "action_authority": []
}
-->

Actor identity is attributable provenance, not hosted cryptographic attestation.
Model/provider/runtime metadata is optional and never authority. A reviewer who
materially edits the revision becomes its builder; record a new SHA and a different
reviewer. A passing verdict or eligibility result never clears a separately defined
action-specific hold.

## Impact assessments

- Security and privacy:
- Migration/data integrity:
- Rollback trigger, mechanism, and owner:
- Analytics/telemetry:
- Accessibility:
- Documentation:
- Cloudflare/deployment/operations:
- Ruflo/orchestrator permission impact or `N/A`:

## Release and outcome

- Release/feature-flag plan:
- Monitoring and post-release outcome owner:
- Known limitations/follow-up issues:
- Hosted activation status:
- Automatic-merge status:
- Autonomous-production-release status:
- RL1/RL2 technical-activation status:
- Package closure status:

## Author checklist

- [ ] The effective risk is not below the CI-detected floor.
- [ ] The package's `automatic_merge_allowed` value was examined; R0–R4 default to
      `true`, and any `false` includes a package-local `automatic_merge_hold_reason`
      (except VOC-079's documented transition value).
- [ ] The planned delivery shape is the largest safe coherent unit for the approved
      outcome; task IDs are not being used as extra PRs without a recorded boundary
      and overhead rationale.
- [ ] The change stays within the approved scope and contains no unrelated cleanup.
- [ ] All installed checks relevant to this change pass; unavailable checks are
      disclosed rather than represented as passing.
- [ ] No secrets, credentials, or unnecessary personal data are included.
- [ ] Material changes after review will dismiss or renew approvals and verification.
- [ ] AI implementation/review provenance is disclosed above.
- [ ] No external orchestrator received GitHub write/merge, Cloudflare, secret,
      production-data, deployment, spending, DNS, or launch authority.
