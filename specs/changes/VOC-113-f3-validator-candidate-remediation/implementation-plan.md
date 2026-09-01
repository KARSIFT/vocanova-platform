# VOC-113 — Implementation Plan

## Preconditions and delivery shape

Do not alter PR #209 until this exact nine-artifact package receives distinct
specialist and independent cross-model R4 plan reviews, accountable adoption,
complete adoption bookkeeping, and normal non-author merge to `develop`. Then use a
different builder in the existing isolated VOC-105 worktree. Keep PR #209 draft until
all replacement evidence passes.

One task and one corrected revision stream on PR #209 are required. The correction
changes exactly the two existing VOC-105 validator files. PR evidence body/comments
are refreshed after the stable commit; they are evidence metadata, not repository
paths.

## Ordered implementation

1. Fetch/read back `origin/develop`, PR #209 head, issue #211, adopted VOC-105 and
   VOC-111, and the merged VOC-110/VOC-111 contracts. Prove the worktree is exactly at
   stopped SHA `841d263...` before edits and record its `903e7f80...` digest. Preserve
   `7205f485...` only as the earlier VOC-111 observation.
2. Inventory the nine designated files and snapshot their bytes. Refactor the
   validator so each is read independently and every cross-cutting content policy
   reports the affected path. Retain the structured F3 record's existing exact facts.
3. Add deterministic, network-free helpers for credential values, exact allowed
   secret-name vocabulary, protected/unknown IDs, authority-bounded procedures, later-
   gate/production/live/launch/data positive claims, and superseded-F3-as-current
   claims. Explicitly allow the canonical public account/zone/D1 contexts, exact
   guarded Cloudflare-delivery procedures, and current production/data/hold truth.
4. Make each governed JSON object and array exact. Validate the complete gate and
   delivery inventory, every success/skipped-held/skipped-expected value, and both
   rollback proof layers. Detect duplicate raw keys before `JSON.parse` loses them.
5. Expand the focused suite with complete corpus-wide loops and structured one-field
   matrices in `test-plan.md`. First prove the canonical candidate passes. For each
   negative, assert one intended mutation and unchanged other snapshots, then require
   the intended path/field diagnostic. Retain all prior cases unchanged in effect.
6. Format and commit. Require clean porcelain status, zero staged/unstaged HEAD diff,
   and working-file OID equality with `HEAD:path` for each fixed path. Compute the
   replacement exact head/tree, each HEAD/working blob OID, and canonical 12-path
   digest. Run this complete identity proof immediately before validation.
7. Run both runtime validators, both focused suites, `ci:foundation`, `pnpm validate`,
   governance/risk/diff/path checks, and disposable scoped 12-path historical-base
   reversal. Return to the unchanged candidate, prove clean HEAD/file identity again,
   and require identical head/tree/inventory/HEAD and working OIDs/digest.
8. Update PR #209's body/binder with the replacement SHA/digest, superseded/stopped
   identities, exact test inventory/results, scoped historical rehearsal, integrated-
   first-parent rollback, scope, no-external-
   effect statement, and pending review state. Push and wait for hosted checks.
9. Obtain fresh exact-head specialist and independent cross-model R4 reviews. Resolve
   any blocker on a new SHA by repeating steps 6-9. A separate non-author merges only
   when the final exact head is eligible.
10. The adoption-recorded owner monitors from merge through exact-merge-SHA hosted
    required checks and fresh `origin/develop` readback of both validators/suites,
    foundation, governance, canonical context positives, and negative matrices. Record
    success/failure in issue #211 and stop issue closure/VOC-106 on any failure.

## Exact path inventory

| Path                                                        | Planned change                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `scripts/foundation/voc105-f3-evidence-policy.mjs`          | Complete corpus-wide fail-closed policy and exact structured validation.     |
| `scripts/foundation/voc105-f3-evidence-policy.test.mjs`     | Complete surface/claim/status/rollback matrix and stable fixture assertions. |
| The other ten VOC-105 candidate paths                       | Protected; identity/validation input only, no VOC-113 edit.                  |
| `scripts/foundation/voc081-f2-evidence-policy*.mjs`         | Protected; run only.                                                         |
| `package.json`, workflows, apps, packages, historical plans | Protected; no edit.                                                          |

## Validation and rollback

Run the commands in `test-plan.md` only after the candidate manifest pre-check.
Premerge rollback rehearsal reverses the complete 12-path PR #209 scope—not merely the
corrective commit—and proves those paths equal historical base
`533084432f0672dbf25c402e96209120a8ad50cf`, with `git diff --check` and no residue.
It does not claim that SHA will be PR #209's first parent after VOC-113 plan adoption.
After merge, a separately reviewed full PR #209 revert restores its actual then-current
first parent, including adopted VOC-113; it performs no live-system action.
