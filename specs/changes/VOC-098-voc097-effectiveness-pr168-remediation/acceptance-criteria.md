# VOC-098 — Acceptance Criteria

## VOC-098-AC-00 — Exact governed shape

The plan contains one nine-file package and one task. The later implementation resumes
the same PR #168 with exactly 47 authorized paths and 46 expected actual diffs, the
sole non-diff being the recorded byte-identical web generated type. No 48th path,
replacement PR, worktree/ref deletion, or external action occurs.

## VOC-098-AC-01 — VOC-097 repository authority is truthful

All nine VOC-097 surfaces consistently bind exact PR #167 review, genuine
`eligible: true` / `reasons: []`, normal merge, post-merge checks, and lifecycle
evidence. `implementation.authority_effective` is true for the declared repository
implementation only, the task is no longer draft, and no text claims the completed
plan-effectiveness events remain pending. External actions remain held.

## VOC-098-AC-02 — Expiry is atomic at the secret boundary

The first secret-bearing step captures its start before any secret read and fails on
start equality or lateness against either the ACT-04 or effective Phase-4 token
deadline. Deterministic tests prove a delay after the credential-free recheck cannot
cross the boundary, while credential values remain step-scoped and undisclosed.

## VOC-098-AC-03 — HTTP and Unicode contracts are executable

Live public GitHub reads enforce a 5-second connection timeout and 15-second complete-
response timeout, with delayed-connect and stalled-body negatives. Strict JSON/JCS
rejects lone high/low surrogates in keys and values and accepts valid paired
supplementary characters. All behavior remains credential-free and fail closed.

## VOC-098-AC-04 — Stale scope text and false-positive test are closed

The four identified operative VOC-094 27-file claims state the adopted 29-core/
38-total boundary; historical counts remain labeled history. The package-text test
inspects both VOC-094 and VOC-096 and fails on any stale operative 27-path survivor.

## VOC-098-AC-05 — Fresh exact revision is independently accepted

Rejected SHA `cde0f665...` and its three FAILs remain immutable and unapproved. A
fresh corrected SHA passes complete local/hosted validation and separate Cloudflare,
security/settings, and independent R4 reviews; a different non-author merges only
after genuine eligibility. Production, cost, secret, resource, and action holds remain
unchanged.
