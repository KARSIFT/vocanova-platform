# VOC-109 — Test Plan

## VOC-109-TEST-00 — Governance, authority, and exact scope

- Covers: `VOC-109-AC-00`
- Procedure: validate package structure, lifecycle, R3 classification, explicit
  `automatic_merge_allowed: true` decision, two-file implementation inventory,
  one-task/one-PR shape, downstream VOC-105 boundary, and external-action exclusions.
- Expected: the draft grants no implementation authority; after adoption only the
  two declared validator/test paths may change.
- Evidence: `VOC-109-EV-00`

## VOC-109-TEST-01 — Current and governed-extension positives

- Covers: `VOC-109-AC-01`
- Procedure: call `inspectF2Scripts()` with the exact current package JSON, then with
  synthetic JSON declaring package script `ci:f3-evidence` exactly as
  `node scripts/foundation/voc105-f3-evidence-policy.mjs` and adding exactly one
  `pnpm run ci:f3-evidence` segment after `ci:settings-truth`, then with two distinct
  declared `ci:*` extensions in that same slot. Assert independently canonical
  command identifiers and target basenames need not be identical.
- Expected: all three pass; the eight-segment prefix and terminal test glob remain
  exact, every extension value is one distinct direct Node foundation-policy entry
  point, and no command is executed.
- Evidence: `VOC-109-EV-01`

## VOC-109-TEST-02 — F2 command, exact-once, alias, and bypass negatives

- Covers: `VOC-109-AC-02`
- Procedure: mutate independent fixtures with a missing direct F2 segment, duplicate
  F2 segment, and a table that separately omits then duplicates each of the other
  seven original prefix segments. Separately mutate the canonical F2 entry point,
  `echo` or comment substitution, `|| true`, `exit 0` prefix, command suffix, and
  another package script that aliases either `pnpm run ci:f2-evidence` or the direct
  VOC-081 validator entry point.
- Expected: every one-at-a-time fixture fails with the relevant prefix uniqueness, F2
  exactness, direct-execution, alias, or no-bypass reason; textual matches do not
  satisfy the invariant.
- Evidence: `VOC-109-EV-02`

## VOC-109-TEST-03 — Ordering, extension, grammar, and parser negatives

- Covers: `VOC-109-AC-03`
- Procedure: independently test every original baseline segment omitted and adjacent
  baseline pairs swapped; the terminal test moved earlier; an extension placed before
  settings or after tests; unknown and duplicate extension names; uppercase,
  underscore, empty, leading-hyphen, trailing-hyphen, and doubled-hyphen names; two
  names sharing an entry point; targets outside `scripts/foundation`, with `.js` or
  another wrong suffix, missing `-policy`, uppercase/underscore/empty-token, or other
  noncanonical basenames; one-at-a-time reuse of each non-F2 baseline package-script
  name and each corresponding entry point; an alias, compound/commented/
  argument-bearing definition; `ci:foundation` recursion; malformed JSON; non-string
  scripts; empty `&&` segments; semicolon, newline, redirection, backgrounding,
  comment, and command-substitution syntax.
- Expected: every mutation fails with a concrete invariant-specific diagnostic and no
  shell or network process starts.
- Evidence: `VOC-109-EV-03`

## VOC-109-TEST-04 — Full regression, exact revision, and rollback

- Covers: `VOC-109-AC-00`, `VOC-109-AC-04`
- Procedure: run the focused test and validator, `ci:foundation`, `pnpm validate`,
  governance validation, risk classification, `git diff --check`, exact path audit,
  and a disposable-worktree revert comparison. Bind hosted checks plus distinct
  foundation-policy specialist and independent cross-model R3 reviews to the exact
  implementation SHA.
- Expected: all checks pass; exactly two approved files differ; current F2 evidence
  remains valid; rollback restores the pre-change tree; reviewers report zero
  unresolved blockers and a separate non-author performs any merge.
- Evidence: `VOC-109-EV-04`

## VOC-109-TEST-05 — Bounded first-real-integration observation

- Covers: `VOC-109-AC-05`
- Procedure: after VOC-109 implementation merge, the accountable VOC-109 repository
  change owner records the first real VOC-105 integration candidate's exact package
  declaration and chain segment plus focused-validator, `ci:foundation`, and hosted
  required-check results. If VOC-105 is governed as abandoned or superseded first,
  record that disposition instead.
- Expected: the exact real fixture passes while the current F2/foundation chain
  remains green. Exact-fixture rejection, malformed/collision/bypass acceptance, or
  F2/foundation regression stops VOC-105 merge and VOC-109 closure and records a
  linked defect for separately governed remediation or dependency-ordered revert.
- Evidence: `VOC-109-EV-05`

## Evidence definitions

- `VOC-109-EV-00`: plan validation, exact plan reviews, adoption record, normal
  non-author plan merge, implementation path inventory, and risk result.
- `VOC-109-EV-01`: current-chain results and the exact positive fixture binding
  `ci:f3-evidence` to `node scripts/foundation/voc105-f3-evidence-policy.mjs` while
  adding only `pnpm run ci:f3-evidence`, plus an independent-identifier positive.
- `VOC-109-EV-02`: one-at-a-time omission and duplication of all eight prefix
  segments plus F2 exactness, alias, comment, and bypass negatives.
- `VOC-109-EV-03`: one-at-a-time exact-prefix/terminal, every malformed extension
  name and target class, every non-F2 baseline name/entrypoint collision, extension
  placement/declaration/uniqueness, grammar, and malformed-input negatives.
- `VOC-109-EV-04`: focused/full/hosted checks, exact two-file diff, rollback proof,
  specialist and independent exact-SHA verdicts, merge, and post-merge readback.
- `VOC-109-EV-05`: accountable-owner record for the bounded first real VOC-105
  integration observation or governed alternate disposition, including monitored
  results and any triggered stop/remediation outcome.

No test may use a secret, production data, live Cloudflare or GitHub mutation,
workflow dispatch, deployment, D1 migration, or network request.
