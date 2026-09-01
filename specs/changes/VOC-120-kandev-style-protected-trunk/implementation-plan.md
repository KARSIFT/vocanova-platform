# VOC-120 — Implementation Plan

## Preconditions

1. Exact plan review covers governance authority, GitHub Actions/rulesets, security,
   Cloudflare environment policy, EHR, rollback, and lane classification.
2. The founder-repository-owner records the adoption decision under pre-change
   DOC-15/DOC-16; `implementation_authorized` becomes true only afterward.
3. All six implementation candidates remain subject to the frozen pre-change
   authority and independent exact review. The future model cannot authorize any
   part of its own transition.
4. PR #215 and issue #231 remain untouched except for read-only impact analysis until
   qualified-human dispositions exist.
5. No setting or ref mutation occurs without the applicable hold and exact readback.

## PR1 — Dual-compatible preparation

Branch from then-current `origin/develop`. Keep the old process operational.

### Policy and contributor surfaces

- Introduce one concise future normative governance/workflow document.
- Stage the future root `AGENTS.md` and concise issue/PR templates as non-active
  transition inputs; preserve every current authority and contributor surface until
  PR5 installs their reviewed replacements.
- Add the EHR runbook, machine lane/path policy, and control-transition inventory.
- Define Standard, Protected, and External Action floors, including unknown to
  Protected, stale-review dismissal, conversation resolution, Standard semantic
  review checks, and one native non-author approval for Protected work.

### CI and review surfaces

- Add the smallest future aggregate gate set for policy, web/packages, API/D1,
  integration/quality, and security.
- Add a tested changed-path helper. Required workflows always report; unknown bases
  run more checks; merge-group events are supported.
- Preserve all legacy checks needed by pre-change review and promotion.
- Add an immutable, executable transition verifier that binds every later VOC-120
  candidate to the frozen pre-change authority, accepted path/control inventory,
  active EHR exclusions, and held settings actions. Record its exact digest/ref.
- Add attributable review automation only if a usable native app/bot identity exists;
  otherwise Protected work remains blocked rather than faking provenance.

### PR1 validation

- current governance/risk checks;
- action pinning and workflow security lint;
- lane/path/aggregate/merge-group mutation tests;
- product/security regression suites affected by workflow restructuring;
- transition-verifier mutation tests;
- exact rollback and control inventory;
- independent governance, Actions/ruleset, security, and environment-policy review.

## Initial transition promotion and synchronization

After PR1 merges to `develop`, use the current reviewed `develop` to `main` promotion
and one final reviewed main-to-develop synchronization. Record exact SHAs, ancestry,
branch inventory, checks, rollback ref, and recreation command. No deployment occurs.

## Additive settings action A

With explicit `VOC-120-HOLD-01` and `HOLD-04` authorization:

1. Capture exact repository, ruleset, branch, security, tag, environment reviewer,
   admin-bypass, deployment-policy mode, custom-branch-policy, and ref state without
   reading secret values.
2. Enable supported secret scanning, push protection, and Dependabot security updates.
3. Create immutable `v*` tag protection and the main ruleset without permanent admin
   bypass, requiring both observed legacy transition gates and future aggregate gates.
4. Configure stale-review dismissal, conversation resolution, and Protected-review
   enforcement. Do not claim a reviewer actor that is not installed and verified.
5. Add `main` to `cloudflare-staging` while retaining `develop`, or use a bounded
   stopped swap if GitHub cannot represent both safely. Preserve reviewers and admin
   bypass exactly. Update no secret name or value.
6. Prove every configured gate reports and a credential-free main dispatch reaches
   the expected pre-secret/environment boundary. Do not deploy.
7. Restore the snapshot and stop if any readback differs.

## PR2 — Immediate additive-settings truth

Open immediately after action A. It is separately reviewed, doc-only, and governed by
the frozen pre-change authority. Update only current settings truth and directly
dependent links. Record exact before/after JSON, gate names, dual staging policy,
review requirements, rollback ref, and no-secret-read evidence. PR3 cannot start
until PR2 merges.

