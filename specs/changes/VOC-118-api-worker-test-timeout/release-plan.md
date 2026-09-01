# VOC-118 — Release Plan

## Repository delivery only

After exact plan review, adoption, and normal plan merge, one future R3 implementation
PR targets `develop` and changes only the named test file. Repository merge changes
test timeout metadata only; it does not deploy, dispatch, migrate, access Cloudflare
or remote D1, read secrets/data, change DNS/traffic, spend, release, promote `main`,
or launch.

## Preconditions and gates

- Exact intake, allocator, base, nine-file package, and one-path inventory.
- Repeated unmodified measurement gate with a recorded proceed/stop decision.
- One literal test-local 10,000-ms timeout and unchanged correctness semantics.
- Complete focused/file/worker/CI/workspace/governance/hosted evidence.
- Exact preservation and reverse/reapply proofs.
- Distinct non-author cross-model R3 review and separate non-author merge.

## Monitoring

The adoption-recorded owner records exact implementation/merge SHA and tree, named
test duration, 20/20-or-higher file result, 99/99-or-higher worker result,
`ci:worker-api`, required aggregate URLs, and no timeout/retry/skip/lock leak. Any
recurrence, semantic failure, duration beyond 10 seconds, resource leak, count decrease,
or scope drift blocks issue closure and routes a governed correction or full revert.

## Rollback

Before merge, close/discard the implementation PR for zero effect. After merge, revert
the complete one-file change through a reviewed PR and restore the actual first-parent
test file. Rerun focused, worker, governance, risk, format, and diff checks. Do not
partially retain timeout headroom or remove assertions. Historical evidence remains.

## Authority

`automatic_merge_allowed: true` is policy metadata only. No plan, review, risk label,
or repository merge grants settings, secret, dispatch, deploy, Cloudflare, remote D1,
production/learner data, DNS/traffic, spending, release, main, launch, or closure authority.
