# VOC-110 — Specification

## Objective and requirement source

[Issue #203](https://github.com/KARSIFT/vocanova-platform/issues/203) demonstrates at
exact `develop` SHA `309f1058baa041f7915fb334148d7d5b3d9b3c14` that the VOC-081
validator passes the current tree and its 18 focused tests, but rejects the preserved
VOC-105 candidate. The rejection includes `F2 and later milestone/hold states are
inaccurate`, missing pre-F3 prose markers, and `active F3/staging claim is prohibited`.

The failure is not an F2-evidence defect and not a foundation-chain defect. The
validator combines three responsibilities:

1. immutable accepted F2 facts and candidate-era history;
2. current later-milestone pointers in living surfaces; and
3. the VOC-109 `ci:foundation` command-extension policy.

Only responsibility 2 is stale. VOC-110 separates it without changing the other two
or absorbing VOC-105's independent R4 evidence decision.

## Requirements

### VOC-110-D00 — Preserve lifecycle and exact reproduction

Issue #203 is intake and diagnostic evidence, not implementation authority. The plan
binds exact base SHA `309f1058baa041f7915fb334148d7d5b3d9b3c14`, VOC-109
implementation `c44b704b16721f658ef308ca9313c809dee81631`, the passing current
validator/test baseline, and the failing preserved VOC-105 candidate. No validator
edit may begin until an exact candidate receives foundation-policy specialist and
independent cross-model R3 review, accountable adoption, and normal non-author plan
merge into `develop`.

### VOC-110-D01 — Keep immutable F2 facts and history exact

The implementation must preserve the current exact checks for:

- F2 record schema, dates, task and `repository-local-f2-complete-effective` status;
- adopted VOC-081 package path, PR, candidate SHA, and authorization facts;
- repository stack base, exact implementation/final evidence/merge SHAs, PR, task
  sequence, integration status, and no-implementer-merge/no-production-promotion facts;
- current F2 acceptance review, hosted, rollback, and post-merge evidence;
- exact workflow inventory, local platform/state contract, command results, and
  reverse-order rollback proof;
- all F2 `external_effects` fields remaining `false`;
- candidate-era pending status, effective condition, null self-referential T04 fields,
  and explanatory reason; and
- active F2 complete-effective wording, stale F2-pending rejection, historical-section
  isolation, malformed JSON, and missing designated-surface rejection.

Changing a current later-milestone pointer must never make a drifted F2 fact pass.

### VOC-110-D02 — Accept two atomic current-state profiles

The validator must model current later-milestone state separately from immutable F2
state. During the dependency transition it accepts exactly:

1. **Pre-VOC-105 profile:** the exact current baseline values and required prose,
   including F3 unresolved-held and `VOC-080-HOLD-00/01/02`; or
2. **VOC-105 profile:** the exact adopted downstream shape across every existing
   designated F2 surface, with the JSON current-state object exactly containing:
   - `f2_repository_local: complete-effective`;
   - `f3_staging: complete-effective-under-voc-105-evidence`;
   - `f3_current_evidence: docs/operations/voc-105-f3-evidence.json`;
   - A1 authenticated-product and P1+ acceptance `unresolved`;
   - production `held` and live activation `unresolved-held`; and
   - `voc080_holds` exactly `VOC-080-HOLD-01`, `VOC-080-HOLD-02`, in order.

JSON object-member order is not semantic and must not affect acceptance; the profile
requires the exact key set and values. Array order remains canonical where explicitly
listed.

For the VOC-105 profile, each existing designated human F2 surface must retain its
exact F2 integration/history/no-live facts while carrying its exact adopted current
F3 pointer plus A1/P1+, production/traffic, learner-data, launch, and HOLD-01/02
boundaries. `voc-081-f2-evidence.md` may truthfully say no F2 deployment occurred and
later evidence establishes F3; it must not rewrite the historical F2 facts.

The implementation must use this exact normalization before literal marker matching:

1. convert CRLF and lone CR to LF;
2. replace every nonempty run matching ASCII whitespace `[ \t\n\f\v]+` with one
   U+0020 space;
3. remove leading and trailing ASCII whitespace; and
4. perform no case folding, Unicode normalization, punctuation removal, Markdown/link
   rewriting, or other transformation.

Required markers must occur exactly once in the normalized surface unless a count is
stated otherwise. Prohibited markers must occur zero times. For active-claim checks on
`voc-081-f2-evidence.md`, remove only the raw section beginning with exact H2
`## Historical candidate state` and ending immediately before the next raw H2, then
normalize; no other prose is excluded.

The following literal strings—not the dirty worktree—are the plan-canonical VOC-105
profile contract.

#### `docs/README.md`

Required:

- `The current [VOC-105 record](operations/voc-105-f3-evidence.md) validates every DOC-12 gate item and reports F3 staging foundation complete-effective.`
- ``A1/P1+ acceptance, production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.``

Prohibited:

- `F3/staging, A1/P1+ acceptance, production, deployment, live activation, and every inherited live-action hold remain unresolved.`

#### `docs/operations/README.md`

Required:

- `| RECORD | [VOC-105 F3 staging-foundation evidence](voc-105-f3-evidence.md) | active (F3 complete-effective) | operator | DOC-12, VOC-105 |`
- `The separate VOC-105 record validates every DOC-12 gate item and reports F3 staging foundation complete-effective.`
- `A1/P1+ acceptance remains unresolved and separate.`
- ``Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.``
- `VOC-105 later records the exact successful delivery event as one input to the complete F3 gate decision; it performs no new live action.`

Prohibited:

- `The record preserves its earlier integration-pending candidate state as history and does not claim F3, A1/P1+ acceptance, staging, production, deployment, or live activation.`

#### `docs/operations/voc-081-f2-evidence.md`

Required:

- `This F2 record does **not by itself** claim F3 staging, A1 authenticated-product acceptance, any P1+ product milestone, production readiness, or a public launch.`
- `The later [VOC-105 record](voc-105-f3-evidence.md) validates the separate F3 gate and reports F3 staging foundation complete-effective.`
- ``A1/P1+ acceptance remains unresolved; production, learner data, and launch remain held or unresolved under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.``
- `## No-live evidence and current later-gate state`
- `No command or evidence step in this F2 record queried or mutated Cloudflare, DNS, a server, Sentry, repository settings, a secret, or production learner data.`
- `No F2 deployment occurred and no F2 deployment URL was expected.`
- `Later exact evidence in VOC-105 reports F3 staging foundation complete-effective.`
- ``A1/P1+ acceptance remains unresolved; production readiness and traffic, learner-data access, and public launch remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.``

Prohibited:

- `This record does **not** claim F3 staging, A1 authenticated-product acceptance, any P1+ product milestone, production readiness, a public launch, or a deployment.`
- `` `VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held. ``
- `## No-live and later-gate state`
- `No command or evidence step queries or mutates Cloudflare, DNS, a server, Sentry, repository settings, a secret, or production learner data.`
- `No deployment occurred and no deployment URL is expected.`
- `F3/staging, A1/P1+ acceptance, production, live activation, and every inherited VOC-080 hold remain unresolved/held.`

#### `docs/product/README.md`

Required:

- `The [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) separately validates every DOC-12 F3 gate item and reports the F3 staging foundation complete-effective.`
- `A1/P1+ acceptance remains unresolved and is a separate future outcome.`
- ``Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.``

Prohibited:

- `F3, A1/P1+ acceptance, staging, production, deployment, and live activation remain unresolved and are not implied.`

#### `docs/product/12-mvp-implementation-plan.md`

Required:

- `The current [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) validates every F3 gate item and reports the F3 staging foundation complete-effective.`
- `A1/P1+ product acceptance remains unresolved and is a separate future outcome.`
- ``Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `HOLD-02` remain held.``
- `The later exact successful delivery event is recorded separately by VOC-105 and is only one input to its F3 gate decision.`
- `` `VOC-080-HOLD-01` and `HOLD-02` remain fully unresolved and unchanged. ``
- `VOC-105's separate gate evaluation reports F3 staging foundation complete-effective; the successful delivery run alone did not establish that result.`
- `A1/P1+ acceptance remains unresolved.`
- ``Production readiness and traffic, learner-data access, and public launch remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.``

Prohibited:

- ``At their remaining action boundaries, F3 staging, A1/P1+ product acceptance, production, deployment, live activation, and `VOC-080-HOLD-00` through `HOLD-02` remain unresolved/held.``
- `F3, A1/P1+ acceptance beyond the Phase-1 resource/rollback proof, ordinary staging workflow delivery, production, and live product activation remain unresolved.`

The exact JSON profile remains the object specified above. Synthetic future-profile
fixtures must be assembled only from these plan-canonical normalized strings, the
exact JSON object, and unchanged baseline immutable-F2 strings; they must not read,
copy, import, or derive expected strings from `/tmp/vocanova-voc105-impl`, another
worktree, a branch, a pull request, or runtime repository diff. The preserved worktree
was inspection evidence only. `docs/operations/cloudflare-delivery.md` and the new
VOC-105 record remain in VOC-105's seven-surface validator, not VOC-110's F2-owned
surface set.

The profile choice is repository-wide and atomic. A pre-F3 JSON object with one F3
surface, a VOC-105 JSON object with any stale pre-F3 surface, or a partial marker set
fails. The F2 validator verifies consistency and the exact pointer only; the separate
VOC-105 validator remains solely responsible for the F3 evidence schema, gate items,
delivery event, all seven living surfaces, redaction, and the R4 milestone decision.

### VOC-110-D03 — Reject false and over-broad current claims

Independent fixtures must reject one invariant at a time. The prohibited-claim corpus
is the lossless union of the current `PROHIBITED_ACTIVE_TEXT_CLAIMS` classes/verbs and
the new `effective`/`resolved` forms:

- F3 subjects `F3`, `F3 staging`, and `staging`, each with and without `is`, crossed
  independently with `complete`, `completed`, `passed`, `accepted`, `active`,
  `released`, `enabled`, `effective`, and `resolved`;
- acceptance base identifiers `A1`, `A1/P1`, `A1/P1+`, `A1
authenticated-product`, `P1`, the newly explicit `P1+`, each of `P2` through `P5`,
  and every current optional-`-P5` expansion (`P1-P5`, `P2-P5`, `P3-P5`, `P4-P5`,
  and `P5-P5`), each independently followed by both `acceptance` and `product
acceptance`, then with and without `is`, crossed independently with `complete`,
  `completed`, `passed`, `accepted`, `active`, `effective`, and `resolved`;
- later-gate subjects `R1`, `R2`, and `L1` acceptance, with the same acceptance verbs;
- production subjects `deployment`, `production deployment`, and `production`, each
  with and without `is`, crossed independently with `complete`, `completed`, `passed`,
  `accepted`, `active`, `enabled`, `released`, `effective`, and `resolved`;
- live subjects `live activation`, `live verification`, `live system`, and `live
service`, each with and without `is`, crossed independently with `complete`,
  `completed`, `passed`, `accepted`, `active`, `enabled`, `released`, `verified`,
  `effective`, and `resolved`;
- aggregate subjects `VOC-080 hold`, `VOC-080 holds`, `all VOC-080 hold`, and `all
VOC-080 holds`, with absent copula, `are`, or `is`, and individual
  `VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and
  `VOC-080-HOLD-02`, with and without `is`, crossed independently with `released`,
  `cleared`, `lifted`, `complete`, `completed`, `passed`, `accepted`, `active`,
  `enabled`, `effective`, and `resolved`; and
- the current `Repository/local F2` pending class generated across `is`/`remains`,
  absent/`still`, and `pending`/`pending integration`/`incomplete`/`candidate`.

At least one lower- or mixed-case subject/verb fixture per class must prove matching
remains case-insensitive. Each generated fixture contains exactly one injected false
claim. Before applying this corpus, the implementation may mask only the exact
evidence-bound F3 required-marker strings listed above at their required locations;
no substring, synonym, generic `complete-effective` phrase, additional occurrence, or
worktree-derived text is allowlisted.

The remaining structural fixtures are:

- missing, extra, renamed, or wrong current milestone keys or values;
- absent, duplicated, or wrong `f3_current_evidence` pointer;
- every one-surface-at-a-time pre-F3/F3 hybrid in both directions;
- active F2 pending/incomplete/candidate wording moved outside candidate history;
- omission of HOLD-01 or HOLD-02 from the exact current profile; and
- any F2 external-effect field changed from `false`.

Historical candidate wording must remain accepted only in its designated historical
section. Diagnostics identify the profile, surface, key, claim class, hold, or
external-effect invariant. Inspection remains network-free and executes no shell.

### VOC-110-D04 — Preserve VOC-109 command-chain behavior

`inspectF2Scripts()` must remain unchanged in effect. The current zero-extension
repository, the exact VOC-105 extension pair, and two independently named/targeted
extensions pass. The existing tests for every exact-prefix omission, duplication and
adjacent swap; F2 entry-point drift/alias/bypass; malformed extension names; missing,
duplicate and misplaced declarations; wrong/direct/noncanonical/colliding entry
points; baseline collisions; malformed input; empty segments; and shell-control
syntax remain required. The eight-segment prefix and terminal test are exact.

### VOC-110-D05 — Keep implementation scope exact

One implementation PR may modify only:

- `scripts/foundation/voc081-f2-evidence-policy.mjs`; and
- `scripts/foundation/voc081-f2-evidence-policy.test.mjs`.

It must not change `package.json`, documentation, VOC-081/VOC-105/VOC-109 packages,
F2/F3 records, the preserved VOC-105 worktree, workflows, application/runtime code,
manifests, settings, secrets, Cloudflare resources, dispatch/deployment, D1,
traffic/DNS, production or learner data, spending, or launch state.

### VOC-110-D06 — Verify the protected validator independently

The exact implementation SHA must pass focused validator/tests, full foundation and
workspace validation, governance, risk, path, whitespace, and rollback checks. A
foundation-policy/CI-integrity specialist and a separate independent cross-model R3
verifier review the exact SHA as non-authors. Any material review edit creates a new
builder SHA requiring fresh checks and different-actor review. A separate non-author
performs any merge.

### VOC-110-D07 — Unblock but do not absorb VOC-105

After VOC-110 merges and post-merge checks pass, a different VOC-105 builder refreshes
the preserved candidate against corrected `develop`. VOC-105 still owns all seven
living documentation changes, its new evidence files and validator/tests, the exact
`ci:f3-evidence` package script/segment, R4 reviews, and closure. VOC-110 satisfies no
VOC-105 acceptance criterion and authorizes no VOC-105 implementation before its own
plan is effective.

### VOC-110-D08 — Observe the first real downstream integration

Per DOC-15 section 24.18, the accountable VOC-110 repository change owner recorded at
adoption owns a bounded observation period. It begins at VOC-110 implementation merge
and ends when the first refreshed real VOC-105 candidate records PASS for the focused
VOC-081 tests/validator, focused VOC-105 tests/validator, `ci:foundation`, and hosted
required checks. If VOC-105 is formally abandoned or superseded first, the window ends
only with that governed disposition record.

The monitored signal is exact VOC-105 profile acceptance with immutable F2, false-
profile, and VOC-109 extension protections still passing. Exact-profile rejection,
hybrid or false-profile acceptance, immutable F2 regression, or extension-policy
regression is the failure trigger. The owner stops VOC-105 merge and VOC-110 closure,
records linked evidence in issue #203 (or a linked bug if closed), and routes a
separately governed remediation or dependency-ordered revert. Observation authorizes
no live or external action.

## Risk and protected areas

The package is R3 because it changes a fail-closed foundation validator guarding
evidence and milestone pointers. It is not R4: the exact F3 decision is already
governed by adopted VOC-105 and its separate R4 validator/reviews; VOC-110 neither
changes that decision nor expands autonomous or action authority. A fail-open outcome
is prevented by atomic profiles, exhaustive negatives, deterministic checks,
specialist review, and independent cross-model verification.

## Security, privacy, data, analytics, and accessibility

The validator reads repository files and strings only. It uses no dependency, secret,
credential, network, shell, production or learner data, database, migration, UI,
analytics, or accessibility surface. Public SHAs/paths and synthetic fixture text are
the only evidence inputs.
