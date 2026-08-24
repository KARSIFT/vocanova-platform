# VOC-090 — Release and Rollback Plan

## Repository-only boundary

This package has no deployment or live release. The draft plan authorizes no
implementation. After exact plan review, applicable exact-candidate specialist review,
accountable adoption, bookkeeping review, normal plan merge, and applicable post-merge
checks, the adopted package may authorize one repository-only implementation pull
request into `develop`.

`automatic_merge_allowed: true` is an explicitly examined package-policy value under
the current R0–R4 drafting default. The Governance workflow may read it for a report,
but no current workflow performs automatic merge. It bypasses no classification,
protected-path floor, deterministic check, different-actor exact-SHA review, complete
R4 evidence, EHR, action-specific authority, or merge audit.

Cloudflare, DNS, deployment, repository settings, environments, secrets, production
data, spending, `main` promotion, public launch, and all live-system access/mutation are
prohibited. Issue #143 remains open through plan adoption and until completed
implementation evidence.

## Implementation merge preconditions

Before the one implementation PR may merge, record on that same PR:

- exact adopted base and exact final head SHA;
- the complete declared path inventory and excluded-surface proof;
- decision, impact, privilege, and contingency evidence;
- focused static guard and negative-fixture results;
- Prettier, governance validation, unchanged R4 classifier result, and diff checks;
- a disposable repository-only rollback rehearsal with tree equality;
- a different non-author exact-SHA independent verdict with all blockers resolved;
- a different non-author governance/delivery-workflow specialist verdict; and
- applicable hosted CI, Governance, and Security results.

A separate non-author merge actor may perform the normal merge only after eligibility
is proven. After merge, attach the merge SHA and applicable post-merge results to the
same PR. Do not create a ceremony-only follow-up implementation/evidence PR.

## Monitoring and outcome

There is no live monitoring. The repository outcome is that active guidance and
templates consistently produce outcome/risk/rollback/reviewability-driven delivery,
and the static guard rejects the specified regressions. Future delivery metrics may
observe elapsed time, review cycles, coordination, and cost under existing policy; this
package adds no telemetry or service.

## Rollback and contingency

Rollback triggers include loss of unrelated-scope separation, any weakened risk floor
or exact-review/action-authority rule, an absolute one-PR mandate that ignores real
risk/rollback boundaries, template/guide contradiction, false static-guard positives
against historical evidence, or a failing applicable hosted check.

The accountable rollback owner named in the implementation PR opens a normal revert PR
for the exact implementation revision. The last-known-good reference is the exact
adopted `develop` base. Re-run the focused validator/tests, Prettier, governance,
classifier, and diff checks. No data restore, migration rollback, setting mutation,
deployment, cache purge, Cloudflare action, or live rollback applies.

If one-PR implementation becomes genuinely unsafe or unreviewable, stop rather than
silently split. Return to the adopted package through a separately reviewed scope
change that supplies the `VOC-090-D04`/`D05` rationale; the current draft authorizes
exactly one implementation PR.

## Closure

Plan PR merge does not close issue #143. Implementation merge alone does not close it
while applicable post-merge checks are pending. After those checks pass, an accountable
operator may close the issue with links to the implementation PR, exact general and
specialist reviews, hosted evidence, merge SHA, rollback evidence, and post-merge
results.
