# VOC-115 — Release-attempt identity specification

## Objective and failed evidence

Issue #216 and PR #215's exact specialist FAIL prove that a head named only by frozen
`develop` cannot retry at unchanged `develop`. PR #217 candidates `f7abcc894bab3f2bc0c1dba633b800f1c51825cd`,
`535bcd47e1d82236e1e5b46dc1317ca66c4893e6`, and
`ade2d6db3376b879c3f68d2bc23010b0c8894bed`,
`00233a0fdcc9603346006d473605bca83b590179`, and
`6ecc996687eb629dfd06d27708195d1d28a0a010` are superseded blocked evidence. Their
exact FAIL verdicts transfer nowhere. Editable comments and scans are not locks; a
client nonce/commit serializes a value, not a caller; and policy prose cannot make a
deletable ref durable. This replacement removes caller uniqueness and makes server-
enforced ref immutability a held execution prerequisite.

## Held server-enforced immutability prerequisite

VOC-115 implementation changes repository content only. It does not query or change
settings and grants no such authority. Before any corrected VOC-106 attempt, a
separately authorized settings action must install and read back an active GitHub
ruleset that matches exactly:

```text
refs/heads/release/voc-106-claim-*
refs/heads/release/voc-106-*-attempt-*
refs/heads/release/voc-106-submit-*
```

For matching refs it must deny update, force/non-fast-forward update, and deletion,
allow creation, have no actor/team/app bypass, and apply to administrators. Exact
repository id, ruleset id and latest history version, target, enforcement, include/
exclude patterns, rules, bypass array, creator/action authority, timestamp, and GET
response digests must
be recorded in a separately governed current-settings record. If GitHub cannot express
or read back every invariant, VOC-106 remains held. A later setting change/disable is a
new separately authorized action and invalidates every in-progress attempt.

