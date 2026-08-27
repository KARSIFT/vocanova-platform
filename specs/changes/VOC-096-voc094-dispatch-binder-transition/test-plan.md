# VOC-096 — Test Plan

## VOC-096-TEST-00 — Package, PR, file, action, and role shape

Validate one nine-file plan PR, one task, exactly two implementation PRs, PR1's exact
16 files, PR2's exact five documentation files, zero new external actions, the three
unchanged VOC-094 actions, explicit `automatic_merge_allowed: true`, and separate
builder/reviewer/merge/action actors. Evidence: `VOC-096-EV-00`.

## VOC-096-TEST-01 — Prepared state and no-future-preclaim contract

Positive fixtures accept real staging resources/baselines in `prepared` state while
delivery is ineligible without runtime records. Negative fixtures reject committed
future ACT-03/04 URLs, expiry, nonce, standing `authorized` state, PR2 executable
changes, documentation consumed as gate input, staging sentinels, or changed production
sentinels. Evidence: `VOC-096-EV-01`.

## VOC-096-TEST-02 — Exact PR2 sequencing and file boundary

Mock the public PR/comments/files endpoints and clock. Accept only ACT-03 before a
merged five-file PR2, exact merged-SHA review, later authority, later binder review,
and later dispatch. Reject PR1 target, unmerged/wrong-base PR, head/merge/event mismatch,
missing/extra/duplicate file pages, sixth path, timestamp equality/reordering, absent
review, reviewer authorship, or nonzero blockers. Evidence: `VOC-096-EV-02`.

## VOC-096-TEST-03 — Strict authority and binder records

Positive fixture verifies exact canonical URLs/API `html_url`, raw-body SHA-256,
schema/key/type/length allowlists, actors, nonce, <=30-minute expiry, PR2/ACT-03 binders,
manifest/workflow/policy hashes, account/zone/resources/routes/baselines/probes,
seven migrations/zero application rows, current smoke, Free plans, cost `0`, unchanged
Basic Load Balancing, and production holds. Reject generic URL, redirect, wrong issue/
repo, edit/minimization, unknown key, malformed JSON, digest/actor/resource/hash/cost/
expiry drift, or secret-like content. Evidence: `VOC-096-EV-03`.

## VOC-096-TEST-04 — Replay and rerun defense

Mock paginated workflow runs. Accept the first `run_attempt == 1` only. Reject an
earlier queued, in-progress, completed, cancelled, or failed run with matching authority
URL/digest/nonce; same-run rerun; truncated/looping pagination; API failure; digest or
nonce absent from exact run name; current-run GET mismatch/absence; a filtered result
set at/over 1,000; and concurrent duplicate. Prove `cancel-in-progress: false` and
environment-scoped concurrency remain. Evidence: `VOC-096-EV-04`.

## VOC-096-TEST-05 — Live/offline isolation and hostile input

Offline tests use only injected sanitized fixtures and clock. Workflow tests prove no
input selects fixture mode and live API failure cannot fall back. Reject oversized,
wrong-content-type, non-JSON, duplicate-key, control-character, shell metacharacter,
expression marker, and unexpected-host responses without executing content. Prove both
gate checks are credential-free. Evidence: `VOC-096-EV-05`.

## VOC-096-TEST-06 — Existing gate parity, secret placement, and production negatives

Re-run every current negative for wrong event/ref/SHA/confirmation, authority URL,
expiry, rollback UUID, route/D1/Worker/baseline mismatch, migration ceiling/order,
cost overflow, unhealthy smoke, and staging/production mixing. Require exact cost `0`,
Free Workers/D1, unchanged unrelated subscription, step-scoped credentials only, and
unchanged production sentinels/HOLD-01/HOLD-02. Evidence: `VOC-096-EV-06`.

## VOC-096-TEST-07 — Exact validation, reviews, rollback, and post-merge proof

Run governance validation, risk classification, diff check, full workspace validation,
foundation/delivery tests, Wrangler validation/dry runs, and all path-applicable hosted
checks. Attach exact-SHA Cloudflare, security/settings, and independent R4 PR1 reviews;
exact PR2 review; non-author merge/source-head evidence; synthetic rollback; preserved
VOC-090/recovery refs; and no-external-action evidence for the package/PRs themselves.
Evidence: `VOC-096-EV-07`.
