# VOC-028 — Release Plan

## Release and deployment authorization

No release or deployment is authorized by this draft. Merge into `develop`,
staging validation, protected provider evaluation, production activation, and
the DOC-12 P3 milestone gate are distinct and none is granted here. Production
and autonomous production release remain disabled. The production-provider PR
(T02) additionally cannot be accepted until `D02` (provider candidates
evaluated per DOC-09 §18 and privacy settings verified per §21, with the
choice + config recorded) is resolved. This draft is not adopted and selects
no concrete commercial provider/model or credentials.

## Preconditions, monitoring, and outcome

Before any staging candidate: an adopted package with `D01`–`D05` resolved into
`D06`, the exact base/revision, required PR checks, the
`learner_sentences`/`ai_feedback_attempts` migration plan, the adopted
provider/model + privacy config (`D02`), non-production identities, the
evaluation dataset + golden set, exact-SHA independent review, a named rollback
owner/procedure, and a privacy/retention review plan (`D04`). Monitor aggregate
API success/error, validation-rejection rate, moderation outcomes, provider
failure/timeout/schema-failure/repair rates, latency percentiles, usage/cost,
dedup rate, report rate, status distribution, mission-stub behavior, and
health signals — grouped by prompt version/schema version/provider/model/
release, **never** including learner text in labels (DOC-09 §20). The founder
owns the R4 product/scope/privacy/vendor/cost decisions (`D02`, `D03`, `D04`,
`D05`); the future release authority records the accountable
technical/operational owner. Live staging gate evidence is blocked until the F3
staging environment exists (`VOC-028-DEP-04`); protected live-model evaluation
is blocked until `D02` (`VOC-028-DEP-02`/`DEP-05`).

## Rollback

Trigger on unsafe feedback reaching learners, suspected cross-user exposure,
prompt injection revealing protected information, a material increase in wrong
corrections, a spike in learner reports, schema failures exceeding threshold,
unusable latency, cost overrun, inconsistent mission state, incorrect provider
privacy configuration, or a serious provider outage/breaking change (DOC-09 §25).
Use the approved deploy/migration recovery procedure: preserve committed
immutable `ai_feedback_attempts` rows (never drop feedback history on
rollback), preserve committed `learner_sentences` content, keep stored
feedback readable if AI generation is disabled, restore compatible service/data
state, validate with non-production identities, and preserve
incident/rollback evidence. The last-known-good revision is recorded at the
future release decision, not guessed here.

## Independent verification, human approvals, and closure

Claude Code must report the final SHA, evidence, limitations, findings, the
active A-003 authority, and the remaining R3/R4/EHR/adoption/activation gates.
Routine R3 needs strengthened controls and independent verification; the open
R4 product/scope/privacy/vendor/cost decisions (`D02` provider/model + privacy,
`D03` AI-disable/cost, `D04` retention/legal, `D05` entry-point UX) need founder
approval before the affected tasks proceed, and `D02` is a hard gate on T02
acceptance. Closure requires all P3 task evidence, the evaluation
dataset/golden set, provider-evaluation/privacy evidence (post-`D02`), the
mock-decommission inventory, and the DOC-12 P3 gate evidence; neither a package
merge nor a staging deploy alone closes the milestone, live staging gate
evidence is blocked until F3 exists (`VOC-028-DEP-04`), and the P3 gate
additionally requires mock-provider CI completeness, staging provider
evaluation, and AI-disabled-without-disabling-non-AI validation (DOC-12 §5 P3).