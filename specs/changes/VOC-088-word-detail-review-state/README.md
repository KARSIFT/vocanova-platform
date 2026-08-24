# VOC-088 — Show Backend-Authoritative Review State on Word Detail

Status: draft planning package. GitHub issue
[#139](https://github.com/KARSIFT/vocanova-platform/issues/139) authorizes planning
only. This package has no approved candidate SHA, independent verdict, adoption
decision, implementation authority, pull request, merge, deployment, or closure
evidence. Those facts must not be inferred from this draft or filled with future
placeholders.

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

The planned implementation is one R2 implementation pull request after independent
plan review and adoption. It may touch only the eleven paths declared in
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
non-author actor must review the exact plan candidate before adoption, and a later
different builder/reviewer pair must supply exact-revision implementation evidence.
