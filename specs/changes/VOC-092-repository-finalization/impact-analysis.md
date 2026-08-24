# VOC-092 — Impact Analysis

## Security and privacy

No credential value, secret, personal data, production data, or live system is in
scope. GitHub API writes are restricted to one documented repository field and exact
validated branch refs. Ref names are treated as data, never interpolated through an
unvalidated glob or broad deletion command.

## Repository history, data, and migration

Promotion preserves the reviewed `develop` tree in `main` through a merge commit.
Remote branch deletion removes names, not commits from already merged canonical
history; the exact manifest preserves recreation SHAs. Local deletion is allowed only
after clean/no-unique-work proof. There is no application data migration.

## Analytics and accessibility

Not applicable: no product UI, event, learner flow, or runtime behavior changes.

## Risks, dependencies, and evidence

- `VOC-092-R00`: deleting the wrong ref or dirty worktree could lose recoverable work.
  Mitigation is exact enumeration, per-target predicates, no broad globs, no force,
  pre-recorded SHAs, and fail-closed preservation.
- `VOC-092-R01`: changing the setting without immediate documentation would create a
  false canonical record. Mitigation is same-session read-back and one coherent
  governed documentation PR.
- `VOC-092-R02`: `develop` movement between review and promotion could place unreviewed
  content on `main`. Mitigation is exact head freeze and fresh review after any drift.
- `VOC-092-R03`: promotion could be confused with production release. Mitigation is
  explicit repository-history-only scope and workflow inspection; Cloudflare delivery
  remains held and credential-free.
- `VOC-092-DEP-00`: issue #151 and the exact adopted package must authorize the
  external actions before execution.
- `VOC-092-DEP-01`: implementation and post-merge checks must pass before promotion.
- `VOC-092-DEP-02`: promotion and its post-merge checks must pass before destructive
  cleanup.
- `VOC-092-EV-00`: exact package review, adoption decision, bookkeeping review, and
  genuine eligibility evidence.
- `VOC-092-EV-01`: settings pre-state, payload, rollback payload, post-state, exact
  reconciled docs diff, checks, and specialist verdict.
- `VOC-092-EV-02`: frozen develop/main SHAs, compare/diff, release PR, exact review,
  merge SHA, tree equality, and post-merge checks.
- `VOC-092-EV-03`: exact remote/local cleanup manifest, per-target proof, deletion
  results, retained exceptions, and recovery commands.
- `VOC-092-EV-04`: final API/Git/GitHub audit and issue-closure record.

## Rollback and contingency

The setting rollback is the inverse one-field API request. Deleted refs are recreated
from recorded exact SHAs. Documentation and promotion rollback use normal reviewed
revert PRs. If any target is ambiguous, dirty, unique, or not recoverable, retain it
and record the exception; partial safe cleanup is preferable to data loss. EHR fires
only if safe recovery cannot be demonstrated for an action required to finish.
