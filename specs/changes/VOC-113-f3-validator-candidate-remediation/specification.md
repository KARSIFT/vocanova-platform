# VOC-113 — Specification

## Objective and authority

Issue #211 records two exact-SHA blocking findings at draft PR #209 head
`841d263c6a4fd92f0f553e0d1f2fd75bd13b1a1a`: its canonical 12-path digest is
`903e7f80bf0f9f955fe30b8dbd91ec186d979c65c37a9d46de3e0a55ff09b7b6`, not the
historical observed `7205f485...`, and the new VOC-105 validator accepts prohibited
mutations on designated surfaces. The issue, stopped PR, and reviewer findings are
intake only.

VOC-113 does not weaken VOC-111. The `7205f485...` observation remains an immutable
description of the earlier worktree contents. The `903e7f80...` digest remains the
identity of the stopped committed candidate. After reviewed adoption, the correction
produces a new exact PR head and therefore must produce a new identity under the same
fixed algorithm. Neither prior digest may be relabeled as that replacement.

## Decisions and requirements

### VOC-113-D00/D01 — Govern one replacement candidate

Use one post-adoption correction on the existing `impl/voc-105-f3-current-documentation`
branch and draft PR #209. Change only:

- `scripts/foundation/voc105-f3-evidence-policy.mjs`; and
- `scripts/foundation/voc105-f3-evidence-policy.test.mjs`.

Once the correction is formatted, committed, and otherwise stable, record the exact
head SHA, fixed 12-path inventory, each path's blob OID, and SHA-256 digest using the
unchanged VOC-111 framing: raw UTF-8 path, NUL, Git blob OID without LF, NUL. Execute
the manifest immediately before and after the bounded focused/runtime/foundation/
workspace/governance/rollback observation. Exact head, ordered paths, blob OIDs, and
digest must be identical. Any later code or content edit creates a new candidate and
requires fresh observations, hosted checks, specialist review, and independent R4
review.

PR #209 remains one coherent implementation/rollback boundary. A separate correction
PR cannot alter these new files against `develop` without duplicating the entire
VOC-105 diff, while an intermediate-base PR would split evidence and review from the
only releasable outcome. VOC-113 therefore maps its sole implementation to a corrected
revision of PR #209 after the package is adopted and merged.

### VOC-113-D02 — Exact designated current-truth corpus

The validator must load and inspect these nine files independently:

1. `docs/README.md`
2. `docs/operations/README.md`
3. `docs/operations/cloudflare-delivery.md`
4. `docs/operations/voc-081-f2-evidence.json`
5. `docs/operations/voc-081-f2-evidence.md`
6. `docs/operations/voc-105-f3-evidence.json`
7. `docs/operations/voc-105-f3-evidence.md`
8. `docs/product/12-mvp-implementation-plan.md`
9. `docs/product/README.md`

Every cross-cutting rule below runs against every file separately and names the path
in its diagnostic. The record also retains its structured schema checks. Missing or
unreadable files fail closed. No surface is exempt because it is JSON, an index, a
delivery procedure, or historical/current mixed prose.

### VOC-113-D03 — Disclosure and allowed vocabulary

On every designated file:

- reject RFC-4122-shaped UUIDs representing protected immutable Worker versions;
- reject token, secret, password, private-key, API-key, access-token, account-ID, or
  credential values expressed as assignments, JSON/YAML-like fields, environment
  bindings, or prose-labelled literal values;
- recognize credential-like uppercase identifiers ending in or containing
  `SECRET`, `TOKEN`, `PASSWORD`, `PRIVATE_KEY`, `API_KEY`, or `ACCOUNT_ID`; allow only
  the names `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`; and
- allow those two names only as value-free interface vocabulary. A reference to a
  redaction or to the absence/existence of the name is not authority to include its
  value.

Focused tests use inert synthetic strings and UUIDs only. They must not read an
environment variable or actual credential.

### VOC-113-D04 — No live or later-boundary promotion

