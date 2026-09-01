# VOC-115 — Release-attempt identity specification

## Objective and stopped evidence

Issue #216 and the exact PR #215 specialist review prove that a SHA-only immutable
head cannot retry while `develop` is unchanged. Both exact reviews of VOC-115's first
candidate `f7abcc894bab3f2bc0c1dba633b800f1c51825cd` additionally reject its client-
computed global sequence, underspecified editable-comment ledger, concurrent-active
race, crash ambiguity, numeric domain, overbroad ref rule, and missing validator.
That candidate remains immutable failed evidence; no verdict transfers.

## Server-assigned identity and bounded ref grammar

The replacement head is exactly:

```text
release/voc-106-<40-lowercase-hex-frozen-develop-sha>-attempt-<reservation-id>
```

The preparer posts a valid `reserve` event to issue #191. GitHub's successful REST
response assigns the issue-comment `id`; its losslessly decoded canonical decimal
string is `reservation-id`. It is a server-assigned unique identifier, not a client
counter. Retry requires a fresh distinct id, including when the SHA is unchanged; no
adjacent or greater ordinal is promised.

The external API assumptions are limited to GitHub's official
[issue-comment endpoint](https://docs.github.com/en/rest/issues/comments) returning a
unique comment identifier and its
[Git-reference endpoint](https://docs.github.com/en/rest/git/refs) creating a named
ref by POST. The policy assumes no id monotonicity. Any incompatible response/schema
change fails validation and requires governed correction rather than a fallback.

The id must match `[1-9][0-9]{0,18}` and be at most `9223372036854775807`. Parse and
compare only with `BigInt`; any JSON `Number` conversion is a validator error. Values
outside this deliberately bounded signed-64 policy domain or exhaustion stop for a
governed correction. The head uses safe lowercase ASCII, is at most 84 bytes, the full
`refs/heads/` name at most 95 bytes, and must pass `git check-ref-format --branch`.

## Exact v1 event representation

All lifecycle events live only as issue #191 comments. Ordinary comments without the
opening marker are ignored. A recognized event comment has exactly these UTF-8 bytes,
with LF and no surrounding prose or trailing whitespace:

```text
<!-- voc-106-release-attempt-v1
<one compact JSON object>
-->
```

The JSON object has its keys in Unicode code-point lexicographic order, no insignificant
whitespace, no duplicate keys, NFC strings, and only field-specific ASCII grammars
except the enumerated reason/detail fields. A repository-owned canonical serializer
must reproduce the raw body byte-for-byte. Every object includes exact common keys:

| Key | Contract |
| --- | --- |
| `actor` | attributable participant, `/root` or `/root/<lowercase-name>` |
| `authority_url` | exact HTTPS GitHub adoption/action/handoff evidence URL |
| `event` | one event enum below |
| `predecessor_event_id` | canonical decimal id string or `null` only where allowed |
| `reservation_id` | reserve envelope id as decimal string; `null` only in `reserve` |
| `schema` | exactly `voc-106-release-attempt-v1` |

The GitHub envelope is part of validation: raw `id`, `user.login`, issue URL exactly
for KARSIFT/vocanova-platform#191, `created_at`, `updated_at`, `minimized`, API URL,
HTML URL, raw body bytes, and SHA-256 of the lossless raw response. Require unique id,
`created_at == updated_at`, `minimized` false/null, successful response status, and
body actor/authority evidence consistent with the assigned role. The event id is the
envelope id, never a body-supplied replacement.

Comments are not called append-only: GitHub can edit/delete/minimize them. An edit,
minimization, malformed recognized marker, missing referenced event, raw-response/body
digest mismatch, duplicated id, conflicting transition, or deleted event known from a
later link/evidence invalidates that lineage. It never releases a reservation id or
branch name. An unreferenced deleted provisional comment cannot become valid evidence;
GitHub never reassigns its server id, and any evidence of deletion stops the action.

## Exact event field sets and transitions

The common keys above plus the exact event-specific keys below are the complete own-
key set. A field listed as an id is a canonical bounded decimal string. SHA/tree fields
are 40 lowercase hex. URLs are canonical `https://github.com/KARSIFT/vocanova-platform/...`
or `https://api.github.com/repos/KARSIFT/vocanova-platform/...`. Times are exact UTC
RFC3339 seconds (`YYYY-MM-DDTHH:MM:SSZ`). Unknown or omitted keys fail.

| Event | Additional required keys | Predecessor and effect |
| --- | --- | --- |
| `reserve` | `frozen_develop_sha`, `frozen_develop_tree`, `frozen_main_sha`, `frozen_main_tree`, `frontier_attempt_id` | `reservation_id` and `predecessor_event_id` are null. `frontier_attempt_id` is null at genesis or the last valid `abandon` reservation id. A prior `merged` terminal closes allocation. Provisional only. |
| `activate` | `frozen_develop_sha`, `head`, `owner`, `stable_scan_digest_1`, `stable_scan_digest_2` | predecessor is its reserve id; reservation id equals that envelope id. Starts the sole active attempt after arbitration. |
| `reservation-disposition` | `reason`, `winner_reservation_id` | predecessor is the subject reserve id. Reasons: `active-exists`, `concurrent-loser`, `stale-frozen-develop`, `invalid-reservation`, `owner-unavailable`. Winner id is required for concurrent/active loss and null otherwise. Terminal only for a provisional reservation. |
| `ref-created` | `create_response_digest`, `head`, `ref_api_url`, `ref_sha`, `ref_tree`, `response_status` | predecessor is current activate/handoff; status exactly `201`. Requires exact POST receipt and readback. |
| `pr-created` | `base`, `base_sha`, `draft`, `head`, `head_sha`, `pr_number`, `pr_url` | predecessor is ref-created/handoff; base `main`, draft true, one exact PR. |
| `binder-ready` | `base_sha`, `binder_sha256`, `head_sha`, `pr_number`, `pr_updated_at` | predecessor is pr-created or current handoff/binder-ready. Freezes exact body bytes; a body edit needs a new event and fresh evidence. |
| `handoff` | `from_actor`, `handoff_evidence_url`, `to_actor` | predecessor is current nonterminal event; authored by effective owner or a separately authorized recovery actor whose evidence names owner unavailability and this transfer. `from_actor` equals owner and one distinct `to_actor` becomes owner. |
| `invalidate` | `observed_state_sha256`, `reason` | predecessor is current nonterminal event. Reasons: `protected-ref-drift`, `attempt-ref-drift`, `pr-metadata-drift`, `topology-drift`, `check-drift`, `policy-drift`, `review-drift`, `evidence-tamper`, `ref-collision`, `receipt-unknown`, `creation-failed`, `operator-stop`. Attempt remains active until terminal abandonment. |
| `pr-closed` | `closed_at`, `pr_number`, `pr_url` | predecessor is invalidate; API readback must show the exact draft PR closed and unmerged. |
| `abandon` | `head`, `owned_ref_present`, `pr_number`, `ref_sha`, `ref_tree`, `status` | predecessor is pr-closed when a PR exists or invalidate when none exists; status `abandoned`. `pr_number` is exact or null. If `owned_ref_present` is true, SHA/tree are exact and the ref remains; if false both are null and no collided/orphan ref is claimed. Terminal and advances global frontier. |
| `merged` | `head`, `merge_sha`, `merge_tree`, `pr_number`, `recreation_request_sha256`, `status` | predecessor is binder-ready/current handoff; status `merged`. Hosted PR/ref readback and release-tree proof required. Terminal and advances global frontier. |

Digest fields are exactly 64 lowercase hex. `head` must equal the bounded grammar;
actor/owner/from/to fields use the actor grammar; `base` is `main`; `draft` and
`owned_ref_present` are JSON booleans; `response_status` is the JSON integer `201`;
PR numbers are canonical decimal strings from 1 through 2147483647; nullable fields
are JSON null only in the rows that permit it; and status values are exact table
literals. `stable_scan_digest_1` and `_2` are equal SHA-256 values over the same
ascending-numeric-event-id stream, framed as raw id bytes, NUL, raw response SHA-256,
NUL. `binder_sha256`, `observed_state_sha256`, `create_response_digest`, and
`recreation_request_sha256` use the same lowercase digest grammar.

An event envelope author may differ from `actor` only when the PR's authenticated
GitHub operator is explicitly recorded in `authority_url`; the attributable actor
still must match the current owner/handoff chain. A technical review never grants
event, ref, PR, or merge authority. `handoff` transfers only attempt-preparation
continuation; separate review and merge authority remain unchanged. A recovery
handoff cannot infer authority from inactivity: its `handoff_evidence_url` must be a
specific accountable action record created under the adopted package. Without it the
attempt stays stopped. For provisional `owner-unavailable`, only the reserve actor or
the same separately authorized recovery actor may disposition the reservation.

Each reservation has at most one event of each singular transition at a predecessor.
Multiple activation, ref-created, pr-created, invalidate, close, abandon, merge, or
competing handoff children are conflicts. A later terminal event cannot repair an
invalid predecessor. `abandon` and `merged` are mutually exclusive and final.

## Complete enumeration and deterministic single-active arbitration

Every decision performs full issue #191 pagination with `per_page=100`, follows the
REST `Link` relation through the final page (or advances numbered pages until a short/
empty final page), records page URLs/status/ETags/raw response digests and the ordered
envelope-id set, and rejects missing, repeated, out-of-order, truncated, or inconsistent
pages. All recognized v1 markers are validated, not only the candidate chain.

At any valid snapshot there is globally zero or one active VOC-106 attempt. Active
begins at `activate` and includes ref/PR/binder/handoff/invalidate/closed states until
`abandon` or `merged`. While active, every new reservation is provisional and must be
dispositioned `active-exists`; it cannot activate.

When no attempt is active, derive the global frontier as the reservation id of the
latest valid `abandon` chain, or null at genesis. A valid `merged` terminal closes
VOC-106 allocation permanently; every later reservation is invalid. Eligible
reservations cite the exact abandon frontier. Before activation, take two full scans whose relevant event-id
set and canonical digest match. Exclude invalid/dispositioned reservations and any
whose frozen develop no longer equals freshly fetched `origin/develop`. The lowest
numeric server id among remaining current-frontier reservations is the winner,
regardless of whether concurrent reservations named the same or different SHA. Post
dispositions for observed losers/stale reservations. A disposition may be authored
only by its reserve actor, the winning reserve actor, or for `owner-unavailable` the
separately authorized recovery actor with exact action evidence.
The winning reserve actor posts `activate`, then
performs two more stable full scans; only a sole valid activation may proceed to ref
creation. A later old-frontier reservation loses as `active-exists` and cannot create
a second active state.

## Creation, collisions, and immutable identity

Only the valid active owner/handoff may call GitHub `POST /repos/KARSIFT/vocanova-platform/git/refs`
with exact `refs/heads/<head>` and frozen develop SHA. Prove name absence first. Never
use PATCH/update-ref, ordinary `git push`, force, force-with-lease, or deletion for a
release/sync/permanent/foreign ref. A pre-existing name, 422, or missing raw response
is `ref-collision` or `receipt-unknown`, never evidence of ownership. Record
`invalidate` then `abandon` with `owned_ref_present:false` and null owned SHA/tree;
do not describe the collided/orphan ref as owned. Only after that active chain is
terminal may a fresh server reservation be created. Matching SHA is insufficient.

## Crash and interruption matrix

Recovery is idempotent only as follows:

| Boundary | Recoverable evidence and action | Otherwise |
| --- | --- | --- |
| reserve request before/after response | full scan finds actor-authored exact reserve event(s); arbitrate all by server id, never repost blindly | stop; no ref/PR action |
| activate before response | full scan finds exactly one valid winner activation by owner; resume from it | conflict/ambiguity stops and dispositions where valid |
| before ref POST | valid sole active chain, effective owner/handoff, two stable scans, name absent; one POST allowed | stop |
| after ref POST before receipt/readback event | preserved raw 201 response digest plus exact ref readback permits `ref-created` | 422, missing receipt, ambiguous response, or mismatched ref is never adopted; invalidate/abandon |
| before PR POST | valid ref-created, no matching PR; create exactly one draft with reservation marker/head/base | stop on other PR/ref metadata |
| after PR POST before event | after two stable full all-state PR scans, recover only exactly one draft PR authored by effective owner with exact marker/head/base; record `pr-created` | zero permits one fresh POST; a 422 triggers the same scans; duplicates/conflicts invalidate and close through governed sequence |
| binder update | exact PR body bytes/digest/readback permit `binder-ready`; later edit requires new binder event and fresh checks/reviews | missing/conflicting digest stops |
| drift/closure | `invalidate`, API-verified unmerged close, `pr-closed`, unchanged ref readback, `abandon`, in order | retry prohibited until terminal; missing/moved ref stops governed investigation |

An active attempt is never silently timed out or adopted by another actor. The owner
may resume, or an exact valid handoff may transfer preparation. If neither can prove
the required evidence, the action remains stopped; another actor cannot manufacture
ownership. New reservation is allowed only after valid terminal abandonment/merge.

## Preserved release and deletion boundaries

Frozen main remains merge base with zero main-only commits. Attempt head equals frozen
develop SHA/tree with no extra compare content. Prospective and actual release merge
trees equal frozen develop. Promotion and synchronization remain separate reviewed
merge-commit PRs with final permanent-ref, ancestry, and zero-behind proof.

Active and abandoned refs are immutable and never deletion eligible. Existing
automatic deletion may affect only a successfully merged short-lived release or sync
head after exact identity and a nonexecuted POST create-ref recovery request digest
are recorded. Missing or moved active/abandoned refs stop. Recreation is separately
authorized recovery of a completed identity, never a new attempt or reuse.

## Implementation and authority boundary

One corrected revision of draft PR #215 changes exactly 27 paths: seven living
surfaces, nine VOC-106 artifacts, nine VOC-114 artifacts, and the network-free
validator/test. The test is auto-discovered by `scripts/foundation/*.test.mjs`, so no
package script changes. Preserve adoption evidence and historical packages.

Ordinary non-force commits/pushes may update only PR #215's scoped implementation head
after adoption. The correction does not create or mutate a release/sync/permanent/
foreign ref; query/change settings; execute release/sync; dispatch/deploy; use
Cloudflare/DNS/resources/secrets/data; migrate; change traffic; spend; or launch.
