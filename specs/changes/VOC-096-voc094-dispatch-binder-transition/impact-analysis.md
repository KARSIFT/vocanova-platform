# VOC-096 — Impact Analysis

## Security and settings

The implementation changes a security-critical authorization gate but adds no write
permission. Public GitHub responses are hostile input. Strict host/path/content-type/
size/schema/actor/time/digest checks, no dynamic evaluation, injected offline fixtures,
and fail-closed network handling constrain that risk. The post-binder reviewer prevents
an authority body from becoming its own proof. Every comment URL, raw-body digest,
server timestamp, publisher field, and association is derived from the fetched API
envelope rather than asserted inside that same body.

The committed GitHub login/numeric-ID/type/site-admin/association allowlist is a trust
root only for the API publisher. Different governance actors may be relayed through the
same account; independence depends on distinct attributable actor/provenance records,
non-authorship evidence, and review, never an inference from GitHub identity alone.
The separately fetched merged-PR2 exact-review record prevents authority JSON from
self-asserting that the required post-merge review happened.

No GitHub environment or secret is changed by this package. ACT-03 remains separately
held. Cloudflare secret values stay outside repository, comments, logs, fixtures, and
credential-free jobs.

## Delivery and Cloudflare

The correction makes a future staging dispatch eligible only for one invocation after
all adopted evidence exists. It does not recreate resources or promote traffic. Real
resource IDs, baseline UUIDs, routes, Free-plan state, rollback, and exact zero cost are
equality-bound. Production sentinels and holds are unchanged.

Both generated Worker type contracts are in PR1 because Wrangler configuration hashes,
bindings, and staging variables change. Locked regeneration/checks prevent a config/
type mismatch while preserving production sentinels.

The bounded VOC-094 package reconciliation is required to avoid two simultaneously
adopted contradictory contracts. It preserves immutable adoption/review/completed
Phase-1 history and changes only the still-unstarted operative Phase-3/4 transition.

## Risks and mitigations

- `VOC-096-R00`: runtime evidence could target PR1 rather than PR2. Mitigation: fetch
  PR2 metadata/files and require its merge commit to equal the event SHA.
- `VOC-096-R01`: an authority comment could be edited, stale, or self-attested.
  Mitigation: current envelope-derived raw-body hashing, `created_at == updated_at`, no
  body self-URL/self-digest/server-time fields, bounded expiry, and a later
  different-actor binder-review record bound to the authority envelope digest.
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
- `VOC-096-R08`: VOC-096 could be implemented while the older VOC-094 files remain
  canonically contradictory. Mitigation: PR1 reconciles all nine package surfaces in
  the same exact-reviewed diff and deterministic tests reject any surviving old
  static-future-binder or PR2-executable instruction.
- `VOC-096-R09`: one hostile comment could self-assert publisher or actor identity.
  Mitigation: exact committed GitHub publisher equality for all four record types,
  strict separate actor/provenance fields, pairwise role-collision rejection, and an
  explicit prohibition on treating publisher authentication as actor independence.
- `VOC-096-R10`: an authority could self-assert that exact PR2 review occurred.
  Mitigation: require a distinct fetchable merged-PR2-review URL/digest/schema created
  after merge and bound by the later authority, binder review, and dispatch inputs.
- `VOC-096-R11`: body-selected issuance time could extend authority. Mitigation: the
  authority API envelope's immutable `created_at` is the only issuance time; the body
  has no `issued_at`; `created_at < expires_at <= created_at + 30m`; strict server-time
  ordering and both live checks before expiry remain mandatory.
- `VOC-096-R12`: generic issue history or stale generated types could select the wrong
  Cloudflare state. Mitigation: commit the full resource/domain/certificate/DNS/
  baseline/probe/evidence/hash tuple, include both generated type files, and reject
  probe-as-baseline, wrong identifiers, stale config hashes, or pre-migration state.

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
