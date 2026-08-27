# VOC-096 — Test Plan

## VOC-096-TEST-00 — Package, PR, file, action, and role shape

Validate one nine-file plan PR, one task, exactly two implementation PRs, PR1's exact
27 files including all nine VOC-094 package surfaces and both generated Worker type
files, PR2's exact five documentation files, zero new external actions, the three
unchanged VOC-094 actions, explicit `automatic_merge_allowed: true`, and separate
builder/reviewer/merge/action actors. Evidence: `VOC-096-EV-00`.

## VOC-096-TEST-01 — Prepared state and no-future-preclaim contract

Positive fixtures accept real staging resources/baselines in `prepared` state while
delivery is ineligible without runtime records. Negative fixtures reject committed
future ACT-03/PR2-review/ACT-04 URLs, expiry, nonce, standing `authorized` state, PR2 executable
changes, documentation consumed as gate input, staging sentinels, or changed production
sentinels. Inspect every VOC-094 package surface and reject a surviving contradictory
operative Phase-3/4 instruction while requiring immutable adoption/review/completed
Phase-1 evidence to remain. Evidence: `VOC-096-EV-01`.

Require every exact resource/domain/certificate/DNS/migration/evidence/hash value from
`prepared_staging_tuple`; reject generic issue selection, original-execution/final-
readback binder conflation, pre-migration zero-table state, or a probe used as baseline.

## VOC-096-TEST-02 — Exact PR2 sequencing and file boundary

Mock the public PR/comments/files/check-runs/push-workflow-runs endpoints and clock.
Accept only a strict
VOC-085 settings authority before matching ACT-03 and then before a
merged five-file PR2, a separately fetched strict merged-SHA review, later authority,
later binder review, and later dispatch. Require the PR2-review URL/digest/schema/API
publisher/time/actor provenance in the authority, binder review, and dispatch inputs.
Reject PR1 target, unmerged/wrong-base PR, head/merge/event mismatch, missing/extra/
duplicate file pages, sixth path, timestamp equality/reordering, absent/edited/
minimized/colliding review, reviewer authorship, or nonzero blockers. Evidence:
`VOC-096-EV-02`.

## VOC-096-TEST-03 — Strict settings, ACT-03, PR2-review, authority, and binder records

Positive fixture verifies the separate closed API-envelope projection, exact canonical
URLs/API `html_url`, envelope-calculated raw-body SHA-256, RFC-8785 byte equality, and
all seven committed contract digests/key/type/length allowlists; committed publisher login `m-e-h-r-d-a-a-d`/ID
`7955432`/type `User`/site-admin false/unauthenticated association `CONTRIBUTOR`, exact
API `issue_url`, distinct governance actor IDs/exact nested provenance, nonce, and all
five body schemas. Require settings authority < ACT-03 < PR2 merge < PR2 review <
authority < binder review < current-run creation; authority API `created_at` is the
sole issuance time, the body contains no `issued_at`, and
`created_at < actual expires_at <= min(created_at + 30 minutes, effective token
expiry)`; settings-authority
expiry is after PR2 merge and no later than token expiry. Both live checks and the
first secret-bearing step occur before the earlier ACT-04/token deadline. Verify the
settings authority's actor, authorized ACT-03 operator equality, PR1/environment/exact
secret-name/no-value payload, token scope/expiry, rollback, one-use nonce, cost and
production holds. Verify manifest/workflow/policy hashes and the full prepared tuple,
including distinct original/final-readback binders, sealed schema/migrations, exact
domain/certificate/DNS IDs, baseline-only rollback UUIDs, all three zero-traffic probes,
current smoke, Free plans, cost `0`, unchanged Basic Load Balancing, and production
holds. Reject generic URL, redirect, wrong issue/repo/publisher field, a claim that API
publisher equality proves actor separation, edit/minimization, unknown/duplicate key,
malformed JSON, digest/actor/resource/hash/cost/expiry drift, wrong domain/certificate/
DNS/binding ID, any probe as baseline, nonzero probe traffic, missing unrelated Worker,
time equality/reordering/skew, any own URL/digest/API timestamp/publisher field in a
body, body/envelope confusion, self-hash fixture, authenticated `MEMBER` substituted
for unauthenticated `CONTRIBUTOR`, or secret-like content. Evidence:
`VOC-096-EV-03`.

