# VOC-034 — Release Plan

## Release and deployment authorization

This package authorizes no deployment. `VOC-034-T00`–`T02` change only
`apps/api/business/aifeedback/*`, `apps/api/app/api/*`, and `apps/api/.env.example`
comment text; merging their PRs to `develop` does not itself build, push, or deploy
any container, and does not run any deploy workflow. A merge to `develop` is not
release, activation, or a production/staging deployment decision — that remains a
separate, distinctly-gated action, unchanged by this package (AGENTS.md's develop-
merge-vs-deploy distinction).

`VOC-034-T03` is different in kind: it is a **live verification step**, run after
`T00`–`T02` merge and the existing `deploy-staging` pipeline (already proven working
per VOC-032-T09's partial rehearsal evidence, and requiring no workflow change from
this package) redeploys the fixed image to the already-provisioned staging host.
`T03` does not itself authorize any further deployment beyond that already-existing,
already-authorized pipeline; it produces the live evidence issue #216 requires to
consider VOC-032-T09 unblocked.

## Preconditions, monitoring, and outcome

- Exact revision: each PR's own final SHA, recorded by Claude Code's exact-SHA
  independent review per `CLAUDE.md`.
- Checks: the deterministic commands in `implementation-plan.md`'s "Validation and
  independent verification" section, run per PR.
- Approvals: routine R3 (semantic proposal) under active A-003 — strengthened
  applicable controls and independent verification, not standing steward/founder
  approval solely for being R3 (`docs/governance/a003-transition-state.yaml`). No R4
  trigger in scope. EHR not presumed.
- Staged evidence: `VOC-034-T02`'s route-level regression test (`VOC-034-EV-03`)
  before merge; `VOC-034-T03`'s live staging exercise (`VOC-034-EV-05`) after merge
  and redeploy — this package's relationship to VOC-032-T09 is that it removes the
  code-level defect that made T09's own core-loop rehearsal return
  `SAFETY_MODERATION_UNAVAILABLE` for the sentence-feedback step; it is not itself a
  substitute for T09's own broader rehearsal scope (migration/rollback, etc.), only
  for the AI-feedback portion of it.
- Monitoring: none new. `service.go`'s existing telemetry (`recordTelemetry` calls
  for `safety_blocked`/`safety_self_harm`/`safety_moderation_unavailable`, unchanged)
  already covers the moderation-outcome distribution DOC-09 §20 requires; once this
  package deploys, the founder/operator should watch for a sustained
  `safety_moderation_unavailable` rate (would indicate a live provider/auth/timeout
  problem distinct from this package's own fix) using whatever operational log/metric
  access already exists — no new dashboard is added by this package.
- Outcome owner: the human who adopts this package and, separately, the operator who
  executes `VOC-034-T03`'s live verification — per this repository's normal PR-merge
  and staging-operations process; no distinct release decision beyond the routine
  merge gate each PR already goes through and the existing deploy-staging pipeline.

## Rollback

- Trigger: any of `T00`–`T02`'s PRs found to introduce a defect after merge (e.g. a
  moderation contract that under- or over-blocks content, or a latency regression
  materializing from `VOC-034-R00`); or, post-deploy, any of DOC-09 §25's rollback
  conditions (unsafe feedback reaching learners, suspected cross-user exposure,
  prompt injection revealing protected information, a spike in learner reports,
  schema failures exceeding threshold, unusable latency, or a serious provider
  outage).
- Mechanism: `git revert` of the specific merge commit, which restores the prior
  `nil`-classifier wiring (safe fail-closed behavior, not a broken state) — no
  `.down.sql.example` file is added or exercised by this package, and none is
  needed. Independently and faster than a code revert: the existing
  `AI_FEATURES_ENABLED` kill switch disables all AI generation immediately,
  matching DOC-09 §25's own rollback guidance; non-AI learning features remain
  available while it is off, per DOC-09 §19's explicit requirement.
- Owner: whoever discovers the regression, through this repository's normal PR
  process, or the founder/operator with kill-switch access for the faster,
  code-revert-independent option.
- Validation: re-run the deterministic commands in `implementation-plan.md` against
  the reverted state; confirm `production.go` returns to passing `nil` as the safety
  classifier and that the existing `TestServiceSafetyModerationUnavailable`-style
  behavior (pre-existing, unchanged by this package) is what a fresh sentence
  receives again.
- Last-known-good reference: `fd4cc636815d6a87f7696b998b5c9304b4b34467` (this
  package's `base_sha`).

## Independent verification, human approvals, and closure

Claude Code independent review, bound to the exact final SHA of each PR, is required
before merge per `CLAUDE.md`; whichever implementer model is bound cannot approve or
merge its own implementation. No R4 founder approval is required by this package's
own scope (no R4 path or consequence is touched) — this package's own semantic R3
proposal is for the adopting human to confirm, not an R4 escalation. No EHR trigger
applies. Repository merge of `T00`–`T02`'s PRs is not release, activation, or closure
of VOC-032-T09 or issue #216 by itself — closure of *this* package's own scope
requires, in addition to the three PRs merging: `VOC-034-TEST-00`..`09` passing at
the final merged SHA, `VOC-034-T03`'s live verification actually executed and
recorded in `staging-evidence.md` (`VOC-034-TEST-10`), and
`acceptance-criteria.md`'s `Result` fields updated from `pending` to their actual
outcome by whoever performs that closure bookkeeping (not asserted here, since no
task has been implemented as of this draft). Closure of VOC-032-T09 itself and of
issue #216 remains those items' own separate bookkeeping, informed by but not
identical to this package's closure.
