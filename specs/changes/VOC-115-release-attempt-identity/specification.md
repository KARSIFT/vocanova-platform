# VOC-115 — Release-attempt identity specification

## Objective and failed evidence

Issue #216 and PR #215's exact specialist FAIL prove that a head named only by frozen
`develop` cannot retry at unchanged `develop`. PR #217 candidates `f7abcc894bab3f2bc0c1dba633b800f1c51825cd`
and `535bcd47e1d82236e1e5b46dc1317ca66c4893e6` are superseded blocked evidence; their
four exact FAIL verdicts transfer nowhere. Editable comments, stable GET scans, and an
open-PR check are not atomic mutual exclusion. VOC-115 instead uses GitHub's atomic
create-ref primitive and immutable, never-reused claim refs.

## Deterministic frontier and atomic claim

The current claim ref is exactly one of:

```text
release/voc-106-claim-genesis
release/voc-106-claim-after-pr-<prior-pr-number>
release/voc-106-claim-after-conflict-<64-lowercase-hex-digest>
```

Genesis is valid only when exhaustive PR/timeline/ref reconciliation finds no VOC-106
claim, attempt, or merged history. A valid closed-unmerged attempt PR advances to its
PR-number frontier. A valid merged attempt permanently closes allocation. If a claim
ever has multiple matching PRs, none is active: close every open/unmerged duplicate,
prove terminal states, and derive the conflict frontier. Its digest is SHA-256 of the
UTF-8 ascending numeric PR-number strings joined by LF and terminated by LF.

For one frontier, each contender creates one unreferenced claim commit through the
GitHub Git Commit API. Its tree equals frozen `develop`, its sole parent is frozen
`develop`, and its exact LF-terminated ASCII message is:

```text
voc-106-claim-v1
actor=/root
github_login=m-e-h-r-d-a-a-d
github_numeric_id=7955432
github_node_id=MDQ6VXNlcjc5NTU0MzI=
frozen_develop_sha=<40-lowercase-hex>
frozen_develop_tree=<40-lowercase-hex>
frozen_main_sha=<40-lowercase-hex>
frozen_main_tree=<40-lowercase-hex>
frontier=<exact-claim-ref-without-refs/heads/>
nonce=<64-lowercase-hex-CSPRNG-value>
```

Author and committer are exactly `VocaNova release operator`, noreply address
`7955432+m-e-h-r-d-a-a-d@users.noreply.github.com`, and the same UTC RFC3339-seconds
timestamp. Unknown/extra headers, signatures, encoding headers, extra parents, changed
tree, non-LF framing, or noncanonical fields invalidate the candidate. The nonce is 32
bytes from the operating-system CSPRNG and never a counter, timestamp, JS number, or
secret. A contender keeps its candidate commit SHA and message as local recovery input.

Each contender then calls GitHub `POST /git/refs` once for the same absent exact claim
ref and its own candidate commit SHA. GitHub's atomic unique-ref creation selects one
winner. `201`, `422`, timeout, or disconnect all lead to exact GET/readback:

- target equals this contender's valid candidate commit: it is the winner and resumes;
- target is another valid candidate for the same frontier/frozen topology: it is the
  loser and performs no further mutation;
- ref absent after an unknown result: allocation remains stopped; never repeat POST;
- malformed/wrong target, pre-existing unvalidated object, or multiple frontier claims:
  stop for governed correction; never adopt, update, force, or delete.

The accepted claim ref and commit are immutable, permanent, and never deletion-
eligible. Therefore a consumed frontier cannot be won again by a stale process, and
deleted comments/bodies cannot recreate genesis or absence. Unreferenced losing commit
objects grant no identity or authority.

## Collision-free attempt identity and ref

The winner's release head is exactly:

```text
release/voc-106-<frozen-develop-sha>-attempt-<winning-claim-commit-sha>
```

Both SHAs are 40 lowercase hex. Identity is the tuple of frontier claim-ref name,
winning immutable claim-commit SHA, and frozen-develop SHA/tree. Atomic one-use claim
refs make accepted identities collision-free even if a theoretical hash collision or
duplicate candidate is presented: any ambiguous/non-unique object equality stops.
Same-develop retry uses a new frontier and claim commit, so its attempt ref is distinct
while the old claim/attempt refs remain immutable.

PR numbers match `[1-9][0-9]{0,9}` and are at most `2147483647`, handled only as
strings/`BigInt`. Claim/attempt heads are safe ASCII, at most 105 bytes, full refs at
most 116 bytes, and must pass `git check-ref-format --branch`. Invalid/exhausted input
stops without truncation or fallback.

Only the claim winner may atomically POST-create the absent attempt ref at exact frozen
`develop`. A lost response recovers only by exact ref SHA/tree readback plus claim
ownership. Absence after unknown response remains stopped and is never reposted;
mismatch/collision is never adopted, moved, forced, or deleted. Bound active and
abandoned attempt refs are permanent. Existing automatic deletion may affect only a
successfully merged short-lived head after recovery evidence is recorded; claim refs
are never eligible.

## PR lifecycle and uncertain responses

Only the claim winner posts one draft PR with exact attempt head, `base=main`, frozen
head/base SHA/tree, and canonical binder. After `201` or `422`, fully reconcile. After
timeout, disconnect, or unknown result, never retry the PR POST:

- exactly one valid matching PR recovers the attempt;
- zero matching PRs leaves allocation permanently stopped pending governed correction;
- multiple matching PRs are conflict: none is active, close every open/unmerged match,
  prove closure, and derive the conflict frontier.

