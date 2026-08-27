# VOC-096 — Impact Analysis

## Security and settings

The implementation changes a security-critical authorization gate but adds no write
permission. Public GitHub responses are hostile input. Strict host/path/content-type/
size/schema/actor/time/digest checks, no dynamic evaluation, injected offline fixtures,
and fail-closed network handling constrain that risk. The post-binder reviewer prevents
an authority record's self-asserted body digest from becoming its own proof.

No GitHub environment or secret is changed by this package. ACT-03 remains separately
held. Cloudflare secret values stay outside repository, comments, logs, fixtures, and
credential-free jobs.

## Delivery and Cloudflare

The correction makes a future staging dispatch eligible only for one invocation after
all adopted evidence exists. It does not recreate resources or promote traffic. Real
resource IDs, baseline UUIDs, routes, Free-plan state, rollback, and exact zero cost are
equality-bound. Production sentinels and holds are unchanged.

## Risks and mitigations

- `VOC-096-R00`: runtime evidence could target PR1 rather than PR2. Mitigation: fetch
  PR2 metadata/files and require its merge commit to equal the event SHA.
- `VOC-096-R01`: an authority comment could be edited, stale, or self-attested.
  Mitigation: current raw-body hashing, `created_at == updated_at`, bounded expiry, and
  a later different-actor binder-review record bound to the authority digest.
- `VOC-096-R02`: a valid record could be replayed. Mitigation: 128-bit nonce, digest-
  bound run name, first-attempt-only, environment concurrency, and exhaustive prior-run
  readback through the authority window. Every attempt consumes the record.
- `VOC-096-R03`: public API failure or pagination could become fail-open. Mitigation:
  bounded requests with strict pagination and no fixture fallback in workflow live mode.
- `VOC-096-R04`: PR2 documentation could become executable input. Mitigation: gate
  reads no documentation content; it only verifies PR2's exact file-set boundary and
  separately verifies ACT-03 evidence.
- `VOC-096-R05`: fetched text could inject commands. Mitigation: JSON parse plus exact
  key/type/length allowlists and never pass response fields to shell/eval/workflow syntax.
- `VOC-096-R06`: correction could weaken existing gates. Mitigation: positive and
  negative parity matrix for every current SHA/ref/URL/expiry/resource/rollback/cost/
  secret/production check plus specialist exact-SHA review.
- `VOC-096-R07`: a short 30-minute binder could expire during operator handling.
  Mitigation: prepare and review every script/check/readback first, publish binder last,
  dispatch once promptly, and require a fresh record—not a fresh Cloudflare token by
  default—if the binder expires before any attempt.

## Privacy, accessibility, and analytics

No learner data, product analytics, UI, or accessibility behavior changes. Evidence is
sanitized operational metadata only.

## Rollback and contingency

Before any dispatch, revert PR1 through a reviewed PR and leave ACT-03 truth to an
immediate governed documentation correction; repository rollback never silently
removes secrets/settings. After a delivery attempt, preserve the run and Cloudflare
outcome evidence, use VOC-094's exact Worker rollback path when required, revoke the
Phase-4 token under ACT-05, and revert repository logic only through a reviewed PR.
Never force-push, edit historical evidence to look current, or weaken the old gate as
an emergency workaround.
