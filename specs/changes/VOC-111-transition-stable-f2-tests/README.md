# VOC-111 — Make F2 policy tests transition-stable

This draft R3 package responds to
[issue #206](https://github.com/KARSIFT/vocanova-platform/issues/206). At exact
`develop` SHA `c94444bc74d3ed1b5ca0aca65141d0532f70fa11`, the adopted VOC-110 runtime
validator correctly accepts both the pre-VOC-105 and VOC-105 profiles. The preserved
real VOC-105 candidate passes both runtime validators, but three VOC-081 focused tests
still assume that `repositoryRoot` is permanently pre-VOC-105.

Current candidate identity is `VOC-111-CANDIDATE-MANIFEST-00`: exact base
`c94444bc74d3ed1b5ca0aca65141d0532f70fa11`, the specification's fixed
lexicographically sorted 12 paths, and its exact path-NUL/Git-blob-OID-no-LF-NUL
SHA-256 command, yielding
`7205f4856b2839f7302ab9a9fd9fbac57ee69942723f283241ac2970bb147e43`. TEST-00/EV-00
execute it before and after reproduction, and TEST-06 repeats it before and after
observation. `8efd149c...` is only a superseded pre-format historical fingerprint.

VOC-111 authorizes one test-file correction only. The focused test must select the
live profile from the complete exact milestone object, inject duplicate raw JSON keys
without depending on either profile's fixed value, and construct both-direction
repository hybrids from explicit plan-owned pre-profile fixtures. Mutable repository
content and the preserved dirty VOC-105 worktree are inspection inputs, never expected
fixture authority.

All VOC-110 runtime behavior, profile values, literal current-surface contracts,
immutable F2 checks, false-claim matrices, and every VOC-109 command-chain positive
and negative remain unchanged in effect. The validator, package scripts,
documentation, evidence, workflows, application code, and external systems are out of
scope.

This package remains draft and implementation-unauthorized until exact specialist and
independent cross-model R3 review, accountable adoption, and normal non-author plan
merge. It authorizes no settings, secret, Cloudflare, dispatch, deployment, migration,
traffic/DNS, production/data, spending, or launch action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
