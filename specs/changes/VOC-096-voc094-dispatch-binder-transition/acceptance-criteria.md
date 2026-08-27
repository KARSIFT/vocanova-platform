# VOC-096 — Acceptance Criteria

## VOC-096-AC-00 — The governed correction has exact scope

- Requirements: `VOC-096-D00`, `D01`, `D14`, `D15`
- Task: `VOC-096-T00`
- Tests: `VOC-096-TEST-00`, `TEST-07`
- Evidence: `VOC-096-EV-00`, `EV-07`
- Result: pending

The plan PR contains exactly nine package files. Implementation uses exactly two PRs:
PR1's 27-file set (including the complete nine-file VOC-094 bounded reconciliation and
both locked-Wrangler generated type files)
and PR2's five-file documentation-only set. Review and merge actors
are separate, all blockers are resolved, and no external action is attributed to
VOC-096 adoption or merge.

## VOC-096-AC-01 — Prepared state breaks the fixed point without preclaim

- Requirements: `VOC-096-D02`, `D03`, `D04`
- Task: `VOC-096-T00`
- Tests: `VOC-096-TEST-01`
- Evidence: `VOC-096-EV-01`
- Result: pending

PR1 contains the exact enumerated reviewed staging tuple but no future ACT-03,
merged-PR2-review, or ACT-04 URL, expiry, nonce, or authorized post-state. PR2 cannot edit or influence executable gate
inputs. All nine VOC-094 package files retain immutable completed/adoption evidence but
state the corrected operative transition consistently. Missing runtime evidence remains
ineligible.

## VOC-096-AC-02 — The post-PR2 binder proves exact sequencing

- Requirements: `VOC-096-D05` through `D09`
- Task: `VOC-096-T00`
- Tests: `VOC-096-TEST-02`, `TEST-03`
- Evidence: `VOC-096-EV-02`, `EV-03`
- Result: pending

Strict live ACT-03, merged-PR2 exact-review, authority, and binder-review records plus
PR metadata prove that exact order. The dispatched
SHA is the PR2 merge commit on `develop`; a valid-shaped record targeting PR1 fails.

## VOC-096-AC-03 — URL, digest, expiry, and replay controls fail closed

- Requirements: `VOC-096-D07`, `D08`, `D10`, `D11`, `D12`
- Task: `VOC-096-T00`
- Tests: `VOC-096-TEST-03`, `TEST-04`, `TEST-05`
- Evidence: `VOC-096-EV-03`, `EV-04`, `EV-05`
- Result: pending

The live gate accepts only exact current dedicated comments whose API publishers match
the committed login/numeric-ID/type/site-admin/association trust root and whose bodies
match the input digests. It distinguishes that publisher authentication from separately
reviewed actor provenance. Authority `issued_at` exactly equals server `created_at`,
expiry is within 30 minutes, both live checks precede expiry, and the binder has never
been dispatched. Edits, fetch failures, replay, run reruns, actor collisions, and
fixture fallback block before Cloudflare secrets or mutations.

## VOC-096-AC-04 — Existing delivery and production gates are not weakened

- Requirements: `VOC-096-D11`, `D13`, `D13A`
- Task: `VOC-096-T00`
- Tests: `VOC-096-TEST-06`
- Evidence: `VOC-096-EV-06`
- Result: pending

Staging still requires every exact resource/baseline/rollback/smoke/cost/privacy gate,
and production remains held with original sentinels and HOLD-01/HOLD-02. Secret
references remain limited to the existing four credentialed action steps per
environment. Basic Load Balancing remains unchanged and excluded from VocaNova cost.
Both generated type contracts and config hashes match locked Wrangler `4.125.0` output.

## VOC-096-AC-05 — Validation, rollback, and closure are evidence-backed

- Requirements: `VOC-096-D14`
- Task: `VOC-096-T00`
- Tests: `VOC-096-TEST-07`
- Evidence: `VOC-096-EV-07`
- Result: pending

All applicable local/hosted checks pass on exact revisions, independent reviewers
record zero blockers, non-author merges are proven, rollback is rehearsed with
synthetic fixtures, and issue #164 closes only after PR1/PR2 post-merge evidence.
