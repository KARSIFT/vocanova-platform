# VOC-113 — Close F3 validator and candidate-identity gaps

This repository-only R4 plan responds to
[issue #211](https://github.com/KARSIFT/vocanova-platform/issues/211) and stops draft
VOC-105 implementation [PR #209](https://github.com/KARSIFT/vocanova-platform/pull/209)
at reviewed head `841d263c6a4fd92f0f553e0d1f2fd75bd13b1a1a`.

It preserves VOC-111's fail-closed identity rule. The drifted committed candidate is
not relabeled: after adoption, a different builder must correct the two existing
VOC-105 validator files, bind the replacement exact PR head to the unchanged sorted
12-path manifest algorithm, and record identical digests immediately before and after
the bounded validation observation. The correction also applies disclosure,
secret-name, live-action, later-boundary, history/current, delivery-status, and
rollback checks independently across every designated VOC-105 current-truth file.

The one coherent implementation boundary is a corrected revision of still-draft PR
#209. The two files do not exist on `develop`; a separate correction PR would either
duplicate the entire VOC-105 outcome or target an intermediate branch and split one
review/rollback unit. No merge is authorized until this plan is reviewed, adopted,
and merged and the corrected exact head receives fresh specialist, independent R4,
hosted, manifest, and rollback evidence.

This package authorizes no Cloudflare or GitHub settings query/mutation, secret
handling, workflow dispatch, deployment, migration, traffic/DNS change, production or
learner-data access, spending, launch, or other external action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
