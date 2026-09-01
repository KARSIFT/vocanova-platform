# VOC-115 — Make release-attempt identity retry-safe

Issue [#216](https://github.com/KARSIFT/vocanova-platform/issues/216) and the
[PR #215 specialist FAIL](https://github.com/KARSIFT/vocanova-platform/pull/215#issuecomment-5491674409)
prove that adopted VOC-114's SHA-only immutable head cannot retry at unchanged
`develop`. The first VOC-115 candidate was also rejected by the
[independent R4 review](https://github.com/KARSIFT/vocanova-platform/pull/217#issuecomment-5491850719)
and [release-history specialist](https://github.com/KARSIFT/vocanova-platform/pull/217#issuecomment-5491851011):
its client sequence was racy, comments were underspecified and tamperable, one-active
arbitration/crash recovery were incomplete, and no executable validator existed.

The replacement uses a GitHub server-assigned issue-#191 reservation-comment id:

```text
release/voc-106-<40-hex-frozen-develop-sha>-attempt-<reservation-comment-id>
```

Reservation comments are provisional. A frozen `voc-106-release-attempt-v1` event
format, full pagination, deterministic lowest-id winner, two stable scans before and
after activation, and a repository-owned validator derive at most one global active
attempt. All other concurrent same/different-SHA reservations are dispositioned.
Same-develop retry gets a fresh distinct server id without touching the abandoned ref.

The schema does not pretend comments are append-only. Exact envelope/body digests,
`created_at == updated_at`, predecessor chains, cardinality, actor/handoff authority,
and terminal precedence make edit, deletion, minimization, conflict, or missing
evidence fail closed. Explicit recovery covers every boundary from reservation through
ref/PR/binder creation and drift/closure; a missing POST receipt or matching orphan is
never adopted.

After reviewed adoption, one corrected revision of draft PR
[#215](https://github.com/KARSIFT/vocanova-platform/pull/215) changes 27 paths: seven
living release surfaces, all nine VOC-106 artifacts, all nine VOC-114 artifacts, and
two foundation validator/test files. It preserves release topology and immutable refs.
The correction may ordinarily update only its scoped PR head; it performs no release/
sync/permanent/foreign ref, settings, deployment, secret, data, or live-system action.

## Artifacts

- [Specification](specification.md)
- [Acceptance criteria](acceptance-criteria.md)
- [Impact analysis](impact-analysis.md)
- [Implementation plan](implementation-plan.md)
- [Tasks](tasks.md)
- [Test plan](test-plan.md)
- [Release plan](release-plan.md)
