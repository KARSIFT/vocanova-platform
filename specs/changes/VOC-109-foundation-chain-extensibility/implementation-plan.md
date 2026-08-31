# VOC-109 — Implementation Plan

## Preconditions and delivery shape

Do not implement until this exact package receives the required distinct reviews,
accountable adoption, and normal non-author merge into `develop`. Use one isolated
branch/worktree, one minimum-sufficient task, and one coherent implementation PR.

## Exact implementation path inventory

| Path                                                           | Classification               | Planned reconciliation                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/foundation/voc081-f2-evidence-policy.mjs`             | present-needs-reconciliation | Replace frozen whole-chain equality with an exact eight-segment prefix, exact terminal test, and one slot for unique declared lowercase-hyphen `ci:*` scripts whose values are distinct single direct Node foundation-policy entry points; preserve all other F2 record/surface logic. |
| `scripts/foundation/voc081-f2-evidence-policy.test.mjs`        | present-needs-reconciliation | Add positive zero/one/two-extension fixtures and independent omission, duplication/name/entrypoint collision, bypass, alias, compound/comment/metacharacter, unknown-extension, placement, terminal-drift, and prefix-order negatives.                                                 |
| `package.json`, workflows, docs, evidence, and package history | present-compatible-protected | Do not edit. VOC-105 owns its later `package.json` segment after this prerequisite is merged and validated.                                                                                                                                                                            |

The implementation diff is exactly the first two files. The plan package itself is
the only content added by the plan PR.

## Ordered implementation

1. Record the exact implementation base and rerun issue #198's synthetic reproduction,
   requiring the current nonempty rejection result before source edits.
2. Refactor only the foundation-chain portion of `inspectF2Scripts()`. Represent the
   current first eight segments as the exact required prefix and the wildcard test as
   the exact terminal; the slice between them is the sole extension slot.
3. Parse only exact `&&` segments without execution. Require every prefix command at
   its current index exactly once, the exact terminal command last, and the exact
   `ci:f2-evidence` entry point plus one direct F2 segment.
4. Permit unique declared non-baseline `ci:<lowercase-hyphen-name>` package-script
   segments only inside the post-settings/pre-test slot. Require each value to be one
   direct argument-free
   `node scripts/foundation/<lowercase-hyphen-policy-file>.mjs` command and each entry
   point to be distinct. Reject missing declarations, duplicate names or entry points,
   aliases or references to baseline/F2 scripts, compound/commented definitions, and
   every noncanonical or shell-control segment.
5. Rework focused fixtures so the current chain and synthetic VOC-105 extension pass.
   Mutate one invariant at a time for omission, duplicate F2/extension, `||`, echo,
   comment, alias, compound extension, duplicate entry point, exit/prefix/suffix,
   semicolon/newline/control syntax, unknown script, extension misplacement, exact
   prefix drift/reordering, and terminal test drift.
6. Run focused, foundation, workspace, governance, risk, path, whitespace, and rollback
   checks. Confirm no file beyond the exact two-file inventory changed.
7. Obtain exact-SHA foundation-policy/CI-integrity specialist review and separate
   independent cross-model R3 verification. Resolve every blocker with a new SHA and
   fresh checks/reviews; use a separate non-author merge actor.

## Validation commands

- Issue #198's network-free synthetic reproduction before implementation, expected
  nonempty rejection result.
- `node --test scripts/foundation/voc081-f2-evidence-policy.test.mjs`
- `node scripts/foundation/voc081-f2-evidence-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`
- exact changed-path audit against the adopted base
- disposable-worktree revert rehearsal and exact-tree comparison

No validation command may dispatch a workflow, run Wrangler, contact Cloudflare,
inspect settings/secrets, access production or learner data, or perform a live action.

## Deployment and rollback

There is no deployment. Before merge, closing the PR has zero repository effect. After
merge, use a separately reviewed revert PR restoring the two implementation files to
the last-known-good pre-VOC-109 revision. If a downstream extension has merged, revert
it first so every intermediate `ci:foundation` tree remains valid.