A valid open draft PR backed by the unique winning claim is the sole active attempt. A
closed-unmerged PR is durable abandonment and is never reopened. A merged PR is
terminal success. The complete issue timeline must prove state, closure, merge,
assignment, head deletion, and absence of reopen/unauthorized transfer. State
precedence is merged; conflict; closed-unmerged; open valid draft; claimed but PR-
unknown/stopped; empty. Invalid objects never degrade into a lower valid state.

## Exhaustive reconciliation

Every decision repeats until two consecutive complete projections are identical:

1. paginate `GET /repos/KARSIFT/vocanova-platform/pulls?state=all&per_page=100`
   through final `Link` proof and locally filter the reserved namespace;
2. paginate every reserved PR issue timeline at `per_page=100` through final `Link`;
3. enumerate all `refs/heads/release/voc-106-*` through both `git ls-remote --heads`
   and fully paginated GitHub matching-refs, requiring byte-identical sets; and
4. GET every claim commit and every matching PR/ref object referenced by projections.

Reject gaps, repeats, reordered/changed page snapshots, missing final proof, duplicate
ids, malformed fields, hostile input, source disagreement, or unmatched objects. Every
claim ref maps to its canonical commit and zero or more fully modeled PR outcomes;
every attempt ref maps to exactly one claim and PR history, or the one current
PR-unknown stopped claim. A PR maps to its ref or an explicit GitHub deleted-source
state permitted only after successful merge. No filtered-only search proves absence.

## Reconstructible canonical receipts

Receipts are evidence, not state authority. Each is RFC 8785/JCS UTF-8 JSON with exact
own-key sets, canonical strings, UTC seconds, counts/high-watermarks, and a lowercase
SHA-256 over the object with only its `digest` field omitted:

- `voc-106-pr-scan-v1`: repository/endpoint/query/per-page/page-count/total-count/
  highest-number/fetched-at and PR-number-sorted projections containing number/node-id,
  state/draft, author login/id/node-id, head ref/SHA, base ref/SHA, timestamps, merge SHA.
- `voc-106-timeline-scan-v1`: repository/PR identity/endpoint/per-page/page-count/
  total-count/highest-event-id/fetched-at and event-id-sorted projections containing
  id/node-id, event, actor and assignee login/id/node-id, commit-id, created-at.
- `voc-106-ref-scan-v1`: repository, exact ls-remote command and API endpoint/page-
  count, fetched-at, ref-name-sorted `{ref,sha}` arrays from both sources, set equality.
- `voc-106-claim-scan-v1`: claim ref/commit SHA, complete canonical commit projection,
  validation result, frozen topology, and fetched-at.
- `voc-106-reconciliation-v1`: both stable-pass timestamps, all four projection
  digests/counts/high-watermarks, frozen main/develop SHA/tree, frontier, claim SHA,
  attempt ref, PR number/node-id or null, and derived state.

Receipts and binder live in the attempt PR body and an issue-#191 evidence link, but
body/comments are editable/deletable and grant nothing. Every continuation/handoff
re-fetches authoritative GET objects and reconstructs identical receipts. Missing or
mismatched evidence stops; raw POST response bytes and self-referential digests are
forbidden.

## Actors and handoff

The only mapped mutation operator is agent `/root`, authenticated as GitHub login
`m-e-h-r-d-a-a-d`, numeric id `7955432`, node id `MDQ6VXNlcjc5NTU0MzI=`. The
authenticated response identity, claim commit fields, PR author, and receipt actor must
all match. Delegated planners/builders/reviewers have no GitHub mutation authority;
`/root` may attach their attributable evidence.

No current handoff exists. Future handoff requires a separately adopted actor/login/
id/node-id mapping and durable PR assignment by the current owner, plus reconstructed
receipts. It transfers preparation only, never review, merge, settings, deployment, or
external authority. A claim before PR cannot be handed off. Owner loss, inactivity,
self-asserted prose, or unmapped assignment stops for EHR/governed correction.

## Crash matrix

| Boundary | Exact recovery |
| --- | --- |
| freeze/scans | repeat complete stable projections; changed frozen input restarts before mutation |
| claim-commit POST unknown | local exact candidate SHA plus GET may recover object only; no claim authority yet |
| claim-ref POST unknown | exact ref/commit readback: own target wins, other target loses, absence stops with no repost |
| attempt-ref POST unknown | exact readback plus winning claim may resume; absence/mismatch stops with no repost |
| PR POST unknown | never retry; one valid PR recovers, zero stops, duplicates close into conflict frontier |
| binder/readback | reconstruct every authoritative view; exact state resumes, mismatch stops |
| drift/check/review failure | close draft unmerged, prove timeline and ref immutability, derive PR-number frontier |
| competing PRs | close all open/unmerged matches, prove terminals, derive conflict frontier |
| owner loss | mapped owner resumes; post-PR separately adopted assignment may hand off; otherwise stop |

## Preserved topology and action boundaries

Frozen `main` remains merge base with zero main-only commits. Attempt head equals frozen
`develop` SHA/tree with no extra compare content; the claim commit is never a release
head or merge input. Prospective/actual release trees equal frozen `develop`. Promotion
and synchronization remain separately reviewed merge-commit PRs with permanent refs,
ancestry/zero-behind, reviewer separation, non-author merge, rollback, and R4 evidence.

One corrected revision of draft PR #215 changes exactly 27 paths: seven living
surfaces, nine VOC-106, nine VOC-114, and a network-free validator/test. Ordinary non-
force commits may update only that implementation head after adoption. The correction
itself creates no claim/release/sync/permanent/foreign ref, queries/changes no setting,
and performs no release, deployment, Cloudflare/DNS, secret/data, migration, traffic,
spending, or launch action.
