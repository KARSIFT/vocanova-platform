# VOC-096 — Specification

## Objective and baseline

Repair issue #164 through a bounded amendment/reconciliation of VOC-094's operative
Phase-3/4 contract while preserving its immutable adoption/review history and without
recreating or changing staging resources. At drafting, `origin/develop` is
`0d5ccc1231edb0e652d5c883cb214b85bcc9635e`. The current policy requires
`manifest.status == authorized`, staging `state == authorized`, runtime
`action_authority_url == authority_evidence_url`, and a future committed
`authorization_expires_at`. VOC-094 simultaneously requires PR1 to remain ineligible,
ACT-03 to follow PR1, PR2 to be documentation-only, and the exact merged PR2 SHA to be
the only dispatch revision. Those conditions have no fixed point.

## Decisions and requirements

- `VOC-096-D00` — This package is a narrow correction applied in conjunction with
  adopted VOC-094/VOC-095. PR1 must reconcile all nine VOC-094 package surfaces so
  their operative Phase-3/4 requirements, acceptance criteria, implementation/test/
  release plans, task mapping, and package metadata no longer contradict VOC-096.
  Preserve the original adoption, amendment, review, approval, evidence, and completed
  Phase-1 history verbatim as immutable history; label the bounded VOC-096 amendment
  and replace only the still-unstarted contradictory Phase-3/4 contract. Do not reopen
  completed Cloudflare provisioning or authorize any external action.
- `VOC-096-D01` — Preserve exactly two implementation PRs and one task. PR1 changes
  exactly the 27 declared repository files, including all nine VOC-094 package files,
  both Wrangler configs, and both tracked generated `worker-configuration.d.ts` files.
  PR2 changes exactly the five declared settings-document files. Any newly discovered
  required path is drift: stop and amend
  the reviewed package rather than silently broadening either PR.
- `VOC-096-D02` — PR1 binds the reviewed account, zone, D1, routes, Worker names,
  successful baseline UUIDs, Phase-1 evidence, Free-plan facts, exact incremental
  cost ceiling `0`, and unchanged production sentinels/holds. The manifest and staging
  environment use `prepared`, never a committed standing `authorized` state. A
  missing runtime binder keeps dispatch ineligible. The exact immutable values are the
  complete `prepared_staging_tuple` in `change.yaml`; implementation may not reselect a
  resource, domain/certificate/DNS record, baseline, probe, migration, or evidence
  source from generic issue history.
