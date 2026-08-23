# VOC-083 — Workers-safe Sentry instrumentation and workerd rejection detection

Status: draft; unapproved and not implementation authority.

The independent exact-SHA plan review of
`682b33ec1a126e8924395f7d7f7eb26191f2a57a` recorded **FAIL** at
[PR #111 comment 5385262973](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385262973).
This remediation revision preserves that finding and requires a fresh exact-SHA review;
it does not reinterpret the prior FAIL as approval.

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

After adoption, T00 alone is authorized as an evidence-only candidate-selection gate.
T01 and all runtime/configuration/dependency changes remain blocked until T00 records a
qualified selection decision. Before adoption, the package-level blockers concern only
review/adoption; unselected candidates are deliberately a post-adoption task gate, not
a claim that adoption cannot complete.

The plan is stacked on `agent/voc-081-t04-f2-evidence` at
`a8694932671ad9c44fd2a97c128b14e6089e5faf`; it deliberately has no dependency on
unadopted VOC-082. It authorizes no Sentry API call, source-map upload, account query,
Cloudflare mutation, deployment, credential, or live-system action.
