# Post-Merge Governance Activation Checklist

Status: Not activated

## A-003 adoption and effective-activation boundary

A-003 is not effectively active. The VOC-002 adoption PR cannot check or pre-populate
any post-merge item below.

- [ ] Record the exact approved VOC-002 PR head SHA.
- [ ] Record the distinct resulting adopted `develop` SHA; do not conflate it with a
      squash-merged PR head.
- [ ] Confirm exact-SHA pre-A-003 Claude verification, R4 founder approval, and R3
      technical-steward transition approval existed before adoption.
- [ ] Run deterministic governance validation on the adopted `develop` state and
      preserve the run evidence against that adopted SHA.
- [ ] Record effective-activation evidence and mark the one-time migration approval
      exhausted and non-reusable.
- [ ] Reconcile canonical lifecycle fields in a later bounded PR without changing
      frozen A-003 substantive policy.

Until all six items are evidenced, pre-A-003 authority remains current. After valid
activation, routine R3 does not require a standing technical steward or founder
approval merely because it is R3; R4 remains founder-controlled and EHR remains
exceptional-only.

This checklist begins after the initial DOC-16/A-002 governance pull request merges.
The bootstrap exception expires on that merge. No unchecked item is implied to be
complete, and no production or autonomous-release authority is granted by the merge.
Record an evidence link, accountable human, and completion date for every item.

## Human authority and GitHub identities

- [x] Appoint a qualified, accountable human technical steward and record the scope.
      Evidence: [technical-steward-appointment.md](technical-steward-appointment.md)
      and the required final dual-capacity approval bound to the exact head revision
      of the appointment pull request before merge.
- [ ] Preserve the current direct review routing while A-003 is inactive. Do not
      create a replacement standing technical-steward team as an activation condition.
- [ ] Verify that no founder, steward, Codex, Claude, or automation identity
      placeholder remains in executable repository controls.
- [ ] Configure distinct, least-privilege Codex implementation and Claude Code
      independent-verifier identities. Neither may be represented as founder,
      pre-A-003 steward, or EHR-qualified human authority.

## Repository enforcement

- [ ] Protect `develop`: pull requests only, required policy/application checks,
      independent verification, stale-approval dismissal, conversation resolution,
      code-owner review, and no unaudited bypass.
- [ ] Protect `main`: release pull requests only, required release gates, no direct or
      force pushes, and conditional R3/R4 approvals.
- [ ] Configure a non-self-referential governance ruleset for the fixed R4 paths in
      [repository-settings.md](repository-settings.md).
- [ ] Before A-003 activation, test current R3 steward and R4 founder enforcement.
      After activation, test strengthened R3 gates without routine steward/founder
      approval and unchanged R4 founder enforcement.

## Engineering and deployment gates

- [ ] Add frozen pnpm installation and the real format, lint, type, unit, integration,
      build, security, migration, and accessibility commands when application code
      and package scripts exist.
- [ ] Configure isolated Cloudflare preview, staging, and production projects,
      credentials, environment bindings, and access boundaries.
- [ ] Configure monitoring, health checks, evidence retention, incident ownership,
      last-known-good deployment, and tested rollback/recovery.
- [ ] Configure preview/staging status and protected production release gates.

## Activation rehearsal

- [ ] Rehearse the full release gate in a non-production environment, including a
      forced failure and rollback.
- [ ] Independently verify ruleset behavior, identity separation, secret isolation,
      monitoring, and rollback evidence.
- [ ] Separately record technical authorization for any autonomous-release class only
      after every applicable prerequisite is implemented, tested, and proven. A-003
      policy permission alone is not technical activation.

Until all applicable activation items are evidenced, R3 production changes remain
blocked and autonomous production release remains disabled.
