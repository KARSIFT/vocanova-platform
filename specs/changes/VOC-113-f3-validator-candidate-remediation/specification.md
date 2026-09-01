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
head SHA and tree, fixed 12-path inventory, each path's HEAD blob OID, and SHA-256
digest using the unchanged VOC-111 framing: raw UTF-8 path, NUL, Git blob OID without
LF, NUL. Immediately before both the pre-validation and post-validation observations,
require `git status --porcelain=v1` empty, `git diff --quiet HEAD --` and
`git diff --cached --quiet HEAD --`, and for every path require
`git hash-object "$f"` equals `git rev-parse "HEAD:$f"`. Only then emit the manifest.
Exact head/tree, ordered paths, HEAD/working-file OIDs, and digest must be identical.
Any later code/content edit or dirty/untracked state creates or obscures a candidate
and requires a clean new observation, hosted checks, specialist review, and independent
R4 review.

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

### VOC-113-D03 — Context-bound disclosure and public identifiers

Do not use a blanket UUID, account-ID, or identifier ban. On the eight non-delivery
surfaces, reject every credential value and resource-shaped account/zone/UUID value.
On `docs/operations/cloudflare-delivery.md`, permit only these already-public values,
only under their existing exact resource labels and canonical settings/resource tuple
paragraphs or table cells:

- account `0a9eda28b96d77c24dcde74f3e074d47`;
- zone `63286d93b5f32925ac7366b4e97908be`; and
- D1 `22ae386f-e3f5-4d98-a3ad-18b39d3b8556`.

Moving one to another label/section, placing it on another surface, or introducing an
unknown account/zone/UUID fails. Every other UUID-shaped value is rejected as an
unknown/protected identifier, including synthetic immutable Worker-version UUIDs.

Across all nine files, `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` are the only
credential-like uppercase names and are allowed only as value-free interface names.
Reject any actual/synthetic token, secret, password, private-key, API-key, access-token,
or credential value and every unknown `*_SECRET`, `*_TOKEN`, `*_PASSWORD`,
`*_PRIVATE_KEY`, `*_API_KEY`, or `*_ACCOUNT_ID` name. The public account identifier in
its exact prose/resource context is not a secret value. Tests use inert literals and
never inspect an environment variable or credential.

### VOC-113-D04 — Authority-bounded procedure and later-boundary model

Do not reject all operational verbs. The delivery document is intentionally a
conditional runbook. It must retain these canonical positive regions with their exact
guards and boundaries:

- the `VOC-101-STAGING-CREDENTIAL-POLICY-BEGIN`/`END` block, including conditional
  remove-secret, cancel, retry, revoke, restore, and verify language;
- `Standard manual staging delivery after settings action`, including separately
  authorized/reviewed dispatch, migration, immutable upload, exact promotion, bounded
  smoke, and rollback sequencing; and
- `Cancellation, failure, and rollback`, including conditional stop/restore behavior.

Acceptance requires the procedure to remain at this exact path and anchored region,
with its existing conditional (`if`, `when`, `only then`, failure case), separate-
authority/review, held-production, no-secret-logging, and stop/rollback guards as
applicable. Removing a guard, relocating a clause, changing a conditional to an
unconditional command, or appending `Deploy now.`, `Retry deployment.`, `Promote to
production.`, or another live imperative anywhere fails with a path/action-context
diagnostic. All eight other surfaces reject appended live instructions; past-tense
sanitized event descriptions and explicit no-action statements remain valid.

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

### VOC-113-D05 — Narrow historical/current transition

VOC-094 through VOC-104 remain immutable history, but not every held fact from them is
superseded. Reject only their prospective F3/staging `pending`, `unresolved`, or
not-yet-delivered language when it is presented as current/now/still/remains/active
repository truth. Mixed history/current surfaces must say that the older F3 statement
is historical/immutable and later exact VOC-105 evidence supersedes only that
prospective F3 status.

Current production traffic/readiness and learner-data held truth, plus
`VOC-080-HOLD-01` and `VOC-080-HOLD-02`, remains canonical even when its lineage is
described in VOC-094 through VOC-104 history. Positives must cover `production remains
held`, `learner data remains held`, and both holds remain held beside historical
package citations. Tests must not reject those statements or require false
supersession of them.

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
path/format checks, hosted required checks, and a disposable scoped reversal of the 12
PR paths to their historical `533084432f0672dbf25c402e96209120a8ad50cf` content.
That rehearsal is not a claim about the future merge first parent. Obtain fresh exact-head canonical-
documentation/milestone-evidence specialist and independent cross-model R4 PASS
verdicts from different non-authors. A separate non-author may merge only after every
blocker is resolved and the body/binder truthfully reports the replacement evidence.

### VOC-113-D10 — DOC-15 section 24.18 post-merge monitoring

The accountable repository change owner recorded at adoption owns a bounded window
beginning when corrected PR #209 merges and ending only when CI, Governance, and
Security required checks complete for that exact merge SHA and a fresh
`origin/develop` checkout at the same SHA passes both runtime validators, both focused
suites, `ci:foundation`, and governance validation. Monitored signals also include the
canonical public-ID and bounded-procedure positives and every-surface disclosure/live/
later/history plus structured delivery/rollback negatives.

Success is every signal passing at the exact merge SHA with no issue #211 recurrence.
Any hosted/readback failure, false acceptance, canonical-positive rejection, or
evidence/SHA mismatch stops issue #211/#203/#206 closure and VOC-106 release. The owner
posts exact SHA, run links, commands, and results to issue #211. On failure, append the
evidence there (or open a linked plain bug if it is already closed) and route a
separately governed correction or a full integrated PR #209 revert. A full revert
restores PR #209's actual then-current first parent—including adopted VOC-113—not the
older historical base. Monitoring grants no external authority.

## Non-goals and prohibited authority

Do not change documents/evidence, package scripts, VOC-081/VOC-110/VOC-111 code or
packages, applications, workflows, infrastructure, historical change packages,
settings, secrets, resources, DNS/traffic, data, or `main`. Do not query Cloudflare or
GitHub settings, dispatch, deploy, migrate D1, access production/learner data, spend,
launch, or close issues. Repository plan or implementation merge grants none of those
authorities.
