# VOC-034 — Impact Analysis

## Security and privacy

This package's entire purpose is a safety-control wiring fix: it makes the
already-designed, already-partially-implemented moderation seam actually reach a
real provider. No new secret or credential is introduced — `OpenCodeModerationProvider`
reuses the same `AI_PROVIDER_API_KEY` bearer token already read for feedback
generation (`VOC-034-D02`), never logged (mirroring `OpenCodeFeedbackProvider`'s
existing `Authorization: Bearer <key>` header handling, which never appears in a log
line at `base_sha`). No new network egress destination — the moderation provider
calls the exact same `opencode serve` host (`AI_PROVIDER_BASE_URL`) the feedback
provider already calls, just a second HTTP round trip to the same host per request.

Per DOC-09 §21, moderation requests may include only the learner sentence, target
word, and learner level (the existing `ModerationInput` shape, unchanged) — this
package's new `OpenCodeModerationProvider` sends exactly that structured payload and
nothing else (no name, email, session ID, IP, or account history), matching the
existing `ModerationInput`/`ProviderTask` boundary the feedback path already
enforces. No normal log line gains learner sentence text — `OpenCodeModerationProvider`
follows the same DOC-09 §21 discipline `OpenCodeFeedbackProvider` already has (no
`log`/`fmt.Print*` of the request or response body anywhere in either provider at
`base_sha`, confirmed by reading `opencode.go` in full).

The moderation contract is the actual security-relevant surface this package adds
(`VOC-034-D04`): a strict output schema, an explicit deny-list of what the model may
return, and a hard rule that any unrecognized or self-reported
`moderation_unavailable` value is treated as an error rather than trusted. This
closes the fail-open risk a naive implementation could introduce (e.g., defaulting
an unparsed outcome to `allowed`) — the design instead defaults every ambiguous case
to fail-closed, consistent with `CompositeSafetyClassifier`'s existing behavior for
a genuinely absent provider.

## Data and migrations

No schema change, no migration, no new table or column. This package changes only
Go application code (`apps/api/business/aifeedback/`, `apps/api/app/api/`) and a
comment in `apps/api/.env.example`. The behavior change is downstream of a
successful moderation call: an ordinary sentence that previously never reached
persistence (fail-closed before any `learner_sentences`/`ai_feedback_attempts` row
was created, per the issue's own reproduction) will now, once merged and deployed,
successfully persist through `service.go`'s existing, unchanged transaction path
(`repo.SaveFeedback`/equivalent, per `service.go`'s "Success order" — the pipeline
this package does not touch). This is a restoration of already-designed, already-
tested persistence behavior, not a new persistence path.

## Analytics and accessibility

None. No analytics event is added, changed, or removed — `service.go`'s existing
`recordTelemetry` calls (unchanged) already cover `safety_blocked` /
`safety_self_harm` / `safety_moderation_unavailable` outcomes; this package makes
the "allowed, proceed to feedback" path reachable in production for the first time,
which was already an existing, already-tested telemetry branch (proceeding past the
`switch moderation.Outcome` in `service.go:217-219`), not a new one. No accessibility
surface exists in this package's scope — `apps/api/business/aifeedback` and
`apps/api/app/api` are server-side only, no UI or user-facing markup — evidence-
backed non-applicability, not omission, confirmed by direct inspection of the
changed-file list.

## Risks, dependencies, and evidence

- `VOC-034-R00`: **Medium, flagged for follow-up, not resolved here.** Moderation
  now runs as a real, sequential network call strictly before the feedback
  provider's own real network call (`service.go:205` then the later provider
  call, both unchanged code). Combined worst-case latency (moderation ≤ 8s single
  attempt with `MaxRetries: 0`, feedback ≤ 8s + one retry ≤ 16s) can exceed DOC-09
  §18's 10s total backend target under real, previously-unexercised production
  conditions (moderation always failed closed instantly before this package, so
  this combined-latency case has never run against the real staging host).
  Mitigated partially by `VOC-034-D03`'s `MaxRetries: 0` for moderation; full
  reconciliation against the 10s target is explicitly deferred to VOC-032-T10's
  live threshold evaluation, a distinct task per issue #216's own "Relationship"
  section — not silently accepted as fine, flagged as an open question for that
  task and for founder review at this package's adoption.
- `VOC-034-R01`: **Low, informational, not a defect this package introduces.**
  Feedback and moderation share one provider account/model
  (`AI_PROVIDER_API_KEY`/`AI_PROVIDER_MODEL`); an outage or rate-limit on that
  account affects both surfaces simultaneously, with no independent failure
  isolation. This matches DOC-09 §17's own "no automatic multi-provider fallback"
  principle and the issue's own successful evidence using one provisioned model
  for both; not a regression, but recorded so a future capacity/reliability
  review has the tradeoff on record.
- `VOC-034-R02`: **Low.** The new "unrecognized outcome" strictness
  (`VOC-034-D04`) could over-trigger `moderation_unavailable` if the model
  occasionally phrases the outcome field with different casing or surrounding
  whitespace. Mitigated by normalizing (trim + lowercase) before matching, and
  covered by `VOC-034-T00`'s outcome-mapping tests.
- `VOC-034-R03`: **Low.** `VOC-034-D01`'s shared-transport extraction touches
  previously-shipped, tested `opencode.go`/feedback-path code. Mitigated by the
  explicit, task-level requirement that `opencode_test.go` pass **unchanged**
  (`VOC-034-AC-00`) as the regression proof the extraction preserved behavior.
- `VOC-034-DEP-00`, `VOC-034-DEP-01`: see `change.yaml`.
- `VOC-034-EV-00`: `go test ./apps/api/business/aifeedback/...` output showing
  `VOC-034-T00`'s new tests (outcome mappings, fail-closed paths, injection
  resistance) passing, plus the existing `opencode_test.go` suite passing
  unchanged.
- `VOC-034-EV-01`: `go test ./apps/api/app/api/... -run TestBuildAIProviders`
  output plus the `.env.example` diff showing comment-only changes.
- `VOC-034-EV-02`: `go test ./apps/api/business/aifeedback/... -run
  TestCompositeSafetyClassifier` output (existing + new local-interception-first
  test) confirming no regression to already-correct classifier behavior.
- `VOC-034-EV-03`: the `VOC-034-T02` route-level regression test's output,
  showing both the moderation and feedback fake-server call counters ≥ 1 and a
  non-`SAFETY_MODERATION_UNAVAILABLE` response.
- `VOC-034-EV-04`: `git diff --name-only <base_sha>...<candidate_sha>` confirming
  the diff matches `VOC-034-AC-09`'s declared file list exactly.
- `VOC-034-EV-05`: `VOC-034-T03`'s live-staging-verification record in
  `staging-evidence.md`.
- `VOC-034-EV-06`: exact-SHA independent Claude Code verification per PR, per
  `CLAUDE.md`.
