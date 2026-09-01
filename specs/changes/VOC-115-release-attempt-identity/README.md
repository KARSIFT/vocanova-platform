# VOC-115 — Make release-attempt identity retry-safe

Issue [#216](https://github.com/KARSIFT/vocanova-platform/issues/216) and the
[exact PR #215 specialist review](https://github.com/KARSIFT/vocanova-platform/pull/215#issuecomment-5491674409)
show that adopted VOC-114's SHA-only release-head name cannot represent a second
immutable attempt while `develop` remains at the same SHA. The first invalidated
attempt must retain its ref, but the prescribed retry derives the same name and is
therefore rejected by the collision rule.

This R4 repository-only plan keeps each head bound to the full frozen `develop` SHA
and adds a canonical, monotonically allocated attempt sequence:

```text
release/voc-106-<40-lowercase-hex-develop-sha>-attempt-<positive-decimal-sequence>
```

The sequence is one greater than the highest canonical sequence found across current
remote release refs, all open/closed/merged repository pull-request head names, and
recorded VOC-106 attempt evidence. Creation uses an atomic create-if-absent GitHub ref
operation. A collision reserves that name but never permits adoption, update, force,
or deletion; the preparer refreshes the inventory and allocates the next sequence.
Successful creation plus its recorded tuple establishes attempt identity and
ownership. Continuation of that same attempt requires the exact tuple; invalidation
closes its draft PR and leaves its ref immutable.

After adoption, one corrected revision of still-draft PR
[#215](https://github.com/KARSIFT/vocanova-platform/pull/215) reconciles the seven
living release surfaces, all nine VOC-106 artifacts, and all nine adopted VOC-114
artifacts. Those 25 paths are one safety rule and rollback boundary. Historical
packages remain unchanged.

The correction itself creates, changes, or deletes no ref; queries or changes no
repository setting; and performs no release, synchronization, dispatch, deployment,
Cloudflare, DNS, secret, data, spending, launch, or other live-system action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
