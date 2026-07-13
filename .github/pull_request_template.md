## Objective and traceability

- Business/product objective:
- Approved Vocanova requirement or decision:
- Linked issue/specification (`VOC-###` where applicable):
- Implementation tasks/commits:

Change mode: <!-- Standard | Lightweight R0 -->
Risk classification: <!-- Replace with exactly R0, R1, R2, R3, or R4 -->

Use `Lightweight R0` only for a non-behavioral, non-policy documentation or small
maintenance change. For that path, complete the objective, scope, risk, checks, and
verifier result; mark genuinely irrelevant standard sections `N/A` with one reason.

## Summary and scope

- What changed:
- In scope:
- Out of scope:

## Risk and approvals

- Risk rationale:
- CI-detected risk floor:
- Affected protected areas (or `None`):
- Required approval class:
  - [ ] R0-R2 — independent verifier and applicable gates
  - [ ] R3 — qualified human technical steward
  - [ ] R4 — founder (plus steward if technically protected)
  - [ ] Initial DOC-16/A-002 bootstrap — founder + Claude verification + repository
        validation; no steward approval claimed and no production authorized
- Technical-steward approval link/name or `N/A`:
- Founder approval link/name or `N/A`:

## Acceptance-criteria evidence

| Criterion | Test or observable evidence | Result |
|---|---|---|
| AC-## |  |  |

## Validation evidence

- Commands executed and results:
- CI run:
- Preview deployment URL/status or `N/A` with reason:
- Independent-verifier report/result:

## Impact assessments

- Security and privacy:
- Migration/data integrity:
- Rollback trigger, mechanism, and owner:
- Analytics/telemetry:
- Accessibility:
- Documentation:
- Cloudflare/deployment/operations:

## Release and outcome

- Release/feature-flag plan:
- Monitoring and post-release outcome owner:
- Known limitations/follow-up issues:

## Author checklist

- [ ] The effective risk is not below the CI-detected floor.
- [ ] The change stays within the approved scope and contains no unrelated cleanup.
- [ ] All installed checks relevant to this change pass; unavailable checks are
      disclosed rather than represented as passing.
- [ ] No secrets, credentials, or unnecessary personal data are included.
- [ ] Material changes after review will dismiss or renew approvals and verification.
- [ ] AI implementation/review provenance is disclosed above.
