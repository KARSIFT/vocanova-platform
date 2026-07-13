# Post-Merge Governance Activation Checklist

Status: Not activated

This checklist begins after the initial DOC-16/A-002 governance pull request merges.
The bootstrap exception expires on that merge. No unchecked item is implied to be
complete, and no production or autonomous-release authority is granted by the merge.
Record an evidence link, accountable human, and completion date for every item.

## Human authority and GitHub identities

- [ ] Appoint a qualified, accountable human technical steward and record the scope
      of that appointment.
- [ ] Create a GitHub technical-steward team containing only verified qualified human
      identities.
- [ ] Add the verified team slug to protected CODEOWNERS patterns and remove any
      temporary routing that is no longer appropriate.
- [ ] Verify that no founder, steward, Codex, Claude, or automation identity
      placeholder remains in executable repository controls.
- [ ] Configure distinct, least-privilege Codex implementation and Claude Code
      independent-verifier identities. Neither may belong to the steward team.

## Repository enforcement

- [ ] Protect `develop`: pull requests only, required policy/application checks,
      independent verification, stale-approval dismissal, conversation resolution,
      code-owner review, and no unaudited bypass.
- [ ] Protect `main`: release pull requests only, required release gates, no direct or
      force pushes, and conditional R3/R4 approvals.
- [ ] Configure a non-self-referential governance ruleset for the fixed R4 paths in
      [repository-settings.md](repository-settings.md).
- [ ] Test that R3 changes cannot merge or release without the real technical-steward
      approval and that R4 changes cannot proceed without founder approval.

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
- [ ] Record founder authorization to enable the approved autonomous-release classes
      only after every prerequisite above passes.

Until all applicable activation items are evidenced, R3 production changes remain
blocked and autonomous production release remains disabled.
