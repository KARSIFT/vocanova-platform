# VOC-111 — Specification

## Objective and exact reproduction

[Issue #206](https://github.com/KARSIFT/vocanova-platform/issues/206) records a
test-harness defect after VOC-110 merged. At exact `develop` SHA
`c94444bc74d3ed1b5ca0aca65141d0532f70fa11`, with the preserved 12-path VOC-105
candidate applied read-only:

- `node scripts/foundation/voc081-f2-evidence-policy.mjs` passes;
- `node scripts/foundation/voc105-f3-evidence-policy.mjs` passes; and
- `node --test scripts/foundation/voc081-f2-evidence-policy.test.mjs` reports 24/27
  passing and exactly three failures at the tests beginning near lines 294, 520, and 714.

The runtime validator is correct. The failures arise because the test harness uses
the default `pre-voc105` surface profile, searches for one fixed old JSON value, and
uses mutable `repositoryRoot` content as its preserved pre-profile fixture. Issue
#206 and the dirty worktree are diagnostic evidence only, not authority.

The current preserved candidate is bound by canonical manifest contract
`VOC-111-CANDIDATE-MANIFEST-00` below. Digest
`8efd149cce12cbd8b20fd07c8c942faacdc028f9b316a2cdedd15768f9a28da1` identifies
only the superseded pre-format historical snapshot produced by an earlier ad hoc
stream; it is not current candidate identity. The current candidate's
`pnpm run ci:foundation` result is 179/182 with the same three focused failures and no
additional failure class.

### VOC-111-CANDIDATE-MANIFEST-00 — Canonical preserved-candidate identity

The required base is exactly
`c94444bc74d3ed1b5ca0aca65141d0532f70fa11`. The fixed path inventory is exactly these
12 paths in this lexicographic order:

```text
docs/README.md
docs/operations/README.md
docs/operations/cloudflare-delivery.md
docs/operations/voc-081-f2-evidence.json
docs/operations/voc-081-f2-evidence.md
docs/operations/voc-105-f3-evidence.json
docs/operations/voc-105-f3-evidence.md
docs/product/12-mvp-implementation-plan.md
docs/product/README.md
package.json
scripts/foundation/voc105-f3-evidence-policy.mjs
scripts/foundation/voc105-f3-evidence-policy.test.mjs
```

Run this exact credential-free command from the preserved VOC-105 worktree after
proving `git rev-parse HEAD` equals the required base:

```bash
for f in docs/README.md docs/operations/README.md docs/operations/cloudflare-delivery.md docs/operations/voc-081-f2-evidence.json docs/operations/voc-081-f2-evidence.md docs/operations/voc-105-f3-evidence.json docs/operations/voc-105-f3-evidence.md docs/product/12-mvp-implementation-plan.md docs/product/README.md package.json scripts/foundation/voc105-f3-evidence-policy.mjs scripts/foundation/voc105-f3-evidence-policy.test.mjs; do
  test -f "$f" || exit 1
  printf '%s\0' "$f"
  git hash-object "$f" | tr -d '\n'
  printf '\0'
done | sha256sum
```

For each fixed path, the byte stream is raw UTF-8 path bytes, one NUL byte, the file's
Git blob object ID with no LF, and one NUL byte. SHA-256 is computed over the 12
concatenated entries. This covers tracked and untracked files uniformly and is
independent of patch context and order. The first output field must equal exactly
`7205f4856b2839f7302ab9a9fd9fbac57ee69942723f283241ac2970bb147e43`.
Base, ordered inventory, command, framing algorithm, and digest are jointly required;
none may substitute for another.

`VOC-111-TEST-00` executes and records this command immediately before and immediately
after reproduction commands, and `VOC-111-EV-00` contains both identical outputs plus
the base/path readback. During bounded observation, `VOC-111-TEST-06` re-executes the
same TEST-00 identity procedure immediately before and after observation commands;
`VOC-111-EV-06` links those two outputs back to `VOC-111-EV-00`. Any base, path,
existence, order, blob OID, framing, or digest mismatch stops reproduction/observation
and requires refreshed governed evidence rather than relabeling the candidate.

## Requirements

### VOC-111-D00 — Preserve lifecycle and bind the defect

The implementation base is the exact VOC-110 merge
`c94444bc74d3ed1b5ca0aca65141d0532f70fa11`; its reviewed implementation is
`66928cb432ace3440990514526cc3afc6262d3de`. No test edit begins until a VOC-111
candidate receives exact-SHA foundation-policy-test/CI-integrity specialist and
independent cross-model R3 review, accountable adoption, and normal non-author plan
merge into `develop`.

### VOC-111-D01 — Select the repository profile from the exact record

The test file must own these two exact profile objects:

```json
{
  "f2_repository_local": "complete-effective",
  "f3_staging": "unresolved-held",
  "a1_authenticated_product_acceptance": "unresolved",
  "p1_plus_product_acceptance": "unresolved",
  "production": "held",
  "live_activation": "unresolved-held",
  "voc080_holds": ["VOC-080-HOLD-00", "VOC-080-HOLD-01", "VOC-080-HOLD-02"]
}
```

```json
{
  "f2_repository_local": "complete-effective",
  "f3_staging": "complete-effective-under-voc-105-evidence",
  "f3_current_evidence": "docs/operations/voc-105-f3-evidence.json",
  "a1_authenticated_product_acceptance": "unresolved",
  "p1_plus_product_acceptance": "unresolved",
  "production": "held",
  "live_activation": "unresolved-held",
  "voc080_holds": ["VOC-080-HOLD-01", "VOC-080-HOLD-02"]
}
```

A test-only `exactProfileForRecord(record)` helper must compare the complete
`record.milestone_state` to both objects with exact own-key sets, scalar types and
values, object-member order ignored, and array order preserved. It returns only
`pre-voc105` or `voc105`; zero or multiple matches throw before an assertion is made.
It must not infer the profile from `f3_staging`, a hold, the evidence pointer, a
surface marker, `repositoryRoot` location, or a default parameter.

The current living-surface test must call `inspectF2Surface(source, path,
repositoryProfile)`. Marker-removal negatives use that profile's exact required
markers and profile-specific diagnostic. Dedicated synthetic matrices below retain
coverage for the other profile even when the repository has transitioned.

### VOC-111-D02 — Inject duplicate raw keys without a fixed profile value

Add a test-only raw-source helper with this deterministic contract:

1. accept the exact parsed record, raw JSON source, and an existing
   `milestone_state` key;
2. select the exact profile through `exactProfileForRecord`;
3. read that key's value from the selected exact object and serialize it with
   `JSON.stringify`;
4. JSON-escape the requested key, locate exactly one raw key/value member using only
   JSON whitespace tolerance and that serialized active value, and fail fixture setup
   if the match count is not one;
5. insert a second occurrence of the same key immediately after that member, using a
   JSON-serialized supplied duplicate value; and
6. assert the source changed and contains exactly two raw occurrences of the selected
   key before calling the aggregate validator.

No helper may search for the literal pair
`"f3_staging": "unresolved-held"` or assume that the VOC-105 evidence pointer exists
in both profiles. Generate these one-at-a-time negatives:

- duplicate `f3_staging` from the exact pre-VOC-105 record;
- duplicate `f3_staging` from the exact VOC-105 record; and
- duplicate `f3_current_evidence` from the exact VOC-105 record.

Each must reach the existing `duplicate raw JSON key is prohibited: <key>` diagnostic
before parsed-record validation. The runtime duplicate-key scanner is unchanged.

### VOC-111-D03 — Own preserved pre-profile surface fixtures in the test

The test file must define the following exact pre-profile required-marker arrays as
committed literals. They are copied into this plan from the accepted
`c94444bc74d3ed1b5ca0aca65141d0532f70fa11` contract; tests must not import or derive
them from `DESIGNATED_F2_SURFACES`, `repositoryRoot`, the dirty VOC-105 worktree, a
branch, a PR, or a runtime diff.

#### `docs/README.md`

- `[VOC-081's F2 record](operations/voc-081-f2-evidence.md)`
- `complete stack was integrated by PR #108 and passed post-merge revalidation`
- `repository/local F2 is complete and effective`
- `F3/staging, A1/P1+ acceptance`
- `production, deployment, live activation`
- `every inherited live-action hold remain unresolved`

The last marker's source literal is exactly
`every inherited live-action hold\n  remain unresolved` before ASCII-whitespace
normalization.

#### `docs/operations/README.md`

- `active (repository/local F2 complete)`
- `complete stack was integrated by PR #108 and passed post-merge`
- `repository/local F2 is complete and effective`
- `earlier integration-pending candidate state as history`
- `does not claim F3,`
- `A1/P1+ acceptance, staging, production, deployment, or live activation`

#### `docs/operations/voc-081-f2-evidence.md`

- `This is the machine-checked active record`
- `Repository/local F2 is complete and effective`
- `## Exact integration evidence`
- `## Historical candidate state`
- `## No-live and later-gate state`
- `F3/staging, A1/P1+ acceptance, production, live`
- `remain unresolved/held`
- `` `VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held. ``
- `No deployment occurred and no deployment URL is expected.`

#### `docs/product/README.md`

- `VOC-081 supplies the contributor-verifiable F2 foundation`
- `integrated by PR #108 and passed post-merge revalidation`
- `F2 complete and effective`
- `preserving the earlier candidate state as history`
- `F3, A1/P1+ acceptance, staging, production, deployment, and live activation remain`
- `unresolved and are not implied`

#### `docs/product/12-mvp-implementation-plan.md`

- `PR #108 integrated the complete VOC-081 stack and final evidence`
- `Repository/local\nF2 is therefore complete and effective`
- `candidate-era state remains historical evidence`
- `F3 staging, A1/P1+`
- `product acceptance, production, deployment, live activation, and`
- `remain unresolved/held`
- `` `VOC-080-HOLD-00` through `HOLD-02` remain unresolved/held ``

For the four index/product surfaces, the exact synthetic pre-profile source is the
corresponding ordered literals joined with LF and terminated by LF, except that the
standalone `remain unresolved/held` marker in
`docs/product/12-mvp-implementation-plan.md` is not emitted as a separate line because
it already occurs exactly once inside that surface's final full hold marker. The F2
document source is its ordered array plus this exact plan-owned support-marker array,
also LF-joined and LF-terminated:

- `# VOC-081 F2 Repository/Local Evidence Record`
- `## Acceptance boundary`
- `## Exact task evidence`
- `## Command and CI contract`
- `## Local shape and limitations`
- `## Rollback status`
- `repository-local-f2-candidate-integration-pending`
- `Native Windows behavior is not claimed`
- `.wrangler/state/vocanova-local`
- `a8694932671ad9c44fd2a97c128b14e6089e5faf`
- `36d526bdec83e28b17aa30a6814d42b92f058ec1`
- `5383790286`
- `5385582178`
- `5383822937`
- `32612887965`
- `32634344456`
- `32612888017`
- `32612888012`
- `32634654242`
- `32634654225`
- `not-applicable-push-path-filter`
- `32634654343`
- `9b0e90fcd89469763c9874a5b0ef951e4d76149d`
- `https://github.com/KARSIFT/vocanova-platform/pull/103`
- `aae4473d1072517b40e42bbb0dc4e992c37c16b5`
- `https://github.com/KARSIFT/vocanova-platform/pull/104`
- `38d8c27b64557e8e8bc58bb05ea3c2cd858e1136`
- `https://github.com/KARSIFT/vocanova-platform/pull/106`
- `ca7596cb72128e5fa47483a65678773a6968dd79`
- `https://github.com/KARSIFT/vocanova-platform/pull/107`
- `VOC-080-HOLD-01`
- `VOC-080-HOLD-02`

Fixture setup must first prove every plan-owned pre source passes
`inspectF2Surface(source, path, "pre-voc105")`, and that the F2 document additionally
passes `inspectF2Document(source, preRecord)`. It must similarly prove the unchanged
VOC-110 plan-owned future sources pass `voc105`. Each required marker in both source
families is then removed one at a time and must fail with its profile-specific marker
diagnostic.

The plan-owned future F2-document source uses the unchanged VOC-110 future required
array, the support array above, and these four exact stable compatibility markers that
are already supplied by the pre array but remain necessary when future sources are
assembled independently: `This is the machine-checked active record`,
`Repository/local F2 is complete and effective`, `## Exact integration evidence`, and
`## Historical candidate state`. Source assembly de-duplicates exact lines and must
still prove every profile-required marker occurs exactly once.

The synthetic pre repository uses an exact clone of the accepted record with only
`milestone_state` set to the first plan-owned object and all five human sources set to
the plan-owned pre sources. The synthetic VOC-105 repository uses the second object
and the existing unchanged plan-owned future-marker construction. Neither fixture
reads expected surface text from `repositoryRoot`.

For every human surface, test both repository directions independently:

1. complete VOC-105 repository plus exactly that surface's plan-owned pre source; and
2. complete pre-VOC-105 repository plus exactly that surface's plan-owned future
   source.

Each fixture changes one surface only, must produce a diagnostic beginning with that
path, and must not pass accidentally because the mutable repository already matches
the intended replacement.

### VOC-111-D04 — Preserve all VOC-110 evidence unchanged in effect

The exact current `repositoryRoot` passes under whichever exact profile its record
selects. Independently assembled complete pre and VOC-105 repositories pass, including
both VOC-105 object-member orders. Every current test for immutable record facts,
history, external effects, current/profile keys and types, evidence pointer, required
and prohibited markers, normalization, exact history exclusion, false-claim subjects/
copulas/verbs and case variants, holds, missing surfaces, malformed JSON, raw duplicate
keys, and no-execution behavior remains present and fail closed one invariant at a
time. No assertion is deleted, skipped, weakened to “some failure,” or made conditional
on avoiding the active profile.

### VOC-111-D05 — Preserve all VOC-109 evidence unchanged in effect

The full `inspectF2Scripts()` regression tail remains unchanged in effect: current
zero-extension, exact VOC-105 one-extension, and two-extension positives; every exact
prefix omission/duplication/swap; direct F2 entry point and alias/bypass negatives;
extension name/declaration/position/uniqueness/collision/entry-point negatives; exact
terminal test; malformed package input; empty segments; prohibited shell controls;
and no-execution sentinel.

### VOC-111-D06 — Keep implementation scope exact

One implementation PR may modify only:

- `scripts/foundation/voc081-f2-evidence-policy.test.mjs`.

It must not modify `scripts/foundation/voc081-f2-evidence-policy.mjs`, `package.json`,
documentation, F2/F3 records, VOC-105/VOC-109/VOC-110 packages, workflows,
applications, packages, infrastructure, manifests, settings, secrets, Cloudflare,
dispatch/deployment, D1, traffic/DNS, production or learner data, spending, or launch
state.

### VOC-111-D07 — Verify the protected test revision

The exact implementation SHA must pass the focused test and validator, full
`ci:foundation`, workspace validation, governance, risk, changed-path, whitespace,
and disposable-worktree single-file rollback checks. A foundation-policy-test/
CI-integrity specialist and separate independent cross-model R3 verifier review the
exact SHA as non-authors. Any material review edit creates a new builder SHA requiring
fresh checks and different-actor review; a separate actor performs any merge.

### VOC-111-D08 — Observe the real VOC-105 transition

Per DOC-15 section 24.18, the accountable VOC-111 repository change owner recorded at
adoption owns a bounded window beginning at implementation merge and ending when the
first refreshed real VOC-105 candidate records PASS for both runtime validators, the
VOC-081 focused suite, `ci:foundation`, and hosted required checks. If VOC-105 is
formally abandoned or superseded first, only that governed disposition ends the
window.

The monitored signal is exact live-profile selection plus continued pass/fail behavior
for both synthetic profiles, duplicate-key negatives, both hybrid directions, all
VOC-110 negatives, and the VOC-109 tail. A recurrence of any of the three issue #206
failures, acceptance of a false/hybrid profile, loss of a protected negative, or
runtime/test disagreement is the failure trigger. The owner stops VOC-105 merge and
VOC-111 closure, records linked evidence in issue #206 or a linked bug, and routes a
separately governed correction or one-file repository revert. Observation authorizes
no live action.

## Risk and protected areas

VOC-111 is R3 because it changes the executable focused verifier for an R3 fail-closed
foundation policy and can create false confidence if weakened. It is not R4: no
runtime validator, milestone decision, governance authority, workflow, application,
data, or external system changes. Exact fixture ownership, exhaustive transition
matrices, deterministic checks, specialist review, and independent cross-model review
bound the risk.

## Security, privacy, data, and external effects

The implementation uses repository strings, JSON fixtures, and temporary directories
only. It adds no dependency, network or shell execution, credential, secret, learner
or production data, deployment, database, UI, analytics, or accessibility surface.
