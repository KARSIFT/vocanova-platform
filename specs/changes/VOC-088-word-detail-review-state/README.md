# VOC-088 — Show Backend-Authoritative Review State on Word Detail

Status: adopted for repository bookkeeping. Exact candidate
`6587c0c459a18d5161dfb1f1237f6025ad00a664` received independent PASS with zero
findings and the accountable adoption decision on PR #142. Implementation
authorization is recorded but becomes effective only after this bookkeeping revision
receives its own exact-SHA review and hosted evidence, PR #142 normally merges, and
applicable post-merge checks pass. No merge, deployment, or external-effect authority
is granted.

DOC-03 section 6 requires Word Detail to show the current review state of each saved
meaning. DOC-05 section 9 makes `user_words` the authority for that state and defines
the exact due predicate. At exact base
`ea357ce506f42fe74c7e88f670db9ce4f848d80e`, the authenticated
`GET /api/v1/canonical-words/:wordSlug` path joins only `user_words.id` and reduces
every active saved state to `saved: true` plus `userWordId`. The SSR page therefore
cannot distinguish a due item, an item still learning, a reviewing item, a mastered
item, or an inactive saved item.

The proposed correction adds one required nullable learner-facing projection to each
Word Detail meaning:

```text
reviewState: due | new | learning | reviewing | mastered | not_reviewing | null
```

`null` means the authenticated requester has no active saved row for the meaning.
`due` takes precedence only for `new`, `learning`, or `reviewing` when
`next_review_at` is null or is at/before the single repository request clock.
`ignored` and `archived` normalize to `not_reviewing`; raw `review_step`, raw
`next_review_at`, and another learner's row never enter the Word Detail DTO. The web
maps the projection to exact visible text headed by `Review state:` and refreshes the
server-rendered meaning after a successful save or unsave so review state and sentence
practice stay coherent with the backend.

The authorized implementation is one R2 implementation pull request after the
effectiveness boundary above. It may touch only the eleven paths declared in
`change.yaml`. It includes the Worker domain/repository/schema, generated committed
OpenAPI artifact, maintained API-client source and compiled type generation, SSR and
save/unsave refresh behavior, and focused D1/OpenAPI/client/browser fixtures and
assertions. It must preserve the scheduling algorithm, schema, review submission and
due-queue behavior, authentication/authorization, save/unsave contract, and sentence
practice.

No database migration, raw review-step UI, new API endpoint, auth redesign, new
dependency or code generator, analytics, workflow/governance edit, Cloudflare or
repository-settings mutation, deployment, production/live access, `main` promotion,
or public launch is authorized. The current API-client source is maintained manually;
this package updates that existing source and its TypeScript-generated declarations,
but does not misrepresent or expand the task into introducing an OpenAPI client-code
generator.

`automatic_merge_allowed: true` is an examined package-policy record under the active
drafting rule. It creates no executable merge or external authority. A different
non-author actor must review this adoption-bookkeeping revision before normal plan
merge, and a later different builder/reviewer pair must supply exact-revision
implementation evidence.

## Plan review and adoption history

Initial candidate `5958208c38a79b913b5147aa107fbfd618c277ff` received independent
**FAIL** on
[comment 5391308858](https://github.com/KARSIFT/vocanova-platform/pull/142#issuecomment-5391308858)
for three test-contract blockers. Amended candidate
`6587c0c459a18d5161dfb1f1237f6025ad00a664` resolved them and received independent
**PASS** with zero findings on
[comment 5391526065](https://github.com/KARSIFT/vocanova-platform/pull/142#issuecomment-5391526065).
The accountable decision owner approved that exact candidate for adoption on
[comment 5391542035](https://github.com/KARSIFT/vocanova-platform/pull/142#issuecomment-5391542035).
An intervening plan-author comment expanded the abbreviated SHA incorrectly; the
[preservation-first correction](https://github.com/KARSIFT/vocanova-platform/pull/142#issuecomment-5391457731)
records the actual candidate, and the reviewer performed a fresh review explicitly
bound to it rather than transferring a verdict.
