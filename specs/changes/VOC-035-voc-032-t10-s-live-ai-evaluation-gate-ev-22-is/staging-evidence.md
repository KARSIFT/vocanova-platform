# VOC-035 — Staging Evidence

**Draft — not adopted, not implemented. No task in this package has run yet.
Nothing below is a completed evidence record; this file exists so
`VOC-035-T03`'s live-Gemini-evaluation result has a designated place to be
recorded honestly once it actually runs.**

## Status at draft time (2026-07-31)

- `VOC-035-T00`, `VOC-035-T01`, `VOC-035-T02`: not started. No code exists
  yet for `GeminiFeedbackProvider`, `GeminiModerationProvider`, the
  `buildAIProviders` `gemini` branch, or `cmd/eval-live`'s provider-selection
  flag.
- `VOC-035-T03` (the T10-equivalent live Gemini evaluation, `EV-22`'s
  Gemini-provider analogue): **blocked by `VOC-035-DEP-00`** — no Gemini API
  key has been provisioned at `aistudio.google.com`, and `T00`–`T02` have not
  merged. No live Gemini call has been made by this drafting pass or by any
  prior work in this repository. This package makes **no claim, implicit or
  explicit, about whether Gemini will pass DOC-09 §23's thresholds or meet
  DOC-09 §18's latency budget** — that is exactly the open question
  `VOC-035-T03` exists to answer honestly, once it can actually run.

## `EV-22`-equivalent — Live Gemini AI evaluation pass

Not yet attempted. Per `VOC-035-AC-10`/`VOC-035-TEST-10`, once
`VOC-035-T00`–`T02` merge, the staging host redeploys, and the founder
provisions a free Gemini API key, `VOC-035-T03`'s documented procedure
(`tasks.md`) will run the extended `cmd/eval-live` against the real Gemini
API and this section will be updated with the full rendered
`LiveEvaluationReport` — provider, model, dataset, spec, every per-threshold
value, the violation list (if any), wall-clock duration, per-call latency
summary statistics, provider-call count, estimated input/output char counts,
operator-supplied cost in USD (expected `$0.00` on the free tier, recorded as
a fact, not assumed), the pre-agreed cost ceiling, the cost-ceiling-exceeded
flag, start/finish timestamps, and operator notes (e.g. rate-limit warnings
observed, retries attempted, any model-name discrepancy) — exactly as
`VOC-032-T10`'s own `EV-22` section documents for OpenCode.

**This result will be recorded honestly whichever way it comes out.** A
failing or still-blocked result is valid evidence and will be recorded as
such, not omitted or silently retried until a pass appears — matching the
founder's own explicit instruction for this package and the discipline
`VOC-032`/`VOC-034` already established in this repository.

## Rollback triggers

Per this package's (currently unauthorized, draft) `implementation-plan.md`
§Deployment and rollback / `release-plan.md` §Rollback, initiate rollback on:

- A merged `T00`–`T02` PR found to introduce a defect after merge.
- A live evaluation result showing Gemini cannot meet DOC-09 §18's latency
  budget or DOC-09 §23's thresholds (a finding to record, not a reason to
  silently loosen the budget or the test — and not itself a reason for a code
  rollback, since Gemini is opt-in and the default provider stays OpenCode).
- Any credential or secret value found in a committed file.
- Any of DOC-09 §25's rollback conditions, if an operator has set
  `AI_PROVIDER=gemini` in a real deployment.

## Rollback procedure

For a code-level defect: `git revert` of the specific merge commit, which
removes the Gemini branch/flag entirely. For an operational issue in a
deployment that has opted into `AI_PROVIDER=gemini`: reset the environment
variable to `opencode` (or unset it) and restart — no code deploy required.
Independent of either: the existing `AI_FEATURES_ENABLED` kill switch
disables all AI generation immediately regardless of provider. Never
automate a database rollback — this package touches no schema or persisted
state shape, so none is ever needed for this package's own scope.
