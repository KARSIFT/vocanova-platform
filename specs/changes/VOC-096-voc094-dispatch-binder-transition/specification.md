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
  exactly the 25 declared repository files, including all nine VOC-094 package files.
  PR2 changes exactly the five declared
  settings-document files. Any newly discovered required path is drift: stop and amend
  the reviewed package rather than silently broadening either PR.
- `VOC-096-D02` — PR1 binds the reviewed account, zone, D1, routes, Worker names,
  successful baseline UUIDs, Phase-1 evidence, Free-plan facts, exact incremental
  cost ceiling `0`, and unchanged production sentinels/holds. The manifest and staging
  environment use `prepared`, never a committed standing `authorized` state. A
  missing runtime binder keeps dispatch ineligible.
- `VOC-096-D03` — PR1 replaces static future-value equality with a stronger runtime
  binder contract, not a weaker URL/expiry gate. The manifest commits the canonical
  registry (`KARSIFT/vocanova-platform` issue #158), strict record schemas, required
  fields, permitted evidence URL form, maximum authorization lifetime of 30 minutes,
  exact resource/baseline/cost/hold invariants, and live/offline evaluation modes. It
  contains no ACT-03 or ACT-04 future evidence URL, expiry, nonce, or post-state claim.
- `VOC-096-D04` — ACT-03 remains after PR1 and under VOC-085-HOLD-00. PR2 remains a
  documentation-only truth reconciliation of exactly the five declared files. It may
  record sanitized ACT-03 evidence and the two secret names, never values, but it may
  not change the manifest, workflow, policy, tests, Wrangler configuration, package,
  application code, or any input consumed from documentation by the delivery gate.
- `VOC-096-D05` — After PR2 normally merges, obtain a different-actor exact review of
  the merged `develop` SHA. Only then may the unchanged ACT-04 accountable actor relay
  one strict JSON authority record as a dedicated comment on issue #158. It binds the
  exact PR2 number, head SHA, merge SHA, base/ref, merged time, ACT-03 evidence URL and
  body digest, manifest/workflow/policy digests, staging account/zone/D1/routes/Workers,
  baseline and no-traffic probe UUIDs, schema/migration evidence, current smoke, Free
  plans, incremental cost `0`, unchanged Basic Load Balancing, production holds,
  issued/expiry times, a cryptographically random 128-bit-or-stronger nonce, and
  `maximum_dispatches: 1`. Expiry is no later than 30 minutes after issue.
- `VOC-096-D06` — A different non-author binder reviewer, with no authorship of the
  reviewed exact revision or authority record, re-fetches PR2 and ACT-03/ACT-04
  evidence and posts a second dedicated strict JSON comment on #158. It binds `PASS`,
  the exact authority URL and raw-body SHA-256, ACT-03 URL/digest, exact PR2 merge SHA,
  manifest/workflow/policy digests, reviewer actor ID, and zero blockers. The review
  record is created after the authority record and before dispatch.
- `VOC-096-D07` — Dispatch inputs include the exact authority and binder-review comment
  URLs, their raw-body SHA-256 digests, the nonce, exact reviewed SHA, exact baseline
  UUIDs, cost `0`, and existing confirmation. The gate permits only canonical
  `github.com/KARSIFT/vocanova-platform/issues/158#issuecomment-<id>` URLs and requires
  each live API `html_url` to equal its input. One generic issue/PR URL is never valid.
- `VOC-096-D08` — In live mode the credential-free gate uses only public read-only
  unauthenticated GitHub REST requests and sends no `GITHUB_TOKEN` or authorization
  header. It re-fetches the ACT-03, authority, and binder-review comments;
  requires exact repository/issue association, strict JSON with no unknown keys,
  expected actor/role metadata, `created_at == updated_at`, current raw-body digest,
  and the ordered timestamps ACT-03 < PR2 merge < exact review < authority < binder
  review < dispatch. It fails closed on redirect, timeout, rate limit, pagination gap,
  malformed response, edit, deletion, minimization, actor/role collision, or mismatch.
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
  ACT-04 authority/review record, not token reissue by default.
- `VOC-096-D11` — Re-run the same live binder verification as the final credential-free
  step immediately before the first secret-bearing migration step. Credential
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
