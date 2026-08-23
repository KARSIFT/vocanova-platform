# VOC-080 Repository Transition Record

Recorded: 2026-08-23 (hosted settings read at `2026-08-22T21:09:40Z`)

This is the final repository-only record for the adopted
`VOC-080-cloudflare-native-ruflo` implementation through T11. T12 adds this record,
the [self-contained visual architecture](voc-080-architecture.html), and final
verification evidence. The machine-readable source is
[`voc-080-transition-record.json`](voc-080-transition-record.json).

## Outcome

The repository target is now Cloudflare-native:

- Next.js 16 is transformed by OpenNext for the web Worker.
- The API is a TypeScript/Hono Cloudflare Module Worker.
- D1 owns the forward-only SQLite schema and synthetic conversion contract.
- Web-to-API calls use a Cloudflare service binding while preserving the public HTTPS
  contract.
- Workers Static Assets are active; Queues, Workflows, Durable Objects, and R2 remain
  absent until a measured requirement authorizes them.
- The old Go/PostgreSQL runtime, Dockerfiles, root Docker context, Compose, Nginx,
  host-operation scripts, and server staging tests are absent from the active tree.

GitHub remains the canonical evidence and deterministic-check layer. Ruflo is optional
external coordination in an operator-controlled workspace. It has no repository-local
launcher and no GitHub write, Cloudflare, DNS, deployment, secret, production-data,
spending, or public-launch authority.

## Exact task stack

All implementation PRs remain unmerged task branches. The implementer did not
self-approve, self-merge, or promote `develop` to `main`.

