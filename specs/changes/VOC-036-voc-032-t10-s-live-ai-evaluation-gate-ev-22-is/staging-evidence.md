# VOC-036 — Staging Evidence

**Draft — not adopted, not implemented. No task in this package has run yet.
Nothing below is a completed evidence record; this file exists so
`VOC-036-T03`'s live-Cloudflare-evaluation result has a designated place to be
recorded honestly once it actually runs.**

## Status at draft time (2026-07-31)

- `VOC-036-T00`, `VOC-036-T01`, `VOC-036-T02`: not started. No code exists yet
  for `CloudflareFeedbackProvider`, `CloudflareModerationProvider`, the
  `buildAIProviders` `cloudflare` branch, the `AI_PROVIDER_ACCOUNT_ID`
  variable, or `cmd/eval-live`'s Cloudflare selection/pacing additions.
- `VOC-036-T03` (the T10-equivalent live Cloudflare evaluation, `EV-22`'s
  Cloudflare-provider analogue): **blocked by `VOC-036-DEP-00`** — no
  Cloudflare API token or account ID has been provisioned, and `T00`–`T02`
  have not merged. No live Cloudflare call has been made by this drafting pass
  or by any prior work in this repository. This package makes **no claim,
  implicit or explicit, about whether Cloudflare will pass DOC-09 §23's
  thresholds or meet DOC-09 §18's latency budget** — that is exactly the open
  question `VOC-036-T03` exists to answer honestly, once it can actually run.

## Note on this package's own requirement-source evidence (recorded honestly, per this drafting pass's own findings)

This package's requirement source cites the founder's own account that
`VOC-035`'s Gemini live evaluation also failed (a stale, new-key-blocked
default model plus an unpaced free-tier rate-limit burst on the 56-case golden
set). At this package's own `base_sha`
(`c69b270a164bf2cb386f1b7637a7c3ab96af5bd0`), `VOC-035`'s own
`staging-evidence.md` does not yet contain that recorded failure — it still
shows `VOC-035-T03` as "Not yet attempted" / "blocked by `VOC-035-DEP-00`".
This is recorded here, honestly, as a fact this drafting pass found and could
not independently resolve from the repository alone (see `specification.md`
"Objective and requirement source" for the full detail and the reasoning for
why this package proceeds on the founder's own account regardless). This is
not a claim about `VOC-036`'s own Cloudflare live evaluation — it is a
transparency note about this package's own requirement-source evidence chain,
recorded here rather than silently omitted.

## `EV-22`-equivalent — Live Cloudflare Workers AI evaluation pass

Not yet attempted. Per `VOC-036-AC-11`/`VOC-036-TEST-11`, once
`VOC-036-T00`–`T02` merge, the staging host redeploys, and the founder
provisions a Cloudflare API token and account ID, `VOC-036-T03`'s documented
procedure (`tasks.md`) will run the extended `cmd/eval-live` against the real
Cloudflare Workers AI API — with an explicit, non-zero `--request-interval`
chosen against the free tier's shared 10,000-neurons/day pool and the 56-case
golden set's own call count — and this section will be updated with the full
rendered `LiveEvaluationReport` — provider, model, dataset, spec, every
per-threshold value, the violation list (if any), wall-clock duration, per-call
latency summary statistics, provider-call count, estimated input/output char
counts, operator-supplied cost in USD (expected `$0.00` on the free tier,
recorded as a fact, not assumed), the pre-agreed cost ceiling, the
cost-ceiling-exceeded flag, start/finish timestamps, the pacing interval
actually used, and operator notes (e.g. rate-limit warnings observed, retries
attempted, any model-name discrepancy) — exactly as `VOC-032-T10`'s and
`VOC-035-T03`'s own sections document for their respective providers.

**This result will be recorded honestly whichever way it comes out.** A
failing or still-blocked result is valid evidence and will be recorded as such,
not omitted or silently retried until a pass appears — matching the founder's
own explicit instruction for this package and the discipline
`VOC-032`/`VOC-034`/`VOC-035` already established in this repository.

## Rollback triggers

Per this package's (currently unauthorized, draft) `implementation-plan.md`
§Deployment and rollback / `release-plan.md` §Rollback, initiate rollback on:

- A merged `T00`–`T02` PR found to introduce a defect after merge.
- A live evaluation result showing Cloudflare cannot meet DOC-09 §18's latency
  budget or DOC-09 §23's thresholds, even with request pacing applied (a
  finding to record, not a reason to silently loosen the budget or the test —
  and not itself a reason for a code rollback, since Cloudflare is opt-in and
  the default provider stays OpenCode).
- Any credential or secret value (API token or account ID) found in a
  committed file.
- Any of DOC-09 §25's rollback conditions, if an operator has set
  `AI_PROVIDER=cloudflare` in a real deployment.

## Rollback procedure

For a code-level defect: `git revert` of the specific merge commit, which
removes the Cloudflare branch/flag/pacing addition entirely. For an
operational issue in a deployment that has opted into `AI_PROVIDER=cloudflare`:
reset the environment variable to `opencode` (or unset it) and restart — no
code deploy required. Independent of either: the existing
`AI_FEATURES_ENABLED` kill switch disables all AI generation immediately
regardless of provider. Never automate a database rollback — this package
touches no schema or persisted state shape, so none is ever needed for this
package's own scope.
