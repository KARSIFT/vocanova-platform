# VOC-049 — Promote develop to main for the Direct Governance/Infra-Cleanup Batch

**Status: proposed, not adopted.** Nothing in this package is
implementation-authorized. It is a draft response to
[issue #375](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/375),
prepared for founder/steward review at adoption time.

## Why this exists

Issue #375 reports that `develop` was, at filing time, 17 commits ahead of
`main`, none of which reached `main` through `release.yml`'s normal
`check-and-open`/`auto-promote` flow, because none originated from an
adopted change package with a `.karsift/tasks.json` task roster — they were
direct governance/infra-cleanup PRs (docs reconciliation, invalid-YAML and
duplicate-change-ID fixes, stale package-status syncs, the
`auto_release_enabled` wiring itself, and a branch-ruleset verification
commit). Since `release.yml` only fires on a tracked task issue closing, that
content had no natural trigger to reach `main` on its own. The issue asks
for this batch to be promoted through the normal governed loop, and
separately notes that `auto_release_enabled` should be live for future
packages going forward once this promotion completes.

## What was found during drafting

Comparing `origin/main` against `origin/develop` directly at drafting time
(2026-08-08) found `develop` only **1** commit ahead of `main`
(`0914ea7`, "Merge pull request #374 from
KARSIFT/test/ruleset-verification"), not 17. Most of the batch the issue
describes appears to have already reached `main` by some path between the
issue being filed and this package being drafted.

This package does **not** treat the issue's original count as ground truth
for implementation — it builds re-verification directly into the task
sequence (`VOC-049-T00`) instead of promoting whatever the issue said at
filing time. `specification.md`'s "Drafting-time finding" section and
`tasks.md`'s `VOC-049-T00` scope that re-verification explicitly, including
the possibility that the real remaining gap is now zero, in which case this
package closes with that finding as evidence and promotes nothing.

## What this package deliberately does NOT do

- It does not author any new application code, workflow code, or governance-
  document content. Every commit in the batch is already reviewed and merged
  into `develop`; this package's tasks only make that content reachable on
  `main`, unchanged.
- It does not re-review the substance of any individual commit already
  merged into `develop` (the YAML/ID fixes, status syncs, or the
  `auto_release_enabled` wiring itself) — those already had their own review
  when they merged. It does flag, as an open question for the reviewing
  human, that promoting the `auto_release_enabled` commit specifically is
  what activates that delegation in production.
- It does not touch `release.yml`, `pipeline.yml`, or any other workflow's
  future behavior itself.
- It does not decide the promotion mechanism. `specification.md`'s open
  question 1 lays out two candidate approaches (merge this package into
  `develop` first to give `release.yml` a real trigger it never had, versus
  an explicitly authorized manual promotion PR) and leaves the choice to the
  reviewing human.
- It does not adopt itself. `change.yaml` leaves every adoption/authorization
  field at its template default. No task in `tasks.md` may be dispatched
  until a real adoption decision is recorded.

## Open questions flagged for the reviewing human

`specification.md`'s "Open questions" section flags: (1) which of the two
candidate promotion mechanisms should actually be used; (2) whether the
`auto_release_enabled` commit riding along in this batch needs separate,
elevated review specifically because this package's promotion action is
what makes it take effect in production; and (3) whether this package should
proceed at all if `VOC-049-T00` finds the gap is already zero.

## Structure

Mirrors recent packages' convention (e.g. VOC-048, VOC-047, VOC-046):
`specification.md`, `acceptance-criteria.md`, `impact-analysis.md`,
`implementation-plan.md`, `tasks.md`, `test-plan.md`, `release-plan.md`.

## Recommended next action for the reviewing human

1. Confirm or adjust the proposed `R2` risk classification in `change.yaml`,
   given the `auto_release_enabled` content riding along (the reviewing
   human may reasonably set this to `R3` for that reason alone).
2. Resolve `specification.md`'s open question 1 (promotion mechanism) before
   adoption, since `implementation-plan.md`'s sequence depends on it.
3. Decide whether the `auto_release_enabled` commit needs separate elevated
   review before `VOC-049-T01` is dispatched.
4. Adopt (or request changes to) this package, then dispatch `VOC-049-T00`
   (re-verification) first, and only dispatch `VOC-049-T01` (promotion) if
   `T00` finds a non-zero gap, consistent with this package's own scoping.