No deletion-resistance claim extends to unauthorized settings mutation or GitHub
control-plane failure. Under the verified ruleset, an accepted claim/attempt/submit ref cannot
disappear; without it no claim creation, PR, release, or recovery is allowed.
The frozen external contract is GitHub's official
[repository-rules REST API](https://docs.github.com/en/rest/repos/rules?apiVersion=2026-03-10),
including the `update`, `deletion`, `non_fast_forward`, history, and version endpoints.

## Deterministic frontier and atomic topology claim

The current claim ref is exactly one of:

```text
release/voc-106-claim-genesis
release/voc-106-claim-after-pr-<prior-pr-number>
release/voc-106-claim-after-conflict-<64-lowercase-hex-digest>
```

Genesis is valid only when exhaustive stable reconciliation finds no claim, attempt, submit,
or reserved PR history. One valid closed-unmerged attempt PR advances to its number.
One valid merged attempt closes allocation only after duplicate cleanup below. The
conflict digest is SHA-256 of ascending numeric matching PR-number strings joined by LF
and terminated by LF.

Every contender freezes `origin/develop` and `origin/main`, proves the ruleset and
stable view, then calls GitHub `POST /git/refs` for the same frontier claim ref with
target equal to its frozen `develop` SHA. Atomic unique-ref creation chooses one target,
not one caller. Exact same-target contenders are deliberately one logical claim and
all downstream claim/attempt ref operations are idempotent/server-serialized; there is no caller-winner
predicate. A different-target contender loses and performs no mutation.

Claim creation request JSON has exactly `ref` (`refs/heads/<frontier>`) and `sha`
(frozen develop) in RFC 8785/JCS bytes. After `201`, `422`, timeout, or disconnect,
discard local call history and reconstruct state:

- target equals the frozen SHA/tree: this logical claim may continue;
- another valid target: this contender loses;
- absent in a fresh stable state: the same canonical request remains eligible; any
  authorized actor may send it, regardless of whether an earlier call was attempted;
- malformed/wrong/unreconstructible state: stop; never adopt, update, force, or delete.

The accepted claim is the immutable ref target, not a response recipient. Replayed or
duplicate requests for the same target coalesce and cannot create a second identity.
The verified ruleset makes accepted absence impossible under authorized actions.

Immediately after claim acceptance and before attempt-ref creation, take two consecutive
fresh reads of `origin/develop`, `origin/main`, and both trees. The reads must equal
each other and all four values must equal the claim's frozen stable view. If any differs,
the accepted protected claim ref itself records a permanent
`stale-protected-topology` terminal and the entire VOC-106 operation is irrecoverably
stopped pending a new governed correction. It does not derive another frontier and no
attempt ref/PR may be created. Existing protected-main/develop non-force history makes
return to the old exact SHA impossible under authorized actions; a ref rewind is an
out-of-bound settings/history violation and never revives the claim. Acceptance
criteria/tests intentionally do not promise a usable winner for different topology.

## SHA-bound attempt identity

The valid claim's attempt head is exactly:

```text
release/voc-106-<40-lowercase-hex-frozen-develop-sha>-attempt-genesis
release/voc-106-<40-lowercase-hex-frozen-develop-sha>-attempt-after-pr-<prior-pr-number>
release/voc-106-<40-lowercase-hex-frozen-develop-sha>-attempt-after-conflict-<64-hex-digest>
```

It is POST-created once at exact frozen `develop`. Same-target contenders coalesce on
the same name/target. Claim frontier, claim target SHA/tree, attempt name/target, the
derived submit marker, and later server PR number/node id form one identity. Same-develop retry has a new
prior-PR frontier/name while every earlier ref stays immutable.

PR numbers are canonical decimal strings `[1-9][0-9]{0,9}` not exceeding
`2147483647`. GitHub ids are canonical `[1-9][0-9]{0,18}` not exceeding
`9223372036854775807`. Parse/compare with `BigInt`, never JSON `Number`. SHAs/digests
are 40/64 lowercase hex. Node ids are nonempty 1–256-byte ASCII `[A-Za-z0-9_=-]+`.
Generated branch/full-ref byte lengths are exact: claim genesis `29/40`, maximum
after-PR claim `41/52`, conflict claim `101/112`, attempt genesis `72/83`, maximum
after-PR attempt `84/95`, conflict attempt `144/155`, and submit marker `87/98`.
The first number excludes and the second includes the 11-byte `refs/heads/` prefix.
The branch passes `git check-ref-format --branch`; the full name passes
`git check-ref-format`. The grammar-wide full-ref maximum is therefore 155 bytes, not
an independent truncation limit. An extra byte, an 11-digit/above-maximum PR number,
or a 65-byte digest is invalid rather than truncated. Invalid/exhausted input stops
without fallback.

Attempt creation uses the same exact two-key JCS ref request and state-idempotent
absence/readback rule as the claim ref. Exact target resumes; other/malformed target stops. Update, force,
force-with-lease, and deletion are forbidden. Claim and active/abandoned attempt refs
are never automatic-deletion eligible. A successfully merged short-lived attempt ref
also remains protected under this design; recovery never relies on source deletion.

## Protected one-shot PR submit marker

After attempt-ref and final protected/ruleset readback, derive the already defined
`allocation_state_sha256`. Its submit marker is exactly
`release/voc-106-submit-<64-lowercase-hex-allocation-state-sha256>` at frozen
`develop`. Its create request is the same exact two-key JCS `{ref,sha}` object used for
claim/attempt creation, with the full submit ref and frozen develop SHA. It is covered
by the verified no-bypass ruleset and is never updated, forced, or deleted.

Atomic creation grants a deliberately nontransferable, one-shot submit award only to
the exact HTTP invocation that synchronously receives status `201`, verifies returned
ref and object SHA equal the request, and constructs `voc-106-submit-award-v1` with
exact own keys `http_status` (JSON integer `201`), `ref` (full submit ref),
`request_jcs_sha256` (digest64), `schema` (that literal), and `sha` (frozen develop).
The award is ephemeral control-flow evidence, never a durable/history receipt and
never reconstructible or handoff eligible. A same-target `422`, timeout, disconnect,
lost response, readback, or later observation of the marker does not receive the award
and cannot submit a PR.

The awarded invocation may issue exactly one canonical PR POST immediately, with HTTP
client/middleware retries set to zero, redirects disabled, and no second application-
level request after any status, timeout, disconnect, or lost response. Crash after
marker creation but before POST, award loss, or marker-present/zero-PR after a started
POST is a durable `submit-outcome-unknown` hold. No actor may retry, transfer, derive a
successor, or declare abandonment; stable reconciliation may only wait for the sole
in-flight request to materialize. This loss of liveness is intentional. Because only
one awarded invocation can issue only one POST, observing its matching PR consumes the
award and proves there is no authorized delayed second request that can appear after a
successor frontier is claimed.

## PR creation and cardinality-first lifecycle

After final protected-ref readback, the awarded invocation uses one canonical PR-create JCS object
with exactly `base:"main"`, `body:<canonical binder bytes as a JSON string>`,
`draft:true`, `head:<attempt ref>`, `maintainer_can_modify:false`, and
`title:"VOC-106 release promotion"`. Only the exact submit-award recipient may send
these bytes, once. After the response, reconcile without retry: exactly one valid match
recovers; zero remains `submit-outcome-unknown`; multiplicity enters conflict cleanup.
Before a submit marker exists, no PR POST is authorized. After it exists, restart,
owner loss, an unknown response, or a non-awarded observer with zero PR is the same
durable fail-closed hold, never permission to recreate the request.

The creation binder is exact LF-framed text `<!-- voc-106-attempt-binder-v1\n`, one JCS
object, `\n-->\n`, with object own keys `attempt_ref`, `claim_ref`, `claim_sha`,
`frozen_develop_sha`, `frozen_develop_tree`, `frozen_main_sha`, `frozen_main_tree`,
`frontier`, `issue_url`, `schema`, `submit_ref`, and `allocation_state_sha256`. Every SHA/digest/ref uses
the domains below; `issue_url` is exactly
`https://github.com/KARSIFT/vocanova-platform/issues/191`; `schema` is
`voc-106-attempt-binder-v1`. It contains no capture timestamp, ETag, response bytes,
PR id, full-repository scan boundary, or mutable evidence link, so restart reconstructs
identical PR-create bytes for audit even when unrelated PR capture state changes; that
reconstruction never recreates a submit award or authorizes another POST.
Later capture receipts are evidence attachments and never change this creation binder
or state authority.

`allocation_state_sha256` hashes JCS of an exact `voc-106-allocation-state-v1` object
with own keys `attempt_ref`, `attempt_sha`, `claim_ref`, `claim_sha`,
`frozen_develop_sha`, `frozen_develop_tree`, `frozen_main_sha`, `frozen_main_tree`,
`frontier`, `issue_url`, `repository`, `ruleset_history_version`, `ruleset_id`, and
`schema`. Values are the already defined domains; schema is that literal. It excludes
`submit_ref` to avoid a self-referential hash, all capture data, and unrelated PRs. The
submit ref is derived only after this digest exists. Any listed policy/topology value change stops the
old allocation rather than producing a new request.

Cardinality is evaluated before terminal precedence for all PRs mapped to one claim/
attempt identity. Every corrected identity must also have its exact immutable submit
marker; a PR without it is unauthorized/legacy ambiguity and stops. A marker plus one
matching PR is `consumed`; marker plus zero is never abandonment or successor input:

1. With more than one matching PR, state is `conflict-cleanup` regardless of merge.
   Close every open/unmerged duplicate, fetch every complete timeline and PR readback,
   and require every nonmerged PR closed-unmerged. No release/sync action occurs during
   cleanup.
2. After cleanup, exactly one valid merged PR plus only closed-unmerged duplicates is
   terminal success. More than one merged PR, conflicting merge SHA/tree, a reopened/
   unclosed duplicate, or failed readback is irrecoverably stopped.
3. With no merged PR, all closed-unmerged matches form conflict abandonment and advance
   to the conflict-digest frontier over every matching PR number.
4. With exactly one matching open draft PR, it alone is active. Exactly one closed-
   unmerged PR advances to its number. A failed/closed PR is never reopened.

The complete PR timeline must prove closure, reopen absence, merge, assignment, head-
ref event absence, and transfer. A `head_ref_deleted` or restored event for a corrected
protected identity is a ruleset/history violation and stops. State precedence after
cardinality cleanup is merged terminal;
conflict abandonment; single closed abandonment; single open active; protected
submit marker with PR `submit-consumed`; submit marker with zero PR
`submit-outcome-unknown`; attempt ready-for-submit; claim ready-for-attempt; empty.
Invalid states never degrade
into a lower valid state.

## Lossless JSON and exact projections

All response JSON is parsed from UTF-8 bytes with duplicate-key rejection and lossless
numeric-token capture before any conversion. Unknown/missing keys in a frozen receipt
object fail. Nullable means JSON `null`; otherwise null is forbidden. Booleans are JSON
booleans. Times are `YYYY-MM-DDTHH:MM:SSZ`. URLs are canonical HTTPS API URLs with
query keys in the exact order stated. Lists are arrays, never maps. Every GitHub REST
request uses `Accept: application/vnd.github+json` and
`X-GitHub-Api-Version: 2026-03-10`; an unavailable/incompatible version stops.

Exact projection own-key sets are:

| Projection | Keys and domains |
| --- | --- |
| `pr-boundary-v1` | `head_label:string|null`, `head_ref:string|null`, `head_repo_full_name:string|null`, `node_id:node`, `number:pr-decimal`, `updated_at:time` |
| `reserved-pr-v1` | `base_ref:string`, `base_sha:sha40`, `closed_at:time|null`, `created_at:time`, `draft:boolean`, `head_label:string`, `head_ref:string`, `head_repo_full_name:"KARSIFT/vocanova-platform"`, `head_sha:sha40`, `merge_commit_sha:sha40|null`, `merged_at:time|null`, `node_id:node`, `number:pr-decimal`, `state:"open"|"closed"`, `updated_at:time`, `user_id:id-decimal`, `user_login:string`, `user_node_id:node` |
| `timeline-v1` | `actor_id:id-decimal|null`, `actor_login:string|null`, `actor_node_id:node|null`, `assignee_id:id-decimal|null`, `assignee_login:string|null`, `assignee_node_id:node|null`, `commit_id:sha40|null`, `created_at:time`, `event:timeline-event`, `id:id-decimal`, `node_id:node|null` |
| `ref-v1` | `name:string`, `sha:sha40` |
| `git-commit-v1` | `parents:[sha40]` (zero through 16 entries in API order), `sha:sha40`, `tree:sha40` |
| `protected-v1` | `name:"develop"|"main"`, `sha:sha40`, `tree:sha40` |
| `ruleset-history-v1` | `actor_id:id-decimal`, `actor_type:"User"`, `updated_at:time`, `version_id:id-decimal` |
| `ruleset-v1` | `bypass_actors:[]`, `conditions:{ref_name:{exclude:[],include:[exact-three-patterns-in-the-order-above]}}`, `enforcement:"active"`, `history_version:id-decimal`, `id:id-decimal`, `name:"VOC-106 immutable release attempt refs"`, `rules:[{type:"deletion"},{type:"non_fast_forward"},{parameters:{update_allows_fetch_and_merge:false},type:"update"}]`, `source:"KARSIFT/vocanova-platform"`, `source_type:"Repository"`, `target:"branch"` |

`history_version` is projected from the numeric-max exact ruleset-history record. Fetch
that exact version and require its `state` projection byte-equal the current ruleset
projection after omitting only `history_version`. The remaining ruleset keys come from
the exact ruleset GET. For raw GET arrays, the
lossless parser validates every listed source path and projects
only these exact keys; unrelated documented API response keys do not enter policy state.
Missing, duplicate, lossy, or wrong-type source values fail. Numeric source tokens are
converted directly to canonical decimal strings; nullable source paths map only to the
specified null. `items_jcs_sha256` is computed after this deterministic projection.

`timeline-event` is exactly one of `assigned`, `unassigned`, `closed`, `reopened`,
`merged`, `head_ref_deleted`, `head_ref_restored`, `base_ref_changed`, `renamed`,
`locked`, `unlocked`, `labeled`, `unlabeled`, `milestoned`, `demilestoned`,
`review_requested`, `review_request_removed`, `review_dismissed`, `ready_for_review`,
`convert_to_draft`, `auto_merge_enabled`, `auto_merge_disabled`,
`added_to_merge_queue`, `removed_from_merge_queue`, `committed`, `reviewed`, `commented`,
`referenced`, `cross-referenced`, `connected`, `disconnected`, `subscribed`,
`unsubscribed`, `marked_as_duplicate`, `unmarked_as_duplicate`, `transferred`,
`converted_note_to_issue`, `deployed`, or `deployment_environment_changed`. A new event
enum stops for governed schema revision rather than being ignored.

## Capture receipts and stable state

Each fetched page produces `voc-106-page-capture-v1` with exactly:

`schema` (that literal), `source` (`pulls|timeline|matching_refs`), `endpoint` (exact
page URL), `http_status` (JSON integer 200), `etag` (ASCII string or null), `captured_at`
(time), `page` (id-decimal), `per_page` (string `"100"`), `next_url` (canonical URL or
null), `item_count` (decimal string `0..100`), `raw_sha256` (digest64), `items` (array of
the source projection), `items_jcs_sha256` (digest64), and `capture_sha256` (digest64).
The source projection is `pr-boundary-v1` for `pulls`, `timeline-v1` for `timeline`,
and `ref-v1` for `matching_refs`; reserved PR detail is an object capture using
`reserved-pr-v1`.
`capture_sha256` hashes RFC 8785/JCS of the object with only itself omitted;
`items_jcs_sha256` hashes JCS `items`. Raw digest covers exact response bytes. Capture
timestamps/ETags/raw bytes are deliberately capture-specific and need not reproduce.

Each non-page GET produces `voc-106-object-capture-v1` with exactly `schema`, `source`
(`ruleset|ruleset_history|protected_ref|git_commit|reserved_pr`), `endpoint`, `http_status` (200),
`etag` (ASCII string or null), `captured_at`, `raw_sha256`, `projection` (the exact
ruleset-history/ruleset/protected/git-commit/reserved-PR object for the source),
`projection_jcs_sha256`, and `capture_sha256`. The
projection digest hashes only JCS `projection`; the capture digest hashes the whole
object with only `capture_sha256` omitted. Capture-specific fields are excluded from
stable state.

One source scan produces `voc-106-scan-capture-v1` with exact keys `schema`, `source`,
`started_at`, `completed_at`, `pages`, `page_count`, `total_count`, `high_watermark`,
`capture_sha256`, and `state_projection_sha256`. Counts/page numbers are canonical
decimal strings. Pull/timeline high watermark is id-decimal or `"0"`; matching-ref
high watermark is its last UTF-8 ref name or null. `pages` is ordered page-
capture digests. Its capture digest omits only itself. The state digest excludes all
capture times, ETags, page boundaries, raw digests, and capture digests.
`state_projection_sha256` hashes JCS of the complete concatenated source projections:
PRs sorted by numeric number, timeline events by numeric id, or refs by UTF-8 name.

`voc-106-stable-state-v1` has exactly `schema`, `repository`, `ruleset`,
`protected_refs`, `counts`, `high_watermarks`, `all_pr_boundary`, `reserved_prs`,
`timelines`, and `refs`.
`repository` is `KARSIFT/vocanova-platform`; `ruleset` is `ruleset-v1`;
`protected_refs` sorts by name; `all_pr_boundary` contains `pr-boundary-v1` for every
repository PR, including ordinary forks and deleted sources, sorted by numeric number.
Only after the full scan, select reserved candidates whose head ref matches the exact
attempt grammar and whose repository is exactly `KARSIFT/vocanova-platform` and label
is exactly `KARSIFT:<head_ref>`. Foreign/fork labels remain only in the boundary. A
boundary with null repository is `ambiguous-head-provenance` when either its nonnull
`head_ref` matches the attempt grammar or its nonnull `head_label` is `KARSIFT:` plus
such a grammar-matching ref. It
invalidates the whole allocation view; neither its label nor a `head_ref_deleted`
timeline event proves which repository formerly owned the ref. This plan defines no
immutable prior-repository proof channel, so null is never promoted to canonical or
silently ignored. Fetch each selected PR detail and build `reserved-pr-v1`;
`reserved_prs` sorts by number; `timelines` is sorted objects
`{events,pr_number}` with events by numeric id;
`refs` is the equal full reserved `ref-v1` set sorted by UTF-8 ref name. `counts` has
exact decimal-string keys `all_prs`, `refs`, `reserved_prs`, `timeline_events`, and
`timelines`. `high_watermarks` has `all_pr_number` (id-decimal or `"0"`), `refs` (last
UTF-8 name or null), and `timelines` (PR-number-sorted exact objects
`{event_id,pr_number}`, where empty event id is `"0"`). The state
digest is SHA-256 of its JCS bytes and is what a later actor must reproduce when state
has not changed. A separate `voc-106-reconciliation-v1` has exact keys `schema`,
`pass_1_capture_sha256`, `pass_2_capture_sha256`, `stable_state_sha256`,
`frozen_develop_sha`, `frozen_develop_tree`, `frozen_main_sha`, `frozen_main_tree`,
`frontier`, `claim_sha`, `attempt_ref`, `submit_ref`, `submit_state`, `pr_number`,
`pr_node_id`. Their exact field domains are: `frontier` and `attempt_ref` are valid
ref-name strings or null, `submit_ref` is a valid submit ref or null, `submit_state` is
exactly `absent`, `awarded-current-invocation`, `submit-outcome-unknown`, or `consumed`,
`claim_sha` is sha40 or null, `pr_number` is PR-decimal or null, and `pr_node_id` is
node or null. `awarded-current-invocation` may exist only in the synchronous 201
recipient and is not persisted or reconstructed. Capture digests/times may change;
stable-state digest must not.

## Exact stable-view algorithm

For each pass, with no mutation by the actor:

1. GET/read back ruleset, its latest history version, and protected SHA/tree.
2. Request all PR pages using exact query
   `state=all&sort=created&direction=asc&per_page=100&page=<n>`. Start at page 1,
   require Link next URL to equal page `n+1` when present, and always fetch successive
   numbered pages until one has fewer than 100 items (including an empty sentinel after
   a full page). Reject repeats/gaps and compute full count/highest PR number before
   applying the exact reserved filter.
3. For every reserved PR, fetch timeline pages with `per_page=100&page=<n>` under the
   same page rule. Reject duplicate ids and compute highest event id.
4. Enumerate reserved refs through full `git ls-remote --heads origin
   'refs/heads/release/voc-106-*'` and numbered GitHub matching-ref pages until short;
   require byte-identical sorted sets and exact object/tree readback.
5. Construct the timestamp-free stable state and digest.

Run two complete passes. Equality means byte-equal JCS stable-state objects, including
full-repository PR boundary vectors, protected refs, ruleset, reserved PR/timelines,
and refs; it is evaluated after full-page completeness but before any mutation. Page
capture metadata is not compared. Any outside-namespace PR create/update changes
`all_pr_boundary` and destabilizes the pair. Discard unequal pairs and retry from pass
1, at most three pairs; then stop. After claim acceptance, protected/ruleset readback
is mandatory again as specified above. Any pagination/API/schema incompatibility stops.

## Actors, topology, and action boundary

The only mapped mutation operator is `/root`, GitHub login `m-e-h-r-d-a-a-d`, id
`7955432`, node id `MDQ6VXNlcjc5NTU0MzI=`. Same-identity claim/attempt calls coalesce;
delegated agents/reviewers cannot mutate GitHub. No current handoff exists. Future
handoff requires separately adopted mapping, durable PR assignment by the current
owner, and stable-state reconstruction; claim-before-PR cannot transfer.

Frozen `main` remains merge base with zero main-only commits. Attempt head equals frozen
`develop` SHA/tree; prospective/actual release trees equal it. Promotion/sync remain
separately reviewed merge-commit PRs with permanent refs, ancestry/zero-behind,
reviewer separation, non-author merge, rollback, and R4 evidence.

One corrected PR #215 revision changes exactly 27 paths: seven living, nine VOC-106,
nine VOC-114, and validator/test. Ordinary non-force commits may update only that head
after adoption. The correction itself creates no claim/attempt/submit/release/sync/permanent/
foreign ref and performs no setting query/change, release, deployment, Cloudflare/DNS,
secret/data, migration, traffic, spending, or launch action. The separate ruleset
prerequisite remains held until explicit authority and exact readback evidence exist.
