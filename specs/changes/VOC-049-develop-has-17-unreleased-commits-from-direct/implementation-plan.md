# VOC-049 — Implementation Plan

## Preconditions and protected areas

Do not begin until this package is adopted (`change.yaml`'s `status: adopted`
and `implementation_authorized: true`, set by a human, never by this
package's own drafting or by any agent). Once adopted:

- `VOC-049-T00` (re-verification) must complete and its finding must be
  reviewed before `VOC-049-T01` (promotion) begins, since `T01`'s scope —
  including whether it does anything at all — depends entirely on `T00`'s
  result, per `specification.md`'s "Drafting-time finding."
- No protected application code path is touched by either task. The only
  "protected area" concern is governance-authority content (the
  `auto_release_enabled` wiring) riding along in the promoted batch, not any
  new edit this package makes to it — this package does not edit that
  content at all, only promotes it.

## File reconciliation and implementation sequence

1. **`VOC-049-T00`**: re-run the `main`/`develop` compare
   (`git log origin/main..origin/develop` or the GitHub compare view) at
   implementation time. Record the exact commit list, SHAs, and comparison
   timestamp as evidence. Compare this against issue #375's originally named
   17 commits and this package's own drafting-time finding (1 commit, as of
   2026-08-08) to determine the actual current state — the gap may have
   grown, shrunk, or closed to zero since either of those points. If zero,
   stop here: record the finding, mark `VOC-049-T01` not-needed, and close
   the package with `T00`'s finding as `VOC-049-AC-03`'s evidence. Otherwise
   proceed to `T01` with the re-verified, current commit list (not the
   issue's original one, which may be stale).
2. **`VOC-049-T01`** (only if `T00` finds a non-zero gap): promote the
   re-verified commit set from `develop` to `main` using the mechanism the
   reviewing human selected at adoption time from
   `specification.md`'s open question 1 — either (a) merging this adopted
   package itself into `develop` first so its own task issue closing gives
   `release.yml`'s normal `check-and-open`/`auto-promote` jobs a real trigger
   they never had for this content, or (b) an explicitly authorized manual
   promotion PR from `develop` to `main` with this package's evidence
   attached. Whichever mechanism is used, the promotion must be a fast-
   forward or equivalent no-new-diff merge — this package introduces no new
   application, workflow, or governance-document content of its own; it only
   makes already-reviewed `develop` content reachable on `main`.
3. Confirm no unrelated commit that landed on `develop` after `T00`'s
   snapshot but before `T01`'s promotion sneaks into the promoted set
   unreviewed — if `develop` has moved further in that window, `T00` must be
   re-run against the new tip before promoting, not silently expanded to
   cover it.

## Validation and independent verification

- Deterministic: confirm `origin/main`'s tip after promotion matches the
  exact SHA `T00` recorded as `develop`'s tip at snapshot time (or a merge
  commit whose only parents are that SHA and `main`'s prior tip, if the
  chosen mechanism produces a merge commit rather than a fast-forward).
- Run `bash scripts/governance/validate-governance.sh` and
  `bash scripts/governance/classify-change-risk.sh` against the actual
  promoted diff (which should be empty relative to `develop`'s already-
  reviewed content) to confirm no unreviewed content is introduced by the
  promotion action itself.
- Exact-SHA independent verification: Claude Code (per `CLAUDE.md`) confirms
  the promoted `main` revision's SHA matches `T00`'s recorded snapshot,
  confirms no agent self-approved the promotion, and confirms which of
  `specification.md`'s open question 1's two mechanisms was actually used
  and that it was explicitly authorized rather than defaulted to.

## Deployment and rollback

- Authorization boundary: promoting to `main` triggers
  `deploy-production.yml` automatically (per `AGENTS.md`'s "Release and
  deployment authority," live as of 2026-08-08). This package does not
  request or authorize any deployment step beyond what that already-
  delegated automatic path performs on a `main` push; it does not add a
  manual deploy dispatch.
- Rollout sequence: single promotion action (fast-forward or merge), no
  phased rollout — the content is already running/tested on `develop`.
- Rollback trigger: any post-promotion production issue traceable to content
  in this batch (e.g. a governance-doc reconciliation that turns out to
  contradict a still-active rule, or a package-status sync that
  misrepresents a package's real state).
- Rollback mechanism: revert the promotion merge commit on `main`; no data
  migration is introduced by this batch, so no data-compatibility rollback
  work is required.
- Owner: unassigned; to be recorded at adoption time.
- Last-known-good reference: `main`'s tip immediately prior to this
  package's promotion commit (currently `0914ea7` at drafting time, subject
  to `T00`'s re-verification).
