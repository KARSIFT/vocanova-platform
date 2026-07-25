# VOC-026 — Release Plan

## Release and deployment authorization

No release or deployment is authorized by this draft. Merge into `develop`, staging
validation, production activation, and the DOC-12 P1 milestone gate are distinct and none is
granted here. Production and autonomous production release remain disabled. This draft is not
adopted.

## Preconditions, monitoring, and outcome

Before any staging candidate: an adopted package with `D01`/`D03`/`D04`/`D05` resolved into
`D06`, the exact base/revision, required PR checks, the adopted `D01` MVP seed-data scope and
seed, the content/user-words migration plan, non-production identities, exact-SHA independent
review, and a named rollback owner/procedure. Monitor aggregate API success/error, save/unsave
rate, read-API latency, migration and seed status, idempotency-conflict signals, CSRF-failure
rate, and health signals without bearer, secret, or personal saved-content logging. The
founder owns the R4 product/scope decisions (`D01`, `D03`, `D04`, `D05`); the future release
authority records the accountable technical/operational owner.

## Rollback

Trigger on cross-learner access, idempotency/CSRF failure, content/seed corruption, migration
integrity fault, leaked secret/token, or failed health checks. Use the approved deploy/migration
recovery procedure, preserve canonical content integrity and soft-deleted `user_words` rows,
restore compatible service/data state, validate with non-production identities, and preserve
incident/rollback evidence. The last-known-good revision is recorded at the future release
decision, not guessed here.

## Independent verification, human approvals, and closure

Claude Code must report the final SHA, evidence, limitations, findings, the active A-003
authority, and the remaining R3/R4/EHR/adoption/activation gates. Routine R3 needs strengthened
controls and independent verification; the open R4 product/scope decisions (`D01`, `D03`,
`D04`, `D05`) need founder approval before the affected tasks proceed. Closure requires all P1
task evidence, the mock-decommission inventory, and the DOC-12 P1 gate evidence; neither a
package merge nor a staging deploy alone closes the milestone, and live staging gate evidence
is blocked until the F3 staging environment exists (`VOC-026-DEP-03`).