Constructibility fixtures use a fetched server `Date`, set body `expires_at` to
exactly 25 minutes later, post once within 60 seconds, and bind the returned envelope.
Reject a second post, any edit, copied/predicted `created_at`, a preflight/comment gap
over 60 seconds, and both exact expiry boundaries (`expires_at <= created_at` or
actual `expires_at > created_at + 30 minutes`). Independently reject actual
`expires_at > effective token expiry`; do not require the token to survive the unused
remainder of the maximum 30-minute window.

Use the actual ten-digit URL
`https://github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-5437982455`
(79 characters) as a positive canonical-URL fixture. Test comment IDs 1 and
9007199254740991 positively and reject 0, 9007199254740992, a URL/ID decimal mismatch,
wrong `issue_url`, and a noncanonical host/path.

Recompute the eight unambiguous binders in independent ECMAScript and Python RFC-8785
implementations: prepared tuple; shared definitions; API envelope; and five body
schemas. Require all sixteen results to equal. Reject a changed shared definition with unchanged
leaf-schema digests, any changed schema with unchanged manifest binding, inclusion of a
`schema_sha256` field in its own digest input, unresolved `$ref`, or any body-bound
manifest hash that differs from the exact manifest containing all seven contract digests.

## VOC-096-TEST-04 — Replay and rerun defense

Mock paginated workflow runs. Accept the first `run_attempt == 1` only. Reject an
earlier queued, in-progress, completed, cancelled, or failed run with matching authority
URL/digest/nonce; same-run rerun; truncated/looping pagination; API failure; digest or
nonce absent from exact run name; current-run GET mismatch/absence; a filtered result
set at/over 1,000; and concurrent duplicate. Prove `cancel-in-progress: false` and
environment-scoped concurrency remain. Evidence: `VOC-096-EV-04`.

Verify the exact two-pass unauthenticated budget: at most 21 HTTP/20 core requests per
pass, 42 HTTP/40 core total, `per_page=100`, no in-pass retry, zero-core `/rate_limit`
preflight, core remaining at least 40 before pass one and 20 before pass two. The
allocation is five comment GETs, PR, one PR-files page, one check-runs page, one
event-filtered push-workflow-runs page, current run, and up to ten prior-run pages.
Reject missing/inconsistent Date or rate-limit headers, absent/failing fifth authority
fetch, a second PR-files/check-runs/push-runs page, an
eleventh run page, or any budget underflow before secrets.

Check-runs positive fixtures use
`filter=all&per_page=100&page=1`, `total_count == array length <= 100`, unrelated job
names, and multiple completed historical candidates, then select the unique greatest
non-null `completed_at` candidate wholly inside the PR2-merge-to-review-envelope cutoff
for each of `ci required`, `security required`, and
`structure` under app ID/slug `15368`/`github-actions`. Bind normalized safe decimal
run/suite IDs, merge `head_sha`, completed/success, canonical details URL, and ordered
timestamps. Negatives cover missing or extra body required entries, pending required
candidates, stale head, wrong app, non-success, null/inverted timestamps, greatest-time
ties, unsafe IDs, total-count mismatch, length 101, and `Link: rel="next"`. Also reject
a pre-review pending candidate and a run crossing the cutoff; ignore a candidate that
starts after review and the exact current dispatch run even while it is queued.

