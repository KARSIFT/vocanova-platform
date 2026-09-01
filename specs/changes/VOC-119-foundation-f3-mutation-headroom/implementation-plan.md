# VOC-119 — Implementation Plan

## Step 1 — Reconfirm the exact parent behavior

After this reviewed plan merges, branch the implementation from the then-current
exact `origin/develop`. Record that implementation parent SHA and tree before
editing. Use that recorded implementation parent, not this plan candidate SHA or the
planning `base_sha`, for before measurements, path diffs, and rollback. Then capture:

- one exact before-duration for each of the five issue-named slow tests using
  `node --test --test-name-pattern=...`;
- one complete-file run of
  `scripts/foundation/voc105-f3-evidence-policy.test.mjs`;
- one complete `pnpm run ci:foundation` run or, if interrupted by an unrelated
  repository issue, stop and record the blocker truthfully.

If any run shows a semantic failure, changed count, or unrelated repository problem,
stop and return to planning rather than optimize around it.

## Step 2 — Refactor only the test-local mutation helpers

Inside `scripts/foundation/voc105-f3-evidence-policy.test.mjs` only:

1. Build one immutable canonical-source baseline for the designated surfaces and
   `package.json`.
2. Route designated-surface mutation cases that depend on one file's surface semantics
   through `inspectF3Surface()` using the mutated in-memory source.
3. Retain full `inspectF3Evidence()` for existence, package-script, and record-
   structure assertions where aggregate state is the semantic subject.
4. Keep every mutation member, regex expectation, and positive safe-clause assertion.

The implementation may not introduce helper state that can leak a prior mutation into
another assertion.

## Step 3 — Prove no coverage reduction and no timeout increase

Diff the changed test file against its parent and prove:

- no mutation loops were reduced;
- no diagnostics were weakened;
- no `skip`, `only`, retry, repeat, shard, or conditional bypass was introduced;
- no timeout was increased or added;
- the policy module, workflow, package scripts, and docs stayed unchanged.

If the implementation needs a second file or any timeout/workflow/script adjustment,
stop and open a new governed intake.

## Step 4 — Re-measure and validate the exact head

On the final implementation SHA, capture:

- exact after-durations for the same five named tests;
- the complete VOC-105 file result and wall duration;
- the complete foundation suite result and wall duration;
- hosted final-SHA foundation validation duration, job duration, and remaining
  headroom under the exact 20-minute cap.

Then run the required local governance/risk/diff checks and collect hosted required
checks. No unavailable command may be represented as passing.

## Step 5 — Review, merge, and rollback readiness

Obtain exact-SHA independent cross-model R3 review from a different non-author actor.
Merge is by a separate non-author actor only after all blockers are resolved.

If post-merge monitoring shows renewed near-cap hosted behavior or any semantic/count
regression, perform a complete reviewed revert of the one changed file.
