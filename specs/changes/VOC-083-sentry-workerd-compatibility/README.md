# VOC-083 — Workers-safe Sentry instrumentation and workerd rejection detection

Status: adopted through PR #111. Repository-only implementation and the bounded,
credential-free isolated probes defined by T00 are authorized after adoption. All
inherited VOC-080 holds and action-specific authority boundaries remain in force.

The independent exact-SHA plan reviews of
[`682b33ec1a126e8924395f7d7f7eb26191f2a57a`](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385262973)
and
[`07772a00f753e614d3fd7a51539cabe4f0da1393`](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385292757)
both recorded **FAIL**. Exact SHA
[`8ec6b530b37972a3a9e8102905a4f1b429386941`](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385313120)
then received a different-role specialist **PASS** with zero blockers, and the
accountable technical decision owner approved that exact candidate for adoption. The
adoption-bookkeeping revision requires its own exact-SHA review before PR #111 may
merge; neither historical FAIL is reinterpreted as approval.

Issue [#105](https://github.com/KARSIFT/vocanova-platform/issues/105) records two
`WebAssembly.compile()` unhandled rejections from the generated OpenNext Worker on its
first local workerd request. The response itself is HTTP 200, so the current smoke can
incorrectly pass. The locked dependency graph resolves `@sentry/nextjs@10.69.0` and the
`@apm-js-collab/code-transformer@0.18.1` transformer path implicated by the bundle.

This package chooses no remedy at drafting time. Its implementation must compare a
configuration-only repair, a reviewed Sentry package update, and a Workers-native
Sentry adapter against the same Workers-safe bundle, reporting, privacy, and smoke
evidence. It must preserve error reporting rather than turning it off to make the
rejection disappear.

After adoption, T00 alone may record upstream evidence and conduct bounded, disposable
candidate probes in isolated worktrees; no probe changes the canonical task branch.
T00 records a provisional selection, T01 applies it, and T02 owns final canonical
bundle/workerd/reporting acceptance. If T02 disproves the choice, work fails closed and
returns through an updated T00 decision and T01 revision with fresh exact-SHA review.
Before adoption, package-level blockers concern only review/adoption.

T00 completed its provisional comparison in [`t00-evidence.md`](t00-evidence.md) on
2026-08-23. It selected exact `@sentry/cloudflare@10.69.0` plus
`@sentry/react@10.69.0` with complete removal of `@sentry/nextjs`; T01 is unblocked
but not started. This is not T02's final canonical compatibility or reporting PASS.

The plan was prepared on `agent/voc-081-t04-f2-evidence` at
`a8694932671ad9c44fd2a97c128b14e6089e5faf`; it deliberately has no dependency on
VOC-082. It authorizes no Sentry API call, source-map upload, account query,
Cloudflare mutation, deployment, credential, or live-system action.
