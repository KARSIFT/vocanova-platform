# VOC-087 — Truthful saved-vocabulary preview on Progress

Status: adopted and completed for repository bookkeeping. Exact candidate
`eea8d41447a9dc88125df546d62bd851bd4ad496` received independent PASS and the
accountable adoption decision on PR #137. The final adoption-bookkeeping revision
`dd4db05be3473a1cc4a2cbb790b0276cb0fe0029` received exact-SHA review and hosted
evidence, PR #137 merged as `61894b46705d0383028e2829903815477ea82939`, and its
applicable post-merge checks passed. VOC-087-T00 then completed through PR #138, which
merged as `ea357ce506f42fe74c7e88f670db9ce4f848d80e`; issue #132 closed after that
completion evidence. No deployment, `main`, repository-settings, Cloudflare, or
live-system authority was granted or used.

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

The authorized implementation was one R1 implementation PR after the effectiveness
boundary above. It changed only the Progress presentation and its existing Playwright
fixture/spec. It did not add an API total, change a schema, fetch subsequent pages,
alter saved-word ordering, redesign Progress or Home, deploy, promote `main`, or mutate
Cloudflare, repository settings, secrets, production data, or any live system.

The plan was prepared on `plan/voc-087-saved-vocabulary-preview` from exact base
`a9f07c9baa44f61b16d5c5999f39fdea4b558842`. Candidate CI, Governance eligibility,
and Security passed; Quality was not applicable to the plan-only path filter. The
bookkeeping revision did not invent future exact SHA, review URL, merge SHA, or
post-merge runs before they existed; those completed facts are now recorded as history.

## Plan review history

Initial candidate `cbede7d17e0883e0871d9921aaef781dee087f45` received an independent
**FAIL** on [PR #137](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390811909)
because the cookie-selected fixture did not fully specify the browser → mock direct
request and browser → Next → mock SSR forwarding chain. That verdict remains immutable
history and is not reinterpreted as approval. It was resolved only by the amended exact
candidate and later PASS recorded below.

Amended exact candidate `eea8d41447a9dc88125df546d62bd851bd4ad496` then received
independent **PASS** with zero blockers on
[comment 5390880861](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390880861),
fully resolving that blocker without erasing the FAIL. The accountable decision owner
approved that exact candidate for adoption on
[comment 5390882964](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390882964).
Candidate CI
[`32691232737`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32691232737),
Governance eligibility
[`32691680875`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32691680875),
and Security
[`32691232779`](https://github.com/KARSIFT/vocanova-platform/actions/runs/32691232779)
passed. Quality was not applicable to this plan-only diff. Exact bookkeeping review,
final hosted evidence, normal PR #137 merge, and applicable post-merge checks later
completed. A sequencing audit preserved the process incident and confirmed substantive
post-merge proof at
[comment 5390981903](https://github.com/KARSIFT/vocanova-platform/pull/137#issuecomment-5390981903).
The bounded implementation then completed in PR #138 at head
`14e146deeab182b6e663986a113b4c25d102a7dc`, merged as
`ea357ce506f42fe74c7e88f670db9ce4f848d80e`, and issue #132 closed with
[closure evidence](https://github.com/KARSIFT/vocanova-platform/issues/132#issuecomment-5391130633).
