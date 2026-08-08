# VOC-049 — Promote develop to main for the Direct Governance/Infra-Cleanup Batch: Specification

## Objective and requirement source

Promote the content already merged into `develop` — described by
[issue #375](https://github.com/KARSIFT/vocanova-platform-sandbox/issues/375) as
17 commits from direct governance/infra-cleanup PRs (docs reconciliation,
invalid-YAML and duplicate-change-ID fixes, stale package-status syncs, the
`auto_release_enabled` wiring itself, and a branch-ruleset verification
commit) — to `main`, through the repository's normal governed release
mechanism (`release.yml`'s `check-and-open`/`auto-promote` jobs), rather than
leaving it permanently unreachable because none of it originated from an
adopted change package with a `.karsift/tasks.json` task roster.

The issue is explicit that no new code changes are being requested here —
everything named is already reviewed and merged into `develop`. The ask is
purely to get that already-merged content promoted through a governed path,
since `release.yml` as currently wired only fires on a tracked task issue
closing, and none of these commits have one.

## Scope and non-goals

**In scope:**
- Re-verifying, at implementation time, the exact current commit gap between
  `main` and `develop` (see the drafting-time finding below — this may no
  longer be 17 commits).
- Producing a governed promotion of that verified content from `develop` to
  `main`, using whatever mechanism the reviewing human and implementer
  determine best fits a promotion-only package with no task roster of its own
  driving it organically (see `implementation-plan.md`'s open question on
  mechanism).
- Recording the promotion's evidence (compare URL/diff, checks, exact SHAs)
  for audit purposes.

**Non-goals / explicitly excluded:**
- Writing any new application code, workflow code, or governance-document
  content. This package promotes existing, already-merged `develop` content
  unchanged; it does not re-implement, re-word, or "clean up" any of it further.
- Re-reviewing the substance of any individual commit in the batch (e.g. the
  YAML/duplicate-ID fixes, the package-status syncs, or the
  `auto_release_enabled` wiring itself). Those already went through their own
  review path when they merged into `develop`; this package's own review scope
  is the promotion action, not a re-litigation of already-merged content.
- Any change to `release.yml`, `pipeline.yml`, or any other workflow's future
  behavior. The issue's closing note — that `auto_release_enabled` should be
  live for future packages "going forward" once this promotion completes — is
  a statement of expected future state given work already merged into
  `develop`, not a request for this package to touch that wiring; it is
  already in the batch being promoted, not the promotion mechanism itself.

## Drafting-time finding: the "17 commits" figure could not be reproduced

At drafting time (2026-08-08), comparing `origin/main` against `origin/develop`
directly found `develop` only **1** commit ahead of `main`
(`0914ea7`, "Merge pull request #374 from KARSIFT/test/ruleset-verification"),
not 17. The most likely explanation is that most of the batch the issue
describes already reached `main` by some path in the time between the issue
being filed and this package being drafted — plausibly through the very
`release.yml` auto-promote path this batch itself enables, or through a
separate manual promotion the issue thread doesn't yet reflect.

This package does not treat the issue's original count as ground truth for
implementation. `VOC-049-T00` requires the implementer to re-run
`git compare`/`git log main..develop` (or the GitHub compare view) at
implementation time and treat whatever the actual remaining gap is —
including the possibility that it is now zero — as authoritative. If the gap
is already zero, `VOC-049-T01` closes as not-needed with T00's finding
recorded as its evidence, rather than manufacturing a promotion of nothing.

## Risk and protected areas

The promotion action itself introduces no new code. However, the content
being promoted includes the `auto_release_enabled` wiring commit — a
governance/release-authority change that `AGENTS.md` documents as a named,
dated, explicit founder delegation (the "Release and deployment authority"
section, added 2026-08-08). That commit already merged into `develop` under
its own review; this package does not reopen that review, but flags for the
adopting human that a promotion package carrying it to `main` is not purely
mechanical busywork — it is the step that makes that delegation live in
production.

Builder-proposed risk: **R2** for the promotion action itself, per
`change.yaml`. This is a draft proposal for the reviewing human at adoption
time, not a determination; the project's own path-based risk floor (if run
against the actual final task-scoped file list) and human judgment govern.
Given the governance-authority content riding along, the reviewing human may
reasonably classify this higher (e.g. R3) purely because of what promotion
activates, even though no new diff is authored by this package.

No protected application code path (e.g. `apps/api/business/auth`,
migrations, payment/billing logic) is touched by this package's own tasks.

## Decisions, contradictions, security, and privacy

No `VOC-049-D00`-style product decision is being made here; this package
proposes no new behavior of its own. `VOC-049-T00`'s re-verification finding
governs whether `VOC-049-T01` does anything at all, per the drafting-time
finding above.

**Contradiction flagged for the reviewing human, not silently resolved:** the
issue's stated "17 commits ahead" premise conflicts with this drafting pass's
direct 1-commit finding. Both facts are recorded here rather than one being
quietly dropped in favor of the other; `VOC-049-T00` resolves which is
current at implementation time.

No secrets, credentials, or personal data are read, written, or exposed by
this package's own tasks — promoting already-reviewed `develop` content to
`main` does not itself touch any secret material, and this package authors no
new code that would.

## Data, migrations, analytics, and accessibility

**None applicable.** This package promotes already-merged governance/infra
content; per the issue, no migration, schema, analytics event, or UI/
accessibility-surface change is part of the batch being promoted, and this
package's own tasks author no new such change.

## Open questions for the reviewing human

1. **Mechanism**: how should a promotion-only package — with no
   `.karsift/tasks.json` task roster of its own driving `release.yml`'s
   normal per-package trigger — actually get its content into `main`? Options
   the reviewing human should choose between (not settled by this draft):
   (a) merge this package itself (once adopted) as the triggering PR into
   `develop` first (a no-op merge, since the content is already there). Then
   note in the package that `release.yml`'s `check-and-open`/`auto-promote`
   jobs fire once this package's own task issue(s) close, giving the batch a
   real, governed trigger it never had; or (b) a manual, explicitly
   authorized promotion PR from `develop` to `main`, with this package's
   evidence attached, bypassing `release.yml`'s trigger entirely for this one
   case since the content was never task-roster-driven to begin with. Either
   choice needs the reviewing human's explicit sign-off before
   `implementation-plan.md`'s sequence is finalized; this package does not
   presume one.
2. Does the `auto_release_enabled` wiring commit riding along in this batch
   need separate, elevated (e.g. founder) review specifically because this
   package's own promotion action is what makes it take effect in
   production, even though this package does not reopen review of that
   commit's content?
3. Given the "17 commits" figure could not be reproduced at drafting time
   (see above), should this package proceed at all if `VOC-049-T00` finds the
   gap is already zero, or should it simply close with that finding recorded
   and no promotion PR opened?
