# VOC-115 — Make release-attempt identity retry-safe

Issue [#216](https://github.com/KARSIFT/vocanova-platform/issues/216) and the
[PR #215 specialist FAIL](https://github.com/KARSIFT/vocanova-platform/pull/215#issuecomment-5491674409)
prove that adopted VOC-114 cannot retry at unchanged `develop`. PR #217's first four
candidates are rejected with no review transfer: `f7abcc8` used a racy client sequence,
`535bcd4` used editable-comment authority, and `ade2d6d` serialized a value but not a
caller, relied on deletable refs, and underspecified stale state/receipts/cardinality;
`00233a0` retained unreconstructible local retry counts and could not represent all PRs
or exact Git commit/tree captures.

The replacement removes caller-winner identity. Contenders race one deterministic claim
ref directly at frozen `develop`; identical-target requests coalesce, while atomic
create-ref selects between different targets. An exact SHA-bound attempt ref and
durable PR complete identity. A verified no-bypass GitHub ruleset denying update,
force, and deletion on claim/attempt refs is a separately authorized held prerequisite;
VOC-115 neither queries nor changes settings. Stale protected topology is an explicit
irrecoverable terminal. PR multiplicity always cleans up before terminal success.

Exhaustive all-state PR/timeline and dual-source ref scans reconstruct state. Exact
lossless page-capture schemas separate capture timestamps/ETags/raw bytes from a
timestamp-free JCS stable-state digest. Reconstructed state authorizes only the same
canonical ref/PR request, independent of lost local call history; delayed duplicates
enter cleanup. Protected refs prevent false genesis under authorized actions, and exact actor mapping
prevents inferred takeover.

After reviewed adoption, one corrected revision of draft PR
[#215](https://github.com/KARSIFT/vocanova-platform/pull/215) changes exactly 27 paths:
seven living surfaces, all nine VOC-106 artifacts, all nine VOC-114 artifacts, and two
foundation validator/test files. It preserves release topology and immutable refs and
performs no release, settings, deployment, secret, data, or live-system action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
