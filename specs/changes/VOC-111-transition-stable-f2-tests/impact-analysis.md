# VOC-111 — Impact Analysis

## Consequence and risk classification

VOC-111 changes no runtime behavior, but it modifies the executable test protecting
the R3 VOC-081/VOC-110 validator. A stale test blocks the adopted VOC-105 transition;
a weakened test could conceal false profile, evidence, or command-chain acceptance.
The semantic class is therefore R3 despite the one-file test-only path. R4 is not
triggered because milestone truth, product authority, governance, workflows, data,
and external systems remain unchanged.

## Exact affected and protected boundaries

The sole affected file is
`scripts/foundation/voc081-f2-evidence-policy.test.mjs`. The runtime validator,
`package.json`, documents/evidence, historical packages, applications, workflows, and
infrastructure are protected. The change may correct only three fixture assumptions:
current-profile selection, raw duplicate-member injection, and preserved pre-profile
source ownership.

## Risks and mitigations

- `VOC-111-R00` — Profile detection accepts a partial object. Mitigation: compare
  complete exact key sets, values and types; ignore only object order and preserve
  array order; reject zero/multiple matches.
- `VOC-111-R01` — Duplicate injection silently does nothing under one profile.
  Mitigation: derive the current serialized value from the exact selected record,
  require one raw member before/two after, and cover both profiles separately.
- `VOC-111-R02` — A “preserved” pre fixture follows mutable repository state.
  Mitigation: commit every pre-profile marker and F2 support marker as plan-owned test
  literals; prohibit worktree/runtime derivation; validate each synthetic source.
- `VOC-111-R03` — A hybrid test fails for an unrelated missing marker. Mitigation:
  first prove both complete repositories and both individual source families pass,
  change exactly one surface, and require its path-specific diagnostic.
- `VOC-111-R04` — Narrow remediation drops a VOC-110 negative. Mitigation: retain the
  complete immutable/profile/claim/history/hold/no-execution matrix unchanged in
  effect and audit test names/assertion inventory against the base.
- `VOC-111-R05` — VOC-109 extension coverage regresses. Mitigation: preserve its full
  positive/negative tail and sentinel unchanged in effect.
- `VOC-111-R06` — Synthetic proof misses the real candidate. Mitigation: DOC-15 §24.18
  bounded observation through the first refreshed real VOC-105 candidate, with owner,
  signal, trigger, stop, issue, remediation, and rollback disposition.
- `VOC-111-R07` — Rollback occurs after downstream VOC-105 merges. Mitigation: stop
  downstream merge on failure; otherwise revert VOC-105 first if necessary and then
  revert the single VOC-111 test file through separate reviewed PRs.

## Dependencies and authority

- Issue #206 is intake/reproduction evidence, not authority.
- VOC-110 supplies the implemented two-profile runtime and protected test contract.
- VOC-105 supplies the adopted downstream profile and preserved real candidate, but
  its dirty worktree is not fixture authority.
- VOC-109 supplies the protected command-extension regression tail.
- Adoption authorizes only the declared repository test edit after the plan merges.
  It does not authorize VOC-105 implementation/merge or any external action.

## Security, privacy, data, product, and accessibility

The test reads repository files and writes disposable temporary fixtures. It performs
no network request or shell execution and handles no credential, secret, production
or learner data, D1/database state, UI, analytics, or accessibility surface. Product,
contract, API, schema, dependency, and runtime impact is none.

## Rollback impact

Before merge, close the implementation PR for zero effect. After merge, a separately
reviewed revert of the one test file restores the exact prior suite. A repository
revert does not deploy, mutate data/resources/settings, or release any hold; dependency
order prevents knowingly leaving VOC-105 on a reverted prerequisite.
