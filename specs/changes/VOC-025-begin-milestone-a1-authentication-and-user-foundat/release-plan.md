# VOC-025 — Release Plan

## Release and deployment authorization

No release or deployment is authorized by this draft. Merge into `develop`, staging validation, production activation, and the DOC-12 A1 milestone gate are distinct. Production and autonomous production release remain disabled.

## Preconditions, monitoring, and outcome

Before any staging candidate: adopted package/decisions, exact base/revision, required PR checks, migration plan, non-production provider configuration, exact-SHA independent review, and rollback owner/procedure. Monitor aggregate auth success/failure, rate-limit, session-validation, migration, API error, and health signals without bearer or personal-data logging. The founder owns product/R4 decisions; future release authority records the accountable technical/operational owner.

## Rollback

Trigger on bypass, cross-user access, credential/bearer exposure, migration inconsistency, unacceptable auth failure, or failed health checks. Use the approved deploy/migration recovery procedure, revoke unsafe sessions, restore compatible service/data state, validate with test identities, and preserve incident/rollback evidence. The last-known-good revision is recorded at the future release decision, not guessed here.

## Independent verification, human approvals, and closure

Claude Code must report the final SHA, evidence, limitations, findings, active A-003 authority, and remaining R3/R4/EHR/adoption/activation gates. Routine R3 needs strengthened controls and independent verification; R4 decisions need founder approval. Closure requires all A1 task evidence and staging gate evidence; neither a package merge nor a staging deploy alone closes the milestone.
