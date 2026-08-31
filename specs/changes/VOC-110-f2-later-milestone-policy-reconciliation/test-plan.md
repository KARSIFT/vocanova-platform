# VOC-110 — Test Plan

## VOC-110-TEST-00 — Governance, reproduction, and exact scope

- Covers: `VOC-110-AC-00`
- Procedure: validate package structure, draft lifecycle, semantic R3 classification,
  explicit `automatic_merge_allowed: true`, one-task/one-PR shape, exact two-file
  implementation inventory, VOC-105/VOC-109 dependency boundaries, and external-
  action exclusions. At the exact base, record current validator/focused-test PASS and
  the preserved VOC-105 candidate's nonempty issue #203 rejection.
- Expected: the draft grants no implementation authority; the defect reproduces
  without editing either worktree; after adoption only the two declared paths may
  change.
- Evidence: `VOC-110-EV-00`

## VOC-110-TEST-01 — Immutable F2 and history regression matrix

- Covers: `VOC-110-AC-01`
- Procedure: retain the current repository positive. Independently delete or alter
  each protected schema/date/task/status field; adopted package field; stack SHA/PR/
  integration field; current-acceptance evidence field; workflow item; local-contract
  field; T00-T03 task item/order/SHA/PR/evidence/result; validated command/result;
  rollback field; F2 active marker; candidate-history status/condition/null closure
  field/reason; and every external-effect false field. Separately test malformed JSON,
  each missing designated surface, active F2 pending/incomplete/candidate wording,
  and history presented as current.
- Expected: the exact current F2 evidence passes; every one-at-a-time mutation fails
  with its immutable F2, history, surface, parse, or external-effect diagnostic.
- Evidence: `VOC-110-EV-01`

## VOC-110-TEST-02 — Exact atomic profile positives

- Covers: `VOC-110-AC-02`
- Procedure: validate the exact current pre-VOC-105 tree. Then construct a synthetic
  repository fixture from only the specification's literal plan-canonical required/
  prohibited marker strings, unchanged baseline immutable-F2 strings, exact CR/LF and
  ASCII-whitespace normalization rules, and exact milestone JSON object; never read
  expected text from the preserved VOC-105 worktree or another mutable source. Require
  each required normalized marker exactly once and each prohibited marker zero times
  on every existing designated F2 surface. The JSON profile is: F2
  complete-effective; F3 complete-effective under the exact VOC-105 evidence path;
  A1/P1+ unresolved; production held; live unresolved-held; HOLD-01/02 exact. Repeat
  the two JSON positives with object members reordered while retaining exact keys,
  values, and ordered arrays.
- Expected: both complete repository-wide profiles pass, all immutable F2 evidence is
  identical, and the F2 validator makes no independent claim that the VOC-105 R4
  evidence itself passed.
- Evidence: `VOC-110-EV-02`

## VOC-110-TEST-03 — Profile, later-gate, hold, and no-live negatives

- Covers: `VOC-110-AC-03`
- Procedure: mutate one invariant per fixture:
  - for each milestone key, omit it, rename it, change its value, add an unknown key,
    or change its type; separately omit, duplicate, or change the VOC-105 evidence
    pointer;
  - for every existing designated F2 surface, combine that surface's pre-F3 form with
    all other VOC-105 surfaces, then its VOC-105 form with all other pre-F3 surfaces;
  - generate separate F3 fixtures for `F3`, `F3 staging`, and `staging`, with and
    without `is`, crossed with complete/completed/passed/accepted/active/released/
    enabled/effective/resolved;
  - generate separate acceptance fixtures for A1, A1/P1, A1/P1+, authenticated A1,
    P1, P1+, each P2-P5, and every current optional-`-P5` expansion (P1-P5 through
    P5-P5), each with both acceptance and product-acceptance forms, plus R1/R2/L1;
    use with/without `is` and cross with complete/completed/passed/accepted/active/
    effective/resolved;
  - generate separate deployment/production fixtures for deployment, production
    deployment, and production, with and without `is`, crossed with every existing
    complete/completed/passed/accepted/active/enabled/released verb plus effective/
    resolved;
  - generate separate live fixtures for activation, verification, system, and service,
    with and without `is`, crossed with every existing complete/completed/passed/
    accepted/active/enabled/released/verified verb plus effective/resolved;
  - generate separate singular/plural aggregate/all VOC-080 hold(s) and individual
    HOLD-00/01/02 fixtures with absent, `are`, and `is` aggregate copulas and absent/
    `is` individual copulas, crossed with
    released/cleared/lifted/complete/completed/passed/accepted/active/enabled/
    effective/resolved;
  - generate current `Repository/local F2` pending/pending-integration/incomplete/
    candidate fixtures across is/remains and absent/still, add one mixed/lower-case fixture per claim
    class, and assert that only exact canonical VOC-105 required F3 strings at exact
    locations are masked;
  - on each of the five human surfaces, append exactly one claim using the canonical
    subjects `product acceptance`, `production readiness`, `production traffic`,
    `learner-data access`, `learner data access`, or `public launch`; cross each
    subject with absent/`is` copula and complete/completed/passed/accepted/active/
    enabled/released/verified/effective/resolved, and add a lower/mixed-case fixture
    for each of the five subject classes;
  - independently omit HOLD-01 then HOLD-02; and
  - independently flip every F2 external-effect field to true.
