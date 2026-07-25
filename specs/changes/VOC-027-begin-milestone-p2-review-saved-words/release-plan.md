# VOC-027 — Release Plan

## Release and deployment authorization

No release or deployment is authorized by this draft. Merge into `develop`,
staging validation, production activation, and the DOC-12 P2 milestone gate are
distinct and none is granted here. Production and autonomous production release
remain disabled. This draft is not adopted.

## Preconditions, monitoring, and outcome

Before any staging candidate: an adopted package with `D02`/`D03`/`D04`/`D05`
resolved into `D06`, the exact base/revision, required PR checks, the
`review_attempts` migration plan, the adopted prompt-type enum, non-production
identities, exact-SHA independent review, and a named rollback owner/procedure.
Monitor aggregate API success/error, due-queue and submission rate, submission
latency, migration status, idempotency-conflict signals, CSRF-failure rate,
schedule-update-count vs. submission-count parity (a divergence means a double
update or a dropped update), and health signals without bearer, secret, or
personal answer/response-time logging. The founder owns the R4 product/scope
decisions (`D02`, `D03`, `D04`, `D05`); the future release authority records the
accountable technical/operational owner. Live staging gate evidence is blocked
until the F3 staging environment exists (`VOC-027-DEP-02`).

## Rollback

Trigger on cross-learner access, idempotency failure (a duplicate schedule
update), scheduling-rule violation, migration integrity fault, leaked
secret/token, or failed health checks. Use the approved deploy/migration
recovery procedure: preserve committed immutable `review_attempts` rows (never
drop attempt history on rollback), preserve `user_words` schedule state written
before the rollback window, restore compatible service/data state, validate with
non-production identities, and preserve incident/rollback evidence. The
last-known-good revision is recorded at the future release decision, not guessed
here.

## Independent verification, human approvals, and closure

Claude Code must report the final SHA, evidence, limitations, findings, the
active A-003 authority, and the remaining R3/R4/EHR/adoption/activation gates.
Routine R3 needs strengthened controls and independent verification; the open R4
product/scope decisions (`D02` contract contradiction, `D03` prompt-type-first,
`D04` review-session UX/flow, `D05` Home due-count wiring) need founder approval
before the affected tasks proceed. Closure requires all P2 task evidence, the
mock-decommission inventory, and the DOC-12 P2 gate evidence; neither a package
merge nor a staging deploy alone closes the milestone, and live staging gate
evidence is blocked until the F3 staging environment exists (`VOC-027-DEP-02`).