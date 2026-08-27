# VOC-096 — Repair the VOC-094 dispatch-binder transition

Status: draft, pending independent plan review and adoption.

Issue [#164](https://github.com/KARSIFT/vocanova-platform/issues/164) records a
blocking governance bug in adopted VOC-094. PR1 must be dispatch-ineligible, ACT-03
must happen after PR1, PR2 must remain documentation-only, and the exact merged PR2
SHA must be the sole dispatch revision. The current executable gate nevertheless
requires the future ACT-04 evidence URL and expiry to be committed in that same SHA.
No permitted step can create those values without either preclaiming future evidence,
making PR2 executable, or weakening the fail-closed gate.

This package supplies the missing state transition without changing VOC-094's two-PR
shape:

1. PR1 performs a bounded reconciliation of VOC-094's nine package files, preserving
   immutable adoption/review history while replacing the contradictory operative
   Phase-3/4 clauses. The same PR commits real staging resources and baselines plus a
   **prepared**, never standing-authorized, runtime-binder contract. Both Wrangler
   generated type files are regenerated and checked in the exact 27-file PR1 scope.
2. ACT-03 occurs only after PR1. PR2 changes exactly the five declared settings
   documents and remains incapable of changing delivery eligibility.
3. After PR2 merges, a different-actor exact reviewer publishes a strict, fetchable
   merged-PR2-SHA review record. Only then does the accountable actor publish the
   strict ACT-04 authority record on canonical issue #158. A different non-author
   reviewer then publishes a strict binder-review record.
4. The credential-free delivery gate retrieves ACT-03, the separate VOC-085 settings-
   authority comment referenced by ACT-03, and all three post-PR2 records plus GitHub
   PR/run/check-run metadata. It verifies all five bodies and envelopes,
   hashes, actors, order, PR2 merge/file/check boundary,
   exact dispatch SHA/ref, manifest/workflow/policy hashes, staging resources and
   baselines, zero-cost/Free-plan state, production holds, expiry, and one-use nonce.
   Missing, edited, stale, replayed, unreachable, or mismatched evidence blocks before
   an environment job or Cloudflare secret is reached.

The package commits a versioned closed schema bundle for five JSON bodies and a
separate fetched GitHub API-envelope projection. Comment IDs/URLs, server timestamps,
publisher metadata, and raw-body SHA-256 are envelope facts computed only after fetch;
no body contains its own URL/hash or predicts a server field. The ACT-04 envelope's
immutable `created_at` is the sole issuance time, and its body contains only the later
`expires_at` bound. Exhaustively, `created_at < actual expires_at <= min(created_at +
30 minutes, effective token expiry)`; no unused 30-minute token buffer is required.
Comment IDs are restricted to the RFC-8785/ECMAScript safe-integer range. The prepared
tuple plus seven contract digests (shared definitions, envelope, and five bodies) make
eight total binders; all eight mappings are recomputed by independent ECMAScript and
Python JCS implementations. The URL/ID equality correction is an executable
cross-field rule outside those mappings; fresh two-runtime recomputation proves all
eight committed binder values remain unchanged.

The exact PR2 merge-SHA check read is one bounded public `check-runs?filter=all` page.
It ignores unrelated names, deterministically selects the unique latest completed
GitHub-Actions candidate for each of the three committed required aggregate records
(`ci required`, `security required`, and `structure`), and equality-binds them to the
review body. Selection is confined to the immutable PR2-merge-to-review-envelope
window. A second bounded public workflow-runs read maps each selected details URL to
the exact successful first-attempt `push` workflow name/path/ID/head/branch/check suite,
so an earlier manual dispatch cannot replace reviewed proof. Both workflow-run URL
suffixes must equal the normalized run ID; the details-URL run suffix must equal that
same ID, its job suffix must equal the selected check-run ID, and both suite IDs must
be equal. Canonical but mismatched identifiers fail closed.
The added read makes each pass at most 21 HTTP/20 core requests and both passes at most
42/40, with remaining-core thresholds 40 then 20.
The effective Phase-4 token expiry independently bounds PR2 merge,
all subsequent records, both live checks, the run, and the first secret-bearing step;
expiry while PR2 is open requires fresh exact VOC-085 authority and a replacement
ACT-03 before merge, never silent token reissue. Expiry after PR2 merge makes that
transition stale and requires a newly governed correction.

The manifest commits the exact trusted GitHub publisher login/numeric ID/association.
That authenticates only the account relaying issue comments; separately attributable
actor/provenance records and reviews establish governance role separation. The package
does not claim a shared GitHub publisher identity proves different human/AI actors.

The plan PR adds exactly the nine files in this directory. It does not itself edit an
adopted VOC-094 file, executable surface, configuration, or living documentation. It
authorizes no Cloudflare mutation, GitHub setting/secret change, workflow dispatch,
deployment, production action, credential creation, or secret disclosure.

`automatic_merge_allowed: true` has been explicitly examined. It is read-only package
metadata; no workflow merges this or a later PR.
