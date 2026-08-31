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
  synthetic JSON declaring one `ci:f3-evidence` script and its direct segment after
  `ci:settings-truth`, then with two distinct declared `ci:*` extensions in that same
  slot.
- Expected: all three pass; the eight-segment prefix and terminal test glob remain
  exact, every extension value is one distinct direct Node foundation-policy entry
  point, and no command is executed.
- Evidence: `VOC-109-EV-01`

## VOC-109-TEST-02 — F2 command, exact-once, alias, and bypass negatives

- Covers: `VOC-109-AC-02`
- Procedure: mutate independent fixtures with a missing direct F2 segment, duplicate
  F2 segment, drifted canonical entry point, `echo` or comment substitution, `|| true`,
  `exit 0` prefix, command suffix, and another package script that aliases either
  `pnpm run ci:f2-evidence` or the direct VOC-081 validator entry point.
- Expected: every fixture fails with the F2 exactness, direct-execution, alias, or
  no-bypass reason; textual matches do not satisfy the invariant.
- Evidence: `VOC-109-EV-02`

## VOC-109-TEST-03 — Ordering, extension, grammar, and parser negatives

- Covers: `VOC-109-AC-03`
- Procedure: independently test every original baseline segment omitted and adjacent
  baseline pairs swapped; the terminal test moved earlier; an extension placed before
  settings or after tests; unknown and duplicate extension names; two names sharing an
  entry point; an alias, compound/commented/argument-bearing extension definition;
  `ci:foundation` recursion; malformed JSON; non-string scripts; empty `&&` segments;
  semicolon, newline, redirection, backgrounding, comment, and command-substitution
  syntax.
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

## Evidence definitions

- `VOC-109-EV-00`: plan validation, exact plan reviews, adoption record, normal
  non-author plan merge, implementation path inventory, and risk result.
- `VOC-109-EV-01`: current-chain and declared-extension positive fixture results.
- `VOC-109-EV-02`: one-at-a-time F2 exactness, alias, comment, and bypass negatives.
- `VOC-109-EV-03`: one-at-a-time exact-prefix/terminal, extension
  placement/declaration/name/entrypoint, grammar, and malformed-input negatives.
- `VOC-109-EV-04`: focused/full/hosted checks, exact two-file diff, rollback proof,
  specialist and independent exact-SHA verdicts, merge, and post-merge readback.

No test may use a secret, production data, live Cloudflare or GitHub mutation,
workflow dispatch, deployment, D1 migration, or network request.
