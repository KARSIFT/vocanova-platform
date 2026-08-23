# VOC-082 Release and Rollback Plan

## Repository delivery

The plan PR targets `agent/voc-081-t04-f2-evidence` and remains draft/unadopted until a
different-role cross-model reviewer verifies the exact candidate and an authorized
non-author adoption revision records the evidence. Implementation is two small stacked
draft PRs on the integrated predecessor. Each task needs proportional deterministic
checks, exact-SHA independent review, resolved findings, hosted proof, and non-author
merge audit.

## Activation and external effects

There is no runtime release. The clarification becomes canonical only after the
reviewed implementation is integrated into `develop`; that merge changes repository
history only. No automatic merge executor is introduced. VOC-080 staging, production,
and learner-data holds remain inherited and unresolved. No settings, environment,
Cloudflare, DNS, secret, production-data, spending, or launch action is authorized.

## Rollback triggers

- wording permits the same actor to relabel and self-review;
- wording makes a human, model, provider, or orchestrator the source of authority;
- an active or unchecked activation requirement hard-codes Codex, Claude Code, or
  another vendor as the required implementer/reviewer identity;
- a scoped cross-model evidence control is removed or misrepresented;
- a builder may approve or merge its own revision;
- reviewer edits do not require fresh independent review;
- exact-SHA/blocking-finding evidence is weakened;
- technical review is treated as action-specific authority;
- evaluator/workflow/schema/permission behavior changes; or
- docs claim hosted identity enforcement that GitHub does not provide.

## Repository rollback

Revert T01 then T00 in a disposable worktree and validate each predecessor. Rollback
removes documentation, template, synthetic-label, and policy-test clarification only.
It restores the prior named-vendor checklist wording along with the other documented
ambiguity; it does not revoke historical evidence or touch settings, branches with open
PRs, runtime, data, Cloudflare, or live systems.

## Closure evidence

Closure requires AC-00 through AC-07 and EV-00 through EV-05, complete R4 evidence,
exact-SHA cross-model independent review, hosted deterministic proof, excluded-file
identity proof, and reverse rollback. The final record must disclose that actor/runtime
identity remains declared GitHub provenance, not cryptographic hosted enforcement, and
that action-specific authority remains separate.