Push-workflow-run positive fixtures use the exact public repository endpoint filtered
by `branch=develop`, `event=push`, and PR2 merge `head_sha`; require total/length 3, no
next page, and exact first-attempt CI/Security/Governance name/path/workflow-ID tuples.
Parse each selected check details URL and deep-bind its run ID and check-suite ID to the
matching completed/success push run, exact merge SHA/branch, ordered timestamps, and
canonical API/HTML URLs. Parse both workflow URL suffixes and the details run/job
suffixes as safe canonical decimals; require all three run values to equal normalized
`workflow_run.id`, job to equal `check_run_id`, and both suite IDs to match. Negatives
cover individually canonical but mismatched API-run URL, HTML-run URL, details-run URL,
details-job/check-run ID, and suite IDs, plus a later successful pre-review
`workflow_dispatch` check with the same name/app/head, missing/duplicate/extra runs,
pagination, stale head/branch, wrong event/path/workflow ID/check suite, run_attempt 2,
non-success, and timestamp drift.

## VOC-096-TEST-05 — Live/offline isolation and hostile input

Offline tests use only injected sanitized fixtures and clock. Workflow tests prove no
input selects fixture mode and live API failure cannot fall back. Reject oversized,
wrong-content-type, non-JSON, duplicate-key, control-character, shell metacharacter,
expression marker, non-canonical body bytes, leading/trailing whitespace, final
newline, and unexpected-host responses without executing content. Construct each body,
post once, and bind its fetched envelope without edit, prediction, or self-reference.
Prove both gate checks are credential-free. Exercise initial and expired-token
replacement-while-PR2-open chains: replacement needs a fresh authority/ACT-03 before
merge and may mutate only
`CLOUDFLARE_API_TOKEN`; reject silent reissue, reused token/nonce, absent previous
authority, any previous-record field/fetch or historical recursion, account-ID
replacement, PR2/record/run/check/server/completion/secret-step
at or after expiry, ACT-04 expiry later than token expiry, and any post-PR2-merge
replacement attempt instead of a newly governed correction. Evidence: `VOC-096-EV-05`.

## VOC-096-TEST-06 — Existing gate parity, secret placement, and production negatives

Re-run every current negative for wrong event/ref/SHA/confirmation, authority URL,
expiry, rollback UUID, route/D1/Worker/baseline mismatch, migration ceiling/order,
cost overflow, unhealthy smoke, and staging/production mixing. Require exact cost `0`,
Free Workers/D1, unchanged unrelated subscription, step-scoped credentials only, and
unchanged production sentinels/HOLD-01/HOLD-02. Evidence: `VOC-096-EV-06`.

Regenerate both `worker-configuration.d.ts` files with locked Wrangler `4.125.0`, then
require API `types:check`, web `cloudflare:typecheck`, generated config-hash equality,
and full staging/production dry-run and workspace validation. Reject either stale
generated file or any changed production type/sentinel.

## VOC-096-TEST-07 — Exact validation, reviews, rollback, and post-merge proof

Run governance validation, risk classification, diff check, full workspace validation,
foundation/delivery tests, Wrangler validation/dry runs, and all path-applicable hosted
checks. Attach exact-SHA Cloudflare, security/settings, and independent R4 PR1 reviews;
exact PR2 review; non-author merge/source-head evidence; synthetic rollback; preserved
VOC-090/recovery refs; and no-external-action evidence for the package/PRs themselves.
Evidence: `VOC-096-EV-07`.

Preserve all earlier exact FAILs, including the three `f73e7cb...` URLs
`5439392123`, `5439400690`, and `5439446542`, and verify no PASS or authority transfers
from any failed candidate to the corrected SHA. Preserve the `4b6eabd...` R4 FAIL
`5439930725`, superseded exact-SHA-only security PASS `5439937068`, and Cloudflare FAIL
`5439974737`; none transfers to the next candidate. Preserve the `47545f3...`
Cloudflare FAIL `5440287060`, security FAIL `5440329271`, and R4 FAIL `5440332195`;
none transfers review, approval, adoption, implementation, or action authority.
Adoption bookkeeping additionally binds exact approved candidate `dfe8f3d...`,
security/settings PASS `5440552113`, independent R4 PASS `5440587958`,
Cloudflare/Wrangler PASS `5440624053`, and adoption decision `5440710886`. Each PASS
remains approved-candidate evidence only; the changed bookkeeping SHA requires fresh
exact review, genuine eligibility, and normal non-author merge. Implementation
acceptance results remain pending, and ACT-03/04/05 remain separately held.