- Expected: every mutation fails with a profile-, surface-, pointer-, claim-, hold-, or
  external-effect-specific diagnostic; historical candidate wording remains allowed
  only in its historical section; no shell or network process starts.
- Evidence: `VOC-110-EV-03`

## VOC-110-TEST-04 — VOC-109 command-chain regression

- Covers: `VOC-110-AC-04`
- Procedure: retain the full active `inspectF2Scripts()` matrix: current zero-
  extension, exact VOC-105 pair, and two-extension positives; every eight-prefix
  omission/duplication and adjacent swap; F2 segment/entry-point/alias/bypass drift;
  malformed extension name classes; unknown/duplicate/misplaced names; wrong,
  noncanonical, argument-bearing, compound, commented, colliding, or duplicate entry
  points; baseline name/entry-point collisions; malformed JSON/scripts; empty
  segments; and every prohibited shell-control form plus the no-execution sentinel.
- Expected: positives pass; every existing negative remains fail closed with its
  invariant-specific diagnostic; command parsing executes nothing.
- Evidence: `VOC-110-EV-04`

## VOC-110-TEST-05 — Full regression, exact revision, and rollback

- Covers: `VOC-110-AC-00`, `VOC-110-AC-05`
- Procedure: run the focused test/validator, `ci:foundation`, `pnpm validate`,
  governance validation, risk classification, `git diff --check`, exact path audit,
  and disposable-worktree revert comparison. Bind hosted checks plus distinct
  foundation-policy specialist and independent cross-model R3 reviews to the exact
  implementation SHA.
- Expected: all checks pass; exactly two approved files differ; rollback restores the
  pre-change tree; reviewers report no unresolved blockers; a separate non-author
  performs any merge.
- Evidence: `VOC-110-EV-05`

## VOC-110-TEST-06 — Bounded first-real-integration observation

- Covers: `VOC-110-AC-06`
- Procedure: after VOC-110 implementation merge, the accountable owner records the
  first refreshed real VOC-105 candidate's focused VOC-081 validator/tests, focused
  VOC-105 validator/tests, `ci:foundation`, and hosted required checks. If VOC-105 is
  governed as abandoned or superseded first, record that disposition instead.
- Expected: the exact real profile passes while immutable F2, false/hybrid profile,
  and VOC-109 extension protections remain green. Any failure stops VOC-105 merge and
  VOC-110 closure and records a linked defect for separately governed remediation or
  dependency-ordered revert.
- Evidence: `VOC-110-EV-06`

## Evidence definitions

- `VOC-110-EV-00`: exact baseline/reproduction output, plan validation, path inventory,
  plan reviews, adoption, and normal non-author plan merge.
- `VOC-110-EV-01`: immutable F2/history/surface/external-effect positive and one-at-a-
  time negative results.
- `VOC-110-EV-02`: exact pre-VOC-105 and full adopted VOC-105 profile positives built
  only from literal plan-canonical normalized markers and the exact JSON object.
- `VOC-110-EV-03`: exact profile key/value/pointer, every-surface normalized marker and
  hybrid, lossless current-plus-effective/resolved claim matrix, every-surface generic
  product/production/data/launch subject matrix, hold, no-live, and no-execution
  negatives, each injected one invariant at a time.
- `VOC-110-EV-04`: complete unchanged-in-effect VOC-109 command-chain matrix results.
- `VOC-110-EV-05`: focused/full/hosted checks, exact two-file diff, rollback proof,
  specialist and independent exact-SHA verdicts, merge, and post-merge readback.
- `VOC-110-EV-06`: accountable-owner bounded observation record, monitored results,
  and any triggered stop/remediation or governed alternate disposition.

No test may use a secret, production data, live Cloudflare or GitHub mutation,
workflow dispatch, deployment, D1 migration, Wrangler, or a network request.
