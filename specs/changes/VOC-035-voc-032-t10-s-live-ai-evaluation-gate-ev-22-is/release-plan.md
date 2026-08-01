# VOC-035 — Release Plan

**Draft — not adopted. This package authorizes no release, deployment, or
activation of any kind.**

## Release and deployment authorization

This package authorizes no deployment. `VOC-035-T00`–`T02` change only
`apps/api/business/aifeedback/*` (new files), `apps/api/app/api/*`,
`apps/api/cmd/eval-live/*`, and `apps/api/.env.example`; merging their PRs to
`develop` does not itself build, push, or deploy any container, and does not
run any deploy workflow. A merge to `develop` is not release, activation, or a
production/staging deployment decision — that remains a separate, distinctly
gated action, unchanged by this package (AGENTS.md's develop-merge-vs-deploy
distinction).

`VOC-035-T03` is different in kind: it is a **live verification step**, run
after `T00`–`T02` merge and the existing `deploy-staging` pipeline (already
proven working per `VOC-032-T09`'s rehearsal evidence, and requiring no
workflow change from this package) redeploys the merged image. `T03` does not
itself authorize any further deployment beyond that already-existing,
already-authorized pipeline; it produces the founder's own decision-grade
evidence for whether Gemini is a viable alternative to OpenCode for
`VOC-032-T10`'s `EV-22` gate.

Even once `T00`–`T02` are implemented and merged, **setting
`AI_PROVIDER=gemini` in any real deployment's environment is itself a
separate operator decision** this package does not make or authorize — the
default stays `opencode` (`VOC-035-D05`), and Gemini only ever activates via
an explicit, deliberate operator env-var change.

## Preconditions, monitoring, and outcome

- Exact revision: each PR's own final SHA, recorded by Claude Code's exact-SHA
  independent review per `CLAUDE.md`, once this package is adopted.
- Checks: the deterministic commands in `implementation-plan.md`'s
  "Validation and independent verification" section, run per PR.
- Approvals: this package itself first requires adoption
  (`change.yaml`'s `approval_status: not-approved` today). Once adopted,
  routine R3 (semantic proposal, per `specification.md`) under active A-003 —
  strengthened applicable controls and independent verification, not
  standing steward/founder approval solely for being R3. No R4 trigger
  identified in scope; flagged for the adopting human's own independent
  confirmation, not assumed.
- Staged evidence: `VOC-035-T00`–`T02`'s unit-test evidence before merge;
  `VOC-035-T03`'s live Gemini evaluation (`VOC-035-EV-04`) after merge and
  redeploy and after the founder provisions a Gemini API key
  (`VOC-035-DEP-00`).
- Monitoring: none new by default (Gemini is opt-in; a deployment that never
  sets `AI_PROVIDER=gemini` has zero behavior change and nothing new to
  monitor). If and when an operator does set `AI_PROVIDER=gemini` in a real
  deployment, the same existing telemetry (`safety_blocked`/
  `safety_self_harm`/`safety_moderation_unavailable`, unchanged) applies
  regardless of provider — no new dashboard is added by this package;
  distinguishing "which provider actually served this request" in telemetry
  is flagged in `impact-analysis.md` as a separately-scoped future
  improvement, not built here.
- Outcome owner: the human who adopts this package and, separately, the
  operator who executes `VOC-035-T03`'s live evaluation and who separately
  decides whether/when to set `AI_PROVIDER=gemini` in any real deployment —
  per this repository's normal PR-merge and staging-operations process.

## Rollback

- Trigger: any of `T00`–`T02`'s PRs found to introduce a defect after merge
  (e.g. a Gemini response-parsing edge case that under- or over-blocks
  content); a live evaluation result showing Gemini cannot meet DOC-09 §18's
  latency budget (a finding, not itself requiring a code rollback since
  Gemini is opt-in and the default stays OpenCode); or, if an operator has
  set `AI_PROVIDER=gemini` in a real deployment, any of DOC-09 §25's rollback
  conditions (unsafe feedback reaching learners, suspected cross-user
  exposure, prompt injection revealing protected information, a spike in
  learner reports, schema failures exceeding threshold, unusable latency, or
  a serious provider outage) — the fastest rollback in that specific case is
  simply resetting `AI_PROVIDER` back to `opencode` (or unsetting it),
  requiring no code revert at all, since both providers coexist in the same
  binary.
- Mechanism: `git revert` of the specific merge commit for a code-level
  defect, which removes the Gemini branch/flag entirely; a plain environment
  variable change (`AI_PROVIDER=opencode` or unset) for an operational
  Gemini-specific issue in a deployment that had opted in, requiring no
  deploy at all if the variable is read at process start with the same
  restart-to-apply semantics `AI_PROVIDER`'s existing value already has.
  Independently and faster than either: the existing `AI_FEATURES_ENABLED`
  kill switch disables all AI generation immediately regardless of provider,
  matching DOC-09 §25's own rollback guidance.
- Owner: whoever discovers the regression, through this repository's normal
  PR process, or the founder/operator with kill-switch and environment-
  variable access for the faster, code-revert-independent options.
- Validation: re-run the deterministic commands in
  `implementation-plan.md` against the reverted state; confirm
  `production.go`'s `buildAIProviders` returns to its pre-`VOC-035` two-branch
  (OpenCode/mock) shape if the code itself is reverted, or that
  `AI_PROVIDER=opencode` resumes serving OpenCode-backed feedback if only the
  environment variable is changed back.
- Last-known-good reference: `56d47cf5fe1b425b3c87be43274506300468e304`
  (this package's `base_sha`).

## Independent verification, human approvals, and closure

Claude Code independent review, bound to the exact final SHA of each PR, is
required before merge per `CLAUDE.md`, once this package is adopted;
whichever implementer model is bound cannot approve or merge its own
implementation. This package's own adoption — a distinct, prior, and
currently-outstanding decision — is not itself an R4 escalation on the
evidence available at draft time, but is explicitly flagged in
`specification.md`'s "Risk and protected areas" as something this draft
cannot itself confirm; the adopting human should independently verify no R4
consequence is missed before treating this as settled. Repository merge of
`T00`–`T02`'s PRs is not release, activation, or closure of this package's
own scope by itself — closure requires, in addition to the three PRs
merging: `VOC-035-TEST-00`..`09` passing at the final merged SHA,
`VOC-035-T03`'s live evaluation actually executed and recorded in
`staging-evidence.md` (`VOC-035-TEST-10`), and `acceptance-criteria.md`'s
`Result` fields updated from `pending` to their actual outcome by whoever
performs that closure bookkeeping. Whether/how this package's own
`EV-22`-equivalent result should be reflected back into `VOC-032`'s own
`staging-evidence.md`/`EV-22` row is that package's own separate closure
bookkeeping, informed by but not performed by this package (this drafting
role's scope-discipline rule permits writing only inside this package's own
directory).
