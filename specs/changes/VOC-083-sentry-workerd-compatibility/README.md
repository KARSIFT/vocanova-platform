# VOC-083 — Workers-safe Sentry instrumentation and workerd rejection detection

Status: adopted through PR #111 and repository-complete through T00-T03. Final T03
exact SHA `bd7d98fc9bc2af9683b42d2fb1807794d27cda1a` received specialist PASS on PR
#117 comment `5386743429`, merged as `d4078924ae6d0be52628973e84be51734d93a5a9`,
passed the hosted qualification recorded on comment `5386754914`, passed a four-commit
repository-only rollback rehearsal, and passed post-merge CI/Governance/Security
checks. All inherited VOC-080 holds and action-specific authority boundaries remain
in force.

The independent exact-SHA plan reviews of
[`682b33ec1a126e8924395f7d7f7eb26191f2a57a`](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385262973)
and
[`07772a00f753e614d3fd7a51539cabe4f0da1393`](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385292757)
both recorded **FAIL**. Exact SHA
[`8ec6b530b37972a3a9e8102905a4f1b429386941`](https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385313120)
then received a different-role specialist **PASS** with zero blockers, and the
accountable technical decision owner approved that exact candidate for adoption. The
adoption-bookkeeping revision then received its own exact-SHA review before PR #111
merged; neither historical FAIL is reinterpreted as approval.

Issue [#105](https://github.com/KARSIFT/vocanova-platform/issues/105) records two
`WebAssembly.compile()` unhandled rejections from the generated OpenNext Worker on its
first local workerd request. The response itself was HTTP 200, so the drafting smoke
could incorrectly pass. The drafting locked dependency graph resolved
`@sentry/nextjs@10.69.0` and the `@apm-js-collab/code-transformer@0.18.1` transformer
path implicated by the bundle.

This package chooses no remedy at drafting time. Its implementation must compare a
configuration-only repair, a reviewed Sentry package update, and a Workers-native
Sentry adapter against the same Workers-safe bundle, reporting, privacy, and smoke
evidence. It must preserve error reporting rather than turning it off to make the
rejection disappear.

After adoption, T00 alone recorded upstream evidence and bounded, disposable candidate
probes in isolated worktrees; no probe changed the canonical task branch. T00 recorded
the provisional selection, T01 applied it, and T02 finally qualified the canonical
bundle/workerd/reporting result. If a future regression disproves the choice, work
still fails closed and returns through an updated T00 decision and T01 revision with
fresh exact-SHA review. Before adoption, package-level blockers concerned only
review/adoption.

T00 completed its provisional comparison in [`t00-evidence.md`](t00-evidence.md) on
2026-08-23. It selected exact `@sentry/cloudflare@10.69.0` plus
`@sentry/react@10.69.0` with complete removal of `@sentry/nextjs`. T01 received an
independent exact-SHA PASS with zero blockers on
[`9f11195ed186e214fade57884e66ca96f2498ebc`](https://github.com/KARSIFT/vocanova-platform/pull/115#issuecomment-5385989877)
after preserving and resolving its earlier exact-SHA FAIL, and PR #115 merged into
`develop` as `8b1f83a54ca72edebce0b7b5ed9f7d99e00a37d6`.

T02's earlier exact SHA
[`ab1b24d527f2d71649efb61cc1a8475535de282b`](https://github.com/KARSIFT/vocanova-platform/pull/116#issuecomment-5386309046)
received an independent **FAIL** with five blockers; that verdict remains historical
and binding. The remediated T02 exact SHA
[`e3a71a13eedfc8fef05b580280047e41f320de48`](https://github.com/KARSIFT/vocanova-platform/pull/116#issuecomment-5386580099)
received the formal independent **PASS** and merged through PR #116 as
[`23da9da69bb27529994e70d4bf6e9a0a78ea26b6`](https://github.com/KARSIFT/vocanova-platform/pull/116).
Its hosted evidence records final CI
[`32645779837`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32645779837),
Quality [`32645779813`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32645779813),
Security [`32645779815`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32645779815),
and Governance eligibility
[`32646274114`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32646274114).
Post-merge CI [`32646422581`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32646422581),
Governance [`32646422624`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32646422624),
and Security [`32646422584`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32646422584)
also passed. A ten-commit repository-only rollback rehearsal to the exact T01
revision `9f11195ed186e214fade57884e66ca96f2498ebc` passed. These records establish
T02's complete AC-01–AC-04 evidence; they do not close T03 or claim any live effect.

T03 reconciled every declared affected surface and corrected DOC-11's stale active
`@sentry/nextjs` runtime statement. The earlier T03 exact SHA
[`987d38caf461eece780ba0421594305d759fa7c4`](https://github.com/KARSIFT/vocanova-platform/pull/117#issuecomment-5386710425)
recorded **FAIL** and remains preserved historical evidence. The final T03 exact SHA
[`bd7d98fc9bc2af9683b42d2fb1807794d27cda1a`](https://github.com/KARSIFT/vocanova-platform/pull/117#issuecomment-5386743429)
then received independent **PASS**, merged through PR #117 as
[`d4078924ae6d0be52628973e84be51734d93a5a9`](https://github.com/KARSIFT/vocanova-platform/pull/117),
and recorded hosted qualification on
[`5386754914`](https://github.com/KARSIFT/vocanova-platform/pull/117#issuecomment-5386754914)
with CI [`32647980797`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32647980797),
Governance [`32648203363`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32648203363),
and Security [`32647980763`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32647980763).
Its repository-only four-commit rollback rehearsal passed, and post-merge CI
[`32648474703`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32648474703),
Governance [`32648474747`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32648474747),
and Security [`32648474756`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32648474756)
also passed. These records close AC-04 and AC-05 without claiming any live
Sentry/Cloudflare outcome.

The plan was prepared on `agent/voc-081-t04-f2-evidence` at
`a8694932671ad9c44fd2a97c128b14e6089e5faf`; it deliberately has no dependency on
VOC-082. It authorizes no Sentry API call, source-map upload, account query,
Cloudflare mutation, deployment, credential, or live-system action.
