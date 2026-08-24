# VOC-087 — Truthful saved-vocabulary preview on Progress

Status: draft plan package. It is not adopted and grants no implementation,
merge, deployment, or external-effect authority.

GitHub issue [#132](https://github.com/KARSIFT/vocanova-platform/issues/132)
records a learner-facing correctness defect: Progress requests at most 10 saved words
from a cursor-paginated endpoint, then presents that page length as the learner's total.
The endpoint exposes no authoritative total.

This package proposes the smallest safe repository correction. Progress will label the
non-empty section as a preview of up to 10 recently saved words, will not derive or
display a saved-word total from `items.length`, and will retain the existing list,
response order, empty state, accessibility, and authentication behavior. A deterministic
Playwright fixture with 10 items and a continuation cursor will prove the page does not
render `10 words saved` or another length-derived total claim.

The planned implementation is one R1 implementation PR after adoption. It may change
only the Progress presentation and its existing Playwright fixture/spec. It may not add
an API total, change a schema, fetch subsequent pages, alter saved-word ordering,
redesign Progress or Home, deploy, promote `main`, or mutate Cloudflare, repository
settings, secrets, production data, or any live system.

The plan was prepared on `plan/voc-087-saved-vocabulary-preview` from exact base
`a9f07c9baa44f61b16d5c5999f39fdea4b558842`. Before adoption it requires a different-
actor review bound to the exact candidate revision and the adoption bookkeeping
required by `AGENTS.md`.

## Plan review history

Initial candidate `cbede7d17e0883e0871d9921aaef781dee087f45` received an independent
**FAIL** on [PR #137](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390811909)
because the cookie-selected fixture did not fully specify the browser → mock direct
request and browser → Next → mock SSR forwarding chain. That verdict remains immutable
history and is not reinterpreted as approval. The amended candidate pins the complete
contract; it still requires its own different-actor exact-revision review and remains
unadopted and implementation-unauthorized.
