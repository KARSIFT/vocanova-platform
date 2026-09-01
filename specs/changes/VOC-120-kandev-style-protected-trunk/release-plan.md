# VOC-120 — Release and Activation Plan

## Repository release

VOC-120 changes repository governance and GitHub controls only. It does not deploy an
application. PR1 targets `develop` and is promoted to `main` through the final
pre-change release PR, followed by the final required history-synchronization PR.

The replacement becomes operational only after exact live settings activation and
readback. PR2 then finalizes the main-only active tree under the new protected path.

## GitHub settings authority

The founder-repository-owner must explicitly authorize the exact mutation set for:

- native security features;
- main ruleset and required check names;
- merge queue;
- immutable version tag rules;
- later retirement/deletion of `develop`.

The settings operation records exact before/after JSON and grants no Cloudflare,
production, learner-data, DNS, spending, contract, or launch authority.

## Preconditions

- exact adopted plan and implementation authorization;
- PR1 exact checks and independent reviews;
- final pre-change promotion and synchronization;
- immutable rollback ref and settings snapshot;
- observed aggregate check names;
- explicit settings authorization;
- no unresolved settings mismatch.

## Monitoring and outcome

Observe at least one ordinary PR and one merge-queue candidate after activation.
Confirm path selection, all aggregate conclusions, conversation resolution, squash
history, branch cleanup, and absence of unauthorized external actions. Record any
false skip, missing check, or queue deadlock as a rollback trigger.

## Rollback

Restore the captured settings snapshot, revert through the currently protected trunk,
and recreate `develop` from the recorded SHA if retirement already occurred. Preserve
all Git history and evidence. Repository rollback does not touch D1, Cloudflare,
production traffic, learner data, DNS, or secret values.

## Existing EHR and closure

VOC-120 does not clear PR #215 or issue #231. Their qualified-human outcome must state
whether the disputed work is upheld, corrected, reverted, abandoned, or superseded.
Only after PR2, live settings readback, rollback evidence, branch inventory, and those
separate EHR dispositions may the broader repository-cleanup goal be considered
complete.