- `VOC-096-D03` — PR1 replaces static future-value equality with a stronger runtime
  binder contract, not a weaker URL/expiry gate. The manifest commits the canonical
  registry (`KARSIFT/vocanova-platform` issue #158), strict record schemas, required
  fields, permitted evidence URL form, maximum authorization lifetime of 30 minutes,
  exact resource/baseline/cost/hold invariants, and live/offline evaluation modes. It
  contains no ACT-03, PR2-review, or ACT-04 future evidence URL, expiry, nonce, or
  post-state claim. It commits the exact GitHub publisher trust root in `change.yaml`:
  repository owner `KARSIFT` numeric ID `304005580`, public repository
  `vocanova-platform`, issue `158`, and permitted publisher login `m-e-h-r-d-a-a-d`,
  numeric ID `7955432`, type `User`, `site_admin=false`, association `CONTRIBUTOR` as
  returned by the required unauthenticated comment endpoint. Authenticated `gh api`
  may report `MEMBER`; that credential-dependent value is not accepted by the live gate.
  Equality to that API publisher authenticates only the relaying GitHub account; it
  does not prove governance actor identity, independence, or action authority.
  `runtime_record_contract` is the exhaustive contract: a versioned closed API-envelope
  projection (including exact API `issue_url`), shared definitions, five closed body schemas, RFC-8785 raw-body rules,
  schema/tuple digests whose digest field is excluded from its own hash, and exact
  cross-record comparisons. PR1 binds those committed schema/version digests in the
  manifest; the three later bodies bind that manifest hash. Thus eight values are
  unambiguous: one prepared-tuple digest plus seven contract digests (shared definitions,
  envelope, five bodies). Both ECMAScript and Python RFC-8785 implementations must
  independently reproduce all sixteen results, and every integer is within
  `1..9007199254740991` where positive. An implementation may add no field, definition, or
  alternative serialization.
- `VOC-096-D04` — ACT-03 remains after PR1 and under VOC-085-HOLD-00. PR2 remains a
  documentation-only truth reconciliation of exactly the five declared files. It may
  record sanitized ACT-03 evidence and the two secret names, never values, but it may
  not change the manifest, workflow, policy, tests, Wrangler configuration, package,
  application code, or any input consumed from documentation by the delivery gate.
  ACT-03 references, but cannot self-assert, a separately created strict
  `vocanova-voc085-act03-settings-authority-v1` JSON record. The live gate fetches and
  semantically validates its accountable authority actor/provenance, exact authorized
  settings operator, PR1 revision, environment pre-state, exact two-secret-name/no-
  value payload, Phase-4 token account/permissions/expiry metadata, rollback, nonce,
  one-use limit, `$0`/production holds, and expiry. That authority actor precedes
  ACT-03, the ACT-03 operator deep-equals its authorized operator, and both precede
  PR2 merge, which must remain strictly before the settings-authority expiry.
- `VOC-096-D05` — After PR2 normally merges, a different-actor exact reviewer of the
  merged `develop` SHA relays a dedicated strict
  `vocanova-voc096-pr2-merged-sha-review-v1` JSON comment on issue #158. The record has
  distinct reviewer actor/nested provenance/non-authorship, `PASS`, zero blockers,
  exact PR2 number/head/merge SHA/base/ref/five-file set, ACT-03 URL/digest, and hosted
  checks. Its canonical URL, raw-body SHA-256, server timestamps, publisher, and
  association are derived only from the fetched API envelope after one immutable post;
  none is a body field. It is unedited/unminimized and created strictly after PR2's
  GitHub `merged_at`. Only after that record exists may the unchanged ACT-04 accountable
  actor relay one strict JSON authority body. It binds the ACT-03 and
  exact-PR2-review URLs/digests plus the exact PR2 number, head SHA, merge SHA,
  base/ref, merged time, manifest/workflow/policy digests, the complete
  `prepared_staging_tuple`, current smoke, Free plans, incremental cost `0`, unchanged
  Basic Load Balancing, production holds, a cryptographically random 128-bit-or-stronger
  nonce, `maximum_dispatches: 1`, and `expires_at`, but contains no `issued_at`, own
  URL/digest, or API metadata. After creation, the immutable fetched API `created_at`
  is the sole issuance time and must satisfy
  `created_at < actual expires_at <= min(created_at + 30 minutes, effective token
  expiry)` without an edit. The prepared
  publisher script sets `expires_at` to a fresh unauthenticated GitHub API `Date` plus
  exactly 25 minutes, posts once, and requires comment `created_at` within 60 seconds
  after that preflight Date. It never predicts or copies `created_at` into the body.
  No stronger unused-window token buffer is required.
- `VOC-096-D06` — A different non-author binder reviewer, with no authorship of the
  reviewed exact revision or authority record, re-fetches PR2 and ACT-03/ACT-04
  evidence and posts a second dedicated strict JSON comment on #158. It binds `PASS`,
  the exact fetched authority-envelope URL and raw-body SHA-256, ACT-03 and exact-PR2-review URLs/
  digests, exact PR2 merge SHA, manifest/workflow/policy digests, the complete prepared
  tuple, distinct reviewer actor/exact nested provenance/non-authorship, and zero blockers. The
  review record is created strictly after the authority record and before dispatch.
  Trusted publisher equality, pairwise-distinct actor IDs/session references, and the
  reviewer's attestation are evidence inputs; the gate and docs must never claim the
  shared GitHub publishing account alone proves separately instantiated actors.
- `VOC-096-D07` — Dispatch inputs include the exact ACT-03, exact-PR2-review,
  authority, and binder-review comment URLs and each raw-body SHA-256 digest, plus the
  nonce, exact reviewed SHA, exact baseline UUIDs, cost `0`, and existing confirmation.
  The gate permits only canonical
  `github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-<id>` URLs and requires
  each live API `html_url` to equal its input. One generic issue/PR URL is never valid.
- `VOC-096-D08` — In live mode the credential-free gate uses only public read-only
  unauthenticated GitHub REST requests and sends no `GITHUB_TOKEN` or authorization
  header. It re-fetches the separate settings authority, ACT-03, exact-PR2-review,
  authority, and binder-review comments;
  requires exact repository/issue association, duplicate-key rejection, exact
  RFC-8785 body bytes and closed body schema, a separately closed API-envelope
  projection, exact committed publisher equality, distinct governance actor/provenance
  metadata, `created_at == updated_at`, envelope-calculated raw-body digest, and the ordered GitHub server
  timestamps settings authority < ACT-03 < PR2 merge < exact-PR2 review < authority < binder review <
  current-run creation. It fails closed on redirect, timeout, rate limit, pagination gap,
  malformed response, edit, deletion, minimization, actor/role collision, or mismatch.
  Each of the two checks has at most 21 HTTP requests/at most 20 core requests and uses
  `per_page=100`: one zero-core `/rate_limit` preflight, five comment GETs, one PR GET,
  one PR-files page, one exact PR2-merge check-runs page, one exact event-filtered push
  workflow-runs page, one current-run GET, and at most ten prior-run pages. Require core
  remaining at least 40 before the first pass and 20 before the second; never retry a
  request inside a pass. The check-runs GET is
  exactly `/repos/KARSIFT/vocanova-platform/commits/{PR2-merge-SHA}/check-runs?filter=all&per_page=100&page=1`.
  Require `total_count == check_runs.length <= 100` and no next page. Ignore unrelated
  names; for exact required names `ci required`, `security required`, and `structure`
  under GitHub Actions app ID/slug `15368`/`github-actions`, reject any pending candidate
  that cannot be proven post-review, reject any run crossing the review cutoff, ignore
  post-review/current-dispatch runs, and select the unique greatest non-null
  `completed_at` candidate wholly inside
  `PR2.merged_at <= started_at <= completed_at < PR2-review.created_at`. The selected record
  binds safe normalized run/suite IDs, merge head SHA, completed/success status,
  canonical details URL, and ordered started/completed times. Missing, extra body,
  stale, greatest-time-tied, or next-page results block.
  The separately bounded
  `/actions/runs?branch=develop&event=push&head_sha={PR2-merge-SHA}&per_page=100&page=1`
  response must contain exactly the three committed CI/Security/Governance workflow
  name/path/ID tuples. Each selected details-URL run ID/check-suite ID maps uniquely to
  the matching completed/success first-attempt push run on `develop` and the exact merge
  SHA. Missing, duplicate, extra, stale, paginated, wrong-event/path/ID, or spoofed
  workflow-dispatch evidence blocks.
- `VOC-096-D09` — The gate independently fetches PR2 metadata and every changed-file
  page. It requires merged state, `merge_commit_sha == event.sha == reviewed_sha`, base
  `develop`, required ref `refs/heads/develop`, the authority's exact PR2 number/head,
  merge time before the authority, and an exact changed-file set equal to the five
  PR2 files in `change.yaml`. This proves the binder targets PR2 rather than PR1.
- `VOC-096-D10` — Replay is fail-closed. The workflow run name contains the full
  authority digest and nonce; manual delivery concurrency remains environment-scoped
  with `cancel-in-progress: false`; a direct current-run GET must return this run ID,
  exact SHA/event/title and `run_attempt == 1`; and the gate paginates the exact
  workflow's `develop`/`workflow_dispatch`/head-SHA run list back through the authority
  creation time. It rejects any other queued, in-progress, completed, or cancelled run
  with the same URL, digest, or nonce. Missing current-run data, incomplete or looping
  pagination, or a filtered result set at/over GitHub's documented 1,000-result cap is
  blocking. A failed or cancelled attempt consumes the binder; retry needs a fresh
  ACT-04 authority/review record. Phase-4 token expiry is not an ACT-04 retry: while
  PR2 is open it requires a fresh exact VOC-085 authority plus a replacement ACT-03
  before merge, authorizing only replacement of `CLOUDFLARE_API_TOKEN`. After PR2
  merge, expiry makes the transition stale and requires a newly governed correction;
  silent token reissue and every other settings mutation are forbidden.
- `VOC-096-D11` — Re-run the same live binder verification as the final credential-free
  step immediately before the first secret-bearing migration step. Both the current
  run's GitHub server `created_at` and the actual time of each live check must be
  strictly before actual authority body `expires_at`, where `authority.created_at <
  actual expires_at <= min(authority.created_at + 30 minutes, effective
  ACT03.phase4_token.expires_at)`. The
  first secret-bearing step records its start before reading a secret and also occurs
  before the earlier deadline. The authority envelope `created_at` is
  the sole issue time and body-selected issuance is forbidden. Credential
  references remain step-scoped to the existing migration/upload/promotion/rollback
  steps. Neither gate receives Cloudflare secrets, and no fetched text is evaluated as
  shell, JavaScript, YAML, or workflow expression.
- `VOC-096-D12` — Provide a network-free evaluator entry point with checked-in
  sanitized fixtures and injected clock/HTTP/prior-run data. Production workflow use
  always selects live verification; an input cannot select fixture mode. Network
  failure blocks live delivery and does not fall back to fixtures.
- `VOC-096-D13` — Preserve all existing gates: exact SHA/ref/confirmation; immutable
  upload and exact promotion; rollback UUIDs; migration limit/order; resource/domain/
  D1 equality; full smoke; action URL and unexpired authority; secret placement; Free
  plans and exactly zero incremental VocaNova cost; unrelated Basic Load Balancing
  unchanged; and every production sentinel plus VOC-080-HOLD-01/HOLD-02. Production
  remains structurally held and cannot use the staging runtime binder.
- `VOC-096-D13A` — After editing either Wrangler config, regenerate both tracked
  `worker-configuration.d.ts` files with repository-locked Wrangler `4.125.0`. Run API
  `types:check`, web `cloudflare:typecheck`, every staging/production dry run, and the
  full workspace validation. The generated config hashes and real staging vars/bindings
  must match the exact configs; production types/sentinels remain held.
- `VOC-096-D14` — Require final PR1 exact-SHA PASS records from separate Cloudflare,
  security/settings, and independent R4 reviewers, successful applicable local and
  hosted checks, and a non-author merge. PR2 requires a different-actor exact review
  and non-author merge. A reviewer that edits becomes builder and triggers fresh review.
- `VOC-096-D15` — `automatic_merge_allowed: true` is examined package metadata only.
  It grants no merge or external-action authority.

## Security and data boundary

No token value, secret value, learner row, production data, or fetched free-form text
may enter repository files, logs, artifacts, comments, Ruflo state, or test fixtures.
Only secret names and sanitized hashes/identifiers are recorded. Public GitHub
readbacks are untrusted input and pass strict schema, size, host, content-type, and
field allowlists before comparison.

The settings-authority, ACT-03, merged-PR2 exact review, ACT-04 authority, and binder-review body schemas,
shared definitions, separate API-envelope projection, raw-body canonicalization, and
cross-record comparisons are exhaustively defined by `runtime_record_contract` in
`change.yaml`; implementation may add no unreviewed record type or field. A body may
reference an already-created earlier comment but never its own URL, digest, API
timestamp, publisher, or association. All five fetched envelopes must match the
committed GitHub login, numeric ID, type, site-admin flag, and association. Their
governance actor IDs and exact nested provenance records remain separately attributable
evidence reviewed under AGENTS.md, not identities derived from shared publisher fields.
