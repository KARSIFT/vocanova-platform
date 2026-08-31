# VOC-105 — Specification

## Objective and requirement source

Reconcile the active repository documentation and machine-readable milestone record
by evaluating the current F3 staging-foundation evidence against every DOC-12 gate
element. The successful staging run is an input to that decision, not a pre-decided
milestone result. The intake is
[issue #189](https://github.com/KARSIFT/vocanova-platform/issues/189).
Issue #189 is planning evidence only; it grants no implementation, settings, secret,
Cloudflare, dispatch, production, data, spending, DNS, or launch authority.

The current record must bind, without secret values or protected Worker version IDs:

- F2's exact accepted foundation at PR #108;
- VOC-094 Phase 1's exact synthetic staging resource, observability, migration, and
  rollback evidence and Phase 2's sanitized Ruflo closure;
- VOC-100 PR1/PR2 and VOC-101's exact standard environment/settings truth; and
- the successful environment-reviewed delivery at merge SHA
  `03528a84988ebe664207c6a439e133070627c92a`, CI run
  [`33386240492`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33386240492),
  attempt 1.

## Decisions and requirements

### VOC-105-D00 — F3 status is evidence-bound

The implementation must add one current F3 evidence record that distinguishes the
successful exact delivery event from the complete milestone decision. It may state
`f3-staging-foundation-complete-effective` only when the record binds the F2
dependency, isolated resources, privacy-safe observability, compatible migrations,
exact-version delivery, smoke/verification, rollback baseline and rehearsal, standard
environment protection, and successful current delivery. A successful delivery run
alone is not sufficient evidence for a milestone claim.

If any listed gate item cannot be verified from the immutable records, the active
status must remain `f3-staging-foundation-partial-or-pending` and identify the missing
evidence; the implementation must not silently promote the milestone. Current
evidence is expected to satisfy the listed items, but the validator must check rather
than trust prose.

### VOC-105-D01 — Reconcile every active F3 surface

Update the active documentation surfaces that currently say F3/staging is unresolved:
`docs/README.md`, `docs/product/README.md`, `docs/product/12-mvp-implementation-plan.md`,
`docs/operations/README.md`, and the current-state portions of
`docs/operations/voc-081-f2-evidence.{md,json}`. Extend
`docs/operations/cloudflare-delivery.md` with the latest sanitized successful delivery
record while preserving its settings snapshot, delivery procedure, and production
holds. Keep exact run/SHA/PR links and status language; do not copy secrets, token
values, or immutable Worker version UUIDs.

The documents must say that F3 staging-foundation acceptance is complete-effective
only under VOC-105's evidence record, while A1/P1+ acceptance, production readiness,
production traffic, public launch, and learner-data access remain unresolved or held.
The separate A1 implementation intake requested by issue #189 is explicitly deferred
to a later dependency-ordered package and is not included here.

### VOC-105-D02 — Preserve historical package boundaries

Do not edit VOC-094 through VOC-104 change packages, their acceptance results, or
historical evidence. Their pending/held statements remain historical snapshots where
applicable. The new active record must explain that later exact evidence supersedes
their prospective pending state without rewriting it. F3 completion does not release
`VOC-080-HOLD-01` or `VOC-080-HOLD-02`, and it does not authorize future staging
dispatches, resource mutation, settings mutation, or production action.

### VOC-105-D03 — Add fail-closed machine validation

Add `scripts/foundation/voc105-f3-evidence-policy.mjs` and focused tests, plus a
`ci:f3-evidence` command included exactly once in `ci:foundation`. The validator must
check the evidence schema, exact immutable identifiers and linked prior records,
successful run/job/step outcomes, current-versus-historical language, all designated
active surfaces, A1/later-gate exclusions, and the two inherited holds. Negative
fixtures must reject a wrong SHA/run, failed or skipped migration/promotion/smoke,
missing rollback/observability/resource proof, stale unresolved active wording,
secret/Worker-ID disclosure, a later-milestone claim, or a hold-release claim.

### VOC-105-D04 — Repository-only and one coherent PR

Use one minimum-sufficient task and one coherent implementation PR into `develop`.
The PR may change documentation, the structured evidence record, validator/tests,
`package.json`'s foundation command chain, and no other paths. It must not query or
mutate Cloudflare/GitHub settings, create or rotate secrets, dispatch workflows,
deploy, migrate, change traffic/DNS, access production or learner data, spend money,
promote `main`, or claim to satisfy or close issue #189; the issue's separate A1
planning outcome remains outside this package.

### VOC-105-D05 — Independent exact-revision review

The plan and implementation require applicable deterministic checks, a distinct
canonical-documentation/milestone-evidence specialist review, and independent R4
exact-SHA verification by different non-author actors. No risk label creates standing
founder or technical-steward approval. A plan merge or implementation merge changes
repository history only.

## Scope and non-goals

In scope are the active documentation reconciliation, the new current F3 evidence
record, its network-free validator and fixtures, and foundation-command registration.
The delivery run is cited as immutable evidence, not rerun by this package. The A1
authentication/user-foundation intake is a separate future package. Product/runtime,
API/schema, workflow behavior, infrastructure manifests, settings, credentials,
Cloudflare resources, DNS, deployment, production, live-data, and launch changes are
out of scope.

## Risk and protected areas

The semantic risk is R4: an incorrect milestone record can bypass dependency ordering
or incorrectly block product work. Protected areas are DOC-12 milestone truth, active
operations indexes, F2/F3 evidence records, staging-delivery authority boundaries,
production holds, and secret/identifier redaction. The validator's integrity effect is
R3, but the package remains R4 because the consequence is milestone eligibility.

## Security, privacy, data, analytics, and accessibility

No learner data, production data, secret, token value, protected Worker version UUID,
Cloudflare credential, or live endpoint response may enter the repository. Only public
issue/PR/run identifiers, sanitized statuses, SHA values, resource names already in
the public contract, and evidence-comment links are allowed. There is no application,
schema, migration, analytics, UI, or accessibility change.

## Actors, authority, and closure

The package builder, specialist, independent verifier, implementation builder, and
merge actor must be distinct attributable actors; exact-SHA authorship independence is
required. GitHub Actions supplies deterministic evidence and read-only eligibility
reporting only. `automatic_merge_allowed: true` is package metadata, not an automatic
merge or authority grant. VOC-105 may be recorded complete only after the
implementation merge, post-merge validation, exact-review evidence, and a final
active-record readback are attached by an accountable operator. Issue #189 also
requests a separate A1 planning outcome, so VOC-105 alone does not satisfy or close
that issue; plan adoption does not close it.
