# VOC-097 — Close the VOC-096 final-evidence validator scope gap

VOC-097 is a repository-only correction package for issue
[#166](https://github.com/KARSIFT/vocanova-platform/issues/166). Full validation of
the preserved VOC-096 PR1 worktree exposed one legacy VOC-080 final-evidence check
that still requires the staging delivery manifest to remain unconditionally `held`.
Adopted VOC-096 instead requires an exact, validated `prepared` staging state that is
still dispatch-ineligible. The builder stopped without editing the omitted paths.

This plan adds no implementation or external-action authority. After independent
review and adoption, the preserved VOC-096 PR1 may resume in the same isolated
worktree. Its reviewed core scope expands from 27 to exactly 29 paths by adding only:

- `scripts/foundation/voc080-final-evidence-policy.mjs`;
- `scripts/foundation/voc080-final-evidence-policy.test.mjs`.

Because every adopted VOC-096 package surface states the old exact count, the same
implementation PR also reconciles those nine canonical package files. The full
authorized path inventory is therefore 38 paths: the corrected 29-path VOC-096 PR1
core plus the nine VOC-096 package records. All nine already-declared VOC-094 package
files remain inside the core set and receive the bounded operative correction there.
No other path is permitted.

The validator must continue to accept the immutable legacy `held` snapshot and may
accept `prepared` only by composing with the complete VOC-096 delivery-policy
validation. Production remains `held`; `VOC-080-HOLD-01` and `HOLD-02` remain held;
no committed standing `authorized` state is accepted; and missing, malformed, drifted,
generic-URL, self-asserted-authority, or dispatch-eligible evidence fails closed.

No Cloudflare, DNS, D1, GitHub setting/secret, credential, workflow dispatch,
deployment, migration, traffic, spending, production, data, or launch action is
authorized. Phase 1 and Phase 2 evidence remains valid. `automatic_merge_allowed:
true` is examined read-only metadata, not a merge executor or authority grant.

## VOC-098 completed PR #167 lifecycle reconciliation

The operative VOC-097 plan lifecycle is complete: reviewed bookkeeping head
`814c31deb893c5c72b80f3075c0905fc8ba8c9c5`, exact review comment `5443475414`,
Governance run `33103467324` with literal `eligible: true` and `reasons: []`, normal
non-author merge `45590a0673937f4a9464b57393e026871678b3d4`, successful post-merge CI
`33103648900`, Security `33103648876`, Governance `33103648935`, and lifecycle
readback comment `5443938338`. Repository implementation authority is effective only
for the declared PR #168 correction. Rejected SHA `cde0f665031a212b51a45af541a4ebaff23e8f7a`
and its three FAIL reviews remain immutable and non-transferable. ACT-03/04/05,
VOC-085-HOLD-00, VOC-080-HOLD-01, VOC-080-HOLD-02, and every external action remain
held; fresh exact-SHA checks/reviews and non-author merge remain required for PR #168.
