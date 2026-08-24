# VOC-091 - Release and Rollback Plan

VOC-091 has no product release, deployment, or live-system effect. Its only delivery is
one repository-only recovery implementation PR to `develop`.

## Recovery merge boundary

The recovery implementation may merge only when all of the following apply to its own
unchanged final head:

- the nine-file allowlist and proportional validation pass;
- a different non-author actor records an exact-SHA PASS with no unresolved blocker;
- its single evidence binder is fully populated and bound to that head;
- the final Governance adapter JSON, evaluated after binder population, is literally
  `eligible: true` with `reasons: []`;
- applicable hosted CI, Governance, Security, and Quality applicability are recorded;
- no EHR or action-specific hold is active; and
- a separate non-author merge actor audits those facts before normal merge.

After normal merge, record applicable post-merge CI/Governance/Security evidence. Only
then does VOC-089 implementation authority become effective prospectively. The recovery
does not make the PR #141 merge retrospectively normal or effective.

## Issue and PR boundaries

After recovery merge and applicable post-merge checks, an accountable operator may close
issue #148 with links to this recovery PR, final review, binder/adapter evidence, merge,
and post-merge results. Issue #140 remains open.

PR #147 remains open as a draft during recovery. After the recovery boundary, it may
rebase/refresh if its exact VOC-089 scope remains valid; it must then obtain all its own
fresh exact-review, binder, pre-merge eligibility, normal-merge, and post-merge proof.
Only after that later completion may issue #140 close. If rebase/scope proof is unsafe,
close PR #147 and create a new governed path; never merge it on inherited authority.

## Rollback

Rollback is a normal repository revert PR of the recovery implementation. It requires
the same governed review/merge process and does not reactivate VOC-089, alter PR #141,
or cause deployment, data, settings, Cloudflare, `main`, or live-system action.