Every designated file must reject a direct imperative instruction to dispatch,
deploy, migrate, promote, upload/publish, rotate/install/create/delete a credential,
mutate settings/resources/traffic/DNS, activate production, or launch. Test the verbs
with `now`, staging/production targets, and direct imperative punctuation, including
the reported `Deploy now.` form.

Every file must also reject positive, complete, accepted, effective, ready, active,
enabled, released, resolved, verified, approved, or authorized claims for:

- A1, authenticated A1, P1/P1+, P2-P5, R1/R2/L1, and aggregate product acceptance;
- production readiness, production traffic, production deployment, or production;
- live activation, live verification, live system, or live service;
- public launch; and
- learner-data/learner data access, use, import, export, transform, or deletion.

Exact current F3 complete-effective language is allowed only with the VOC-105 evidence
boundary. Exact unresolved/held/skipped/prohibited/no-action language remains allowed.
`VOC-080-HOLD-01` and `VOC-080-HOLD-02` must remain held.

### VOC-113-D05 — Historical snapshots cannot become current truth

VOC-094 through VOC-104 may be cited only as immutable historical evidence. A sentence
or structured value that presents any of their prospective pending/held status as
`current`, `now`, `still`, `remains`, or the active repository status must fail. Mixed
historical/current surfaces must explicitly preserve both facts: the older package is
historical/immutable, and later exact evidence supersedes only its prospective F3
pending wording. Tests exercise every package number and both current-as-history and
history-as-current directions without changing historical package files.

### VOC-113-D06 — Exact structured event and rollback contract

The JSON record must use exact own-key sets at every governed object. Unknown, extra,
missing, renamed, or duplicate raw keys fail. Scalars have exact types and values;
arrays have exact membership/order and no duplicates. The nine gate items occur once
each with exact status and evidence link.

The delivery event must contain exact workflow, run, attempt, SHA, URL, required,
delivery-gate, staging-job, steps, and production-job keys. `required`,
`delivery_gate`, and `staging_job` equal `success`. Each of migration, immutable
upload, exact promotion, bounded smoke, and sanitized outcome equals `success`.
Rollback-after-promotion-failure equals `skipped-expected`; production equals
`skipped-held`. For every field/step, independently reject omission, rename, wrong
type, `failed`, unexpected `skipped`, `unknown`, and an extra status/key.

The `rollback-baseline-and-rehearsal` gate item must exist exactly once with status
`validated` and the exact adopted evidence link. Independently reject its omission,
wrong/absent evidence, and nonvalidated/unknown status. Delivery rollback outcome and
gate-level rollback proof are distinct and both mandatory.

### VOC-113-D07/D08 — Evidence and independent verification

Retain every existing focused positive/negative unchanged in effect and add complete
one-mutation-at-a-time matrices. Fixture setup copies the complete candidate corpus,
changes exactly one governed file/field, asserts the intended mutation occurred and
other snapshots remained unchanged, and then requires the intended path/field-specific
diagnostic rather than an unrelated failure.

At the final exact head run both VOC-081/VOC-105 validators and focused tests,
`ci:foundation`, `pnpm validate`, governance validation, risk classification, diff/
path/format checks, hosted required checks, and a disposable full-PR rollback to
`533084432f0672dbf25c402e96209120a8ad50cf`. Obtain fresh exact-head canonical-
documentation/milestone-evidence specialist and independent cross-model R4 PASS
verdicts from different non-authors. A separate non-author may merge only after every
blocker is resolved and the body/binder truthfully reports the replacement evidence.

## Non-goals and prohibited authority

Do not change documents/evidence, package scripts, VOC-081/VOC-110/VOC-111 code or
packages, applications, workflows, infrastructure, historical change packages,
settings, secrets, resources, DNS/traffic, data, or `main`. Do not query Cloudflare or
GitHub settings, dispatch, deploy, migrate D1, access production/learner data, spend,
launch, or close issues. Repository plan or implementation merge grants none of those
authorities.
