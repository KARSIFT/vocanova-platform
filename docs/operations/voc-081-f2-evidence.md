# VOC-081 F2 Repository/Local Evidence Record

Candidate recorded: 2026-08-23

Acceptance reconciled: 2026-08-24

This is the machine-checked active record for the adopted VOC-081 package.
Repository/local F2 is complete and effective. Its canonical structured source is
[`voc-081-f2-evidence.json`](voc-081-f2-evidence.json). The exact executable
implementation revision is `ca7596cb72128e5fa47483a65678773a6968dd79` (T03).
The final evidence revision is `a8694932671ad9c44fd2a97c128b14e6089e5faf`
(T04).

## Acceptance boundary

The accepted repository/local F2 gate proves that a contributor can use the locked
workspace to initialize repeatable local D1 state, run the supervised fast loop, run
both Workers with the committed service binding, and execute bounded disposable
foundation evidence. PR #108 integrated the complete VOC-081 stack and final evidence
revision into `develop` as merge `36d526bdec83e28b17aa30a6814d42b92f058ec1`.
The required post-merge checks passed, making repository/local F2 complete and
effective.

This record does **not** claim F3 staging, A1 authenticated-product acceptance, any
P1+ product milestone, production readiness, a public launch, or a deployment.
`VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held.

## Exact integration evidence

- PR: [#108](https://github.com/KARSIFT/vocanova-platform/pull/108)
- Final head: `a8694932671ad9c44fd2a97c128b14e6089e5faf`
- Merge: `36d526bdec83e28b17aa30a6814d42b92f058ec1`
- Independent review:
  [PASS, zero blockers](https://github.com/KARSIFT/vocanova-platform/pull/108#issuecomment-5383790286)
- Final hosted evidence:
  [summary](https://github.com/KARSIFT/vocanova-platform/pull/108#issuecomment-5385582178),
  with CI `32612887965`, Governance `32634344456`, Quality `32612888017`, and
  Security `32612888012` passing at the final head
- Rollback/failure evidence:
  [record](https://github.com/KARSIFT/vocanova-platform/pull/108#issuecomment-5383822937)
- Post-merge: CI `32634654242`, Governance `32634654225`, and Security
  `32634654343` passed at the merge; Quality was
  `not-applicable-push-path-filter` because its push path filter did not select this
  documentation/foundation change

## Historical candidate state

Before PR #108 merged, this record had status
`repository-local-f2-candidate-integration-pending`. At that time the candidate proved
the repository/local gate but could become effective only after the complete stack and
final evidence revision were integrated into `develop` and revalidated there. Open
draft PRs and task branches were evidence candidates, not accepted integration
history. That state and the candidate evidence below remain history; they do not
describe the active milestone state after the verified merge.

## Exact task evidence

| Task                        | Exact revision                             | Draft PR                                                      | Independent review                                                                                   | Hosted evidence                                                                                     |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| T00 local contract/policy   | `9b0e90fcd89469763c9874a5b0ef951e4d76149d` | [#103](https://github.com/KARSIFT/vocanova-platform/pull/103) | [PASS, zero blockers](https://github.com/KARSIFT/vocanova-platform/pull/103#issuecomment-5383253641) | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/103#issuecomment-5383324809) |
| T01 local D1 initialization | `aae4473d1072517b40e42bbb0dc4e992c37c16b5` | [#104](https://github.com/KARSIFT/vocanova-platform/pull/104) | [PASS, zero blockers](https://github.com/KARSIFT/vocanova-platform/pull/104#issuecomment-5383393667) | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/104#issuecomment-5383430480) |
| T02 supervised loops        | `38d8c27b64557e8e8bc58bb05ea3c2cd858e1136` | [#106](https://github.com/KARSIFT/vocanova-platform/pull/106) | [PASS, zero blockers](https://github.com/KARSIFT/vocanova-platform/pull/106#issuecomment-5383568439) | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/106#issuecomment-5383587649) |
| T03 local-stack CI          | `ca7596cb72128e5fa47483a65678773a6968dd79` | [#107](https://github.com/KARSIFT/vocanova-platform/pull/107) | [PASS, zero blockers](https://github.com/KARSIFT/vocanova-platform/pull/107#issuecomment-5383668456) | [four-workflow PASS](https://github.com/KARSIFT/vocanova-platform/pull/107#issuecomment-5383684056) |

In the candidate revision, T04 could not commit its own exact hash or exact-hash
review/hosted URLs without changing that hash. Those self-referential fields therefore
remained `null` in that Git revision, while its draft PR carried the exact verdict,
hosted graph, rollback transcript, and resolved findings. The current integration
record above now binds those immutable PR facts without rewriting the candidate-era
boundary.

## Command and CI contract

The final candidate ran `pnpm validate`, `pnpm run ci:local-stack`, `pnpm run ci:web`,
`pnpm run ci:worker-api`, `pnpm run ci:delivery`, `pnpm audit --audit-level high`, the
governance shell validator/classifier, 98 Python governance tests, and
`git diff --check`. The JSON record preserves their PASS outcomes; PR #108 binds the
exact transcript and final hosted evidence.

The workflow inventory remains exactly `ci.yml`, `governance.yml`, `quality.yml`, and
`security.yml`. `ci.yml` has a distinct credential-free `local stack` job, and
`CI / ci required` needs its result. Held delivery, staging, and production jobs do
not execute during an ordinary pull request.

## Local shape and limitations

- Web is fixed at `http://127.0.0.1:3000`; API is fixed at
  `http://127.0.0.1:8080`. Occupied ports fail—there is no fallback port.
- Developer state is the single ignored `.wrangler/state/vocanova-local` directory.
  Test state is a fresh OS-temporary directory per run.
- The supervised lifecycle is verified on Linux CI and uses Unix signal/process
  semantics. Native Windows behavior is not claimed; WSL2 or Linux is the supported
  route for Windows contributors.
- Repository rollback does not delete ignored developer state. Stop all loops, then
  archive or deliberately remove only the exact `.wrangler/state/vocanova-local`
  directory. Never broadly recurse over `.wrangler`, a workspace, or a home directory.

## No-live and later-gate state

No command or evidence step queries or mutates Cloudflare, DNS, a server, Sentry,
repository settings, a secret, or production learner data. No deployment occurred and
no deployment URL is expected. F3/staging, A1/P1+ acceptance, production, live
activation, and every inherited VOC-080 hold remain unresolved/held.

## Rollback status

Reverse-order rehearsal passed in a disposable worktree: T04 reproduced T03, then T03
through T00 each reproduced its exact predecessor, and the final T00 reversal
reproduced `3d6699c5eb378b9a00679d61a5c28b6b7e27c32c`, the exact pre-VOC-081 tree. Every
boundary passed governance, diff validation, and its own foundation aggregate. The
worktree was removed after verification. The final T04 draft PR carries the exact
command transcript; no rollback step queried or mutated a live system.