| Task                       | Exact revision                             | PR                                                          | Independent exact-revision review                                                                   | Hosted evidence                                                                                                                | Rollback |
| -------------------------- | ------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- |
| T00 decisions              | `5b857fe4b8aa5a427165545aebfbb1f562771886` | [#87](https://github.com/KARSIFT/vocanova-platform/pull/87) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/87#issuecomment-5379567727)                | [path-applicable PASS](https://github.com/KARSIFT/vocanova-platform/actions/runs/32565293113)                                  | PASS     |
| T01 CI foundation          | `b582b95e264e0c5c55ece02ad9aee0172347ef84` | [#88](https://github.com/KARSIFT/vocanova-platform/pull/88) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/88#issuecomment-5379667367)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/88#issuecomment-5379686863)                             | PASS     |
| T02 external Ruflo         | `d70f2308a3c03907c3ad2d8eb8797939a5e9ae59` | [#89](https://github.com/KARSIFT/vocanova-platform/pull/89) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/89#issuecomment-5379769841)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/89#issuecomment-5379786329)                             | PASS     |
| T03 web Worker             | `a82714639eeae6458ad3c3d027778c369e90ff5b` | [#90](https://github.com/KARSIFT/vocanova-platform/pull/90) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/90#issuecomment-5379942626)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/90#issuecomment-5379956316)                             | PASS     |
| T04 API/D1 foundation      | `6d68e20d4a1b5bb5a97fe5eb469dd6cd5ab5ee22` | [#91](https://github.com/KARSIFT/vocanova-platform/pull/91) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/91#issuecomment-5380240167)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/91#issuecomment-5380296331)                             | PASS     |
| T05 identity/account       | `f18c4dfb8bd95e675d58b22472a2fdbb4ebd7e42` | [#92](https://github.com/KARSIFT/vocanova-platform/pull/92) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/92#issuecomment-5380473755)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/92#issuecomment-5380512689)                             | PASS     |
| T06 content/review         | `e44424a727aa9b548c561147188a220f6cfc7c67` | [#93](https://github.com/KARSIFT/vocanova-platform/pull/93) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/93#issuecomment-5380635312)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/93)                                                     | PASS     |
| T07 missions/progress      | `de2b3d0f4bf0105cb74d5abaa9a5ab826ee75dd1` | [#94](https://github.com/KARSIFT/vocanova-platform/pull/94) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/94#issuecomment-5380774121)                | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/94#issuecomment-5380792873)                             | PASS     |
| T08 AI/email/observability | `2bce45c1d22ce53eedcdabb457d9849a254a8069` | [#95](https://github.com/KARSIFT/vocanova-platform/pull/95) | [PASS after findings](https://github.com/KARSIFT/vocanova-platform/pull/95#issuecomment-5381194861) | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/95#issuecomment-5381214999)                             | PASS     |
| T09 data conversion        | `631899874d27839969895db0590a52524b9507ca` | [#96](https://github.com/KARSIFT/vocanova-platform/pull/96) | [PASS after findings](https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5382015703) | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/96#issuecomment-5382040303)                             | PASS     |
| T10 held delivery          | `203ac878d7a054de0826188924446e5d24a6dd43` | [#97](https://github.com/KARSIFT/vocanova-platform/pull/97) | [PASS](https://github.com/KARSIFT/vocanova-platform/pull/97#issuecomment-5382184853)                | [four-workflow PASS, no deployment](https://github.com/KARSIFT/vocanova-platform/pull/97#issuecomment-5382243768)              | PASS     |
| T11 server retirement      | `697bb1360c4df706ef05ff50d07e4b11b1b6b13b` | [#99](https://github.com/KARSIFT/vocanova-platform/pull/99) | [PASS after findings](https://github.com/KARSIFT/vocanova-platform/pull/99#issuecomment-5382584622) | [four-workflow PASS and eligible, no deployment](https://github.com/KARSIFT/vocanova-platform/pull/99#issuecomment-5382605362) | PASS     |

T12 cannot commit its own exact hash or hosted/review URLs without changing that hash.
Its exact-SHA independent review, hosted four-workflow proof, and reverse-order rollback
record therefore belong to the T12 pull request and issue #85. The JSON source requires
those self-referential fields to remain `null` in Git.

## Deterministic control plane

The workflow inventory is exactly:

1. `ci.yml` — foundation, packages, web, Worker API, held delivery policy, and required
   aggregation. PRs run credential-free; held environment jobs skip.
2. `governance.yml` — structure, changed-path risk, and read-only evidence eligibility.
3. `quality.yml` — accessibility, Lighthouse, and required aggregation.
4. `security.yml` — dependency audit, secret scan with a synthetic fail-closed contract,
   and required aggregation.

The Governance adapter reads checks, pull requests, reviews, comments, and the adopted
package. It reports `eligible` or concrete blocking reasons in the Actions summary. It
does not approve, comment, merge, close, dispatch, or otherwise write to GitHub.

## Hosted GitHub settings read-back

T12 read these settings through GitHub's API and made no settings change:

| Surface                     | Read-back state                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| Repository                  | private; default branch `main`; not archived                                                         |
| Merge methods               | merge commit and squash enabled; rebase and auto-merge disabled                                      |
| Branch cleanup              | automatic deletion disabled while stacked bases remain active                                        |
| Default workflow token      | `read`; pull-request approval permission disabled                                                    |
| Allowed Actions             | GitHub-owned plus `pnpm/action-setup@*` and `trufflesecurity/trufflehog@*`; full-SHA policy required |
| Dependabot alerts           | enabled (`204 No Content` read-back)                                                                 |
| `develop`/`main` protection | GitHub API returned Free private-repository `403`; desired rules are policy, not hosted enforcement  |
| Environments                | one historical `production` environment; zero protection rules; no deployment-branch policy          |

No environment secret or credential was read. The absence of branch protection support
must not be represented as passing hosted enforcement; the PR evidence and deterministic
workflows remain explicit controls.

## Activation and external-effect boundary

Repository activation is still held:

- `VOC-080-HOLD-00` — staging Cloudflare resources and secrets;
- `VOC-080-HOLD-01` — production traffic, deployment, or D1 migrations; and
- `VOC-080-HOLD-02` — production learner-data access, export, transformation, or
  deletion.

T12 did not query or mutate Cloudflare, DNS, a server, Sentry, a repository setting, an
environment setting, a secret, or production data. It did not deploy or promote
`develop` to `main`. The repository manifests say staging/production activation is
held. Live Cloudflare/server state was not queried, so this record makes no claim about
that unobserved state.

## Rehearsal and rollback interpretation

Synthetic PostgreSQL-to-D1 conversion validates a frozen 25-table source inventory,
bounded chunks, resumability, idempotency, redaction, foreign-key ordering, signed
counts/checksums, exact reconciliation, interruption/retry, and forward correction.
The held delivery rehearsal validates exact release binding, local/staging/production
credential-free dry runs, version/migration/promotion order, smoke contracts, cost
ceilings, environment isolation, and fail-closed missing authority.

Reverse-order repository rollback is rehearsed in a disposable worktree from T11 to
the pre-T00 stack base. Each task boundary must reproduce the preceding exact tree.
That exercise changes only disposable Git state. T11 rollback can restore source files,
but it cannot inspect, restart, restore, or make a claim about a live server. D1 rollback
remains forward-corrective unless a separately authorized live recovery action exists.

## Closure statement

Repository implementation can satisfy AC-11 while staging, production, and production
data remain held. Closure does not activate Cloudflare resources, grant Ruflo authority,
or waive the separate release PR and external-effect evidence required later. Only
evidenced repository work is closed; all unperformed live actions remain explicit holds.