## PR3 — Non-EHR legacy cleanup

Branch from then-current `origin/develop`. Old authority, legacy gate, and immutable transition
verifier remain controlling through exact candidate acceptance and merge.

- Remove only non-authoritative historical/prose-replay material and dead machinery
  that the transition inventory classifies non-product, non-EHR, and unnecessary to
  evaluate or operate the remaining transition. Preserve DOC-15/DOC-16, root
  `AGENTS.md`, active templates, package adoption/verification, release/sync, and
  other current authority surfaces until PR5.
- Preserve every file, validator, release/synchronization mechanism, and branch
  implicated by PR #215 or issue #231.
- Retain the transition verifier and minimal legacy gate needed to prove PR4/PR5.
- Keep current product auth, data, D1, API, AI safety, accessibility, dependency,
  delivery, rollback, and external-action controls in affected-path/trunk lanes.
- Reconcile remaining active docs and scripts to one truthful provisional state.

PR3 receives complete deterministic checks and different-actor exact specialist
review under the pre-change authority. Promote PR3 through a reviewed `develop` to
`main` release and synchronize back before settings action B. The future governance
does not become authoritative yet; all later transition work remains under the old
authority.

## Final settings action B

After PR3 and only with explicit authorization:

1. Prove new gates and Protected review on exact main.
2. Remove legacy required gates only after the immutable transition verifier has
   accepted PR3 and remains available by recorded ref for PR4/PR5.
3. Move `cloudflare-staging` from dual/bounded policy to sole `main` only after the
   credential-free main dispatch passes. Preserve reviewers/admin bypass/mode and
   keep secret values unread.
4. Keep `develop` while PR #215 EHR remains active. Retire it only if both EHR
   dispositions, ancestry, rollback ref, open-PR inventory, and `HOLD-02` permit it.
5. Capture exact before/after readback and restore on mismatch.

## PR4 — Immediate final-settings truth

Open immediately after action B. It is separately reviewed, doc-only, and still
evaluated under the frozen pre-change transition contract. Record sole-main or
explicit EHR-retained branch state, required gates, reviews, environment policy,
security features, tags, rollback ref, and all remaining holds. It targets `develop`
under the pre-change workflow and is promoted/synchronized before PR5.

## PR5 — Transition bridge and EHR finalization

PR5 branches from then-current `origin/develop` and cannot begin until qualified
humans resolve both PR #215 and issue #231. Apply
each outcome explicitly: uphold, correct, revert, abandon, or supersede. Then:

- remove only the now-resolved disputed machinery authorized by those outcomes;
- atomically install the reviewed concise policy, root `AGENTS.md`, and contributor
  templates while retiring the current normative/package workflow surfaces;
- remove the transition verifier/legacy bridge after executing its immutable version
  from the recorded ref against the exact PR5 candidate;
- retire remaining tracked `develop` references and prepare branch retirement when
  `HOLD-02` is satisfied;
- prove main ancestry, rollback recreation, open-PR targets, rulesets, tags, checks,
  staging environment policy, and final repository inventory;
- obtain fresh pre-change governance, Actions/ruleset, security, and EHR-scope review
  of the exact candidate.

After PR5 merges, promote it to `main` and perform the final old-model synchronization.
Only then may the adoption owner record future-policy activation. With `HOLD-02`,
retire `develop` and read back every PR target, branch, rule, tag, and environment.

## PR6 — Immediate branch-retirement truth

Open immediately on protected `main` after `develop` retirement. It is doc-only,
separately reviewed, and records the final live branch/settings inventory, rollback
recreation command, closed or retargeted PR evidence, and activation decision. PR6 is
the final pre-change transition obligation; after it merges, ordinary future work
uses the new policy.

## Rollback

Before PR3, revert PR1/PR2 and restore settings snapshot A. After PR3, restore snapshot
B, recreate `develop` from the recorded SHA when applicable, restore the transition
gate/ref, and revert cleanup through the branch protected at that phase. PR6 must
retain the exact develop recreation command. Never delete Git history, local developer
state, D1 state, Cloudflare resources, production data, or secret values.
