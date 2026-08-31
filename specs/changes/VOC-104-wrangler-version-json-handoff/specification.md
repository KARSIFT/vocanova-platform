# VOC-104 — Specification

## Objective and evidence

Remove the concurrent pipe boundary between Wrangler's JSON writer and the exact-tag
resolver so version lookup cannot fail because the consumer side closes while
Wrangler is still producing output. Preserve every control surrounding that handoff.

Run [`33372680216`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33372680216),
job
[`99427604608`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33372680216/job/99427604608),
attempt 1 executed a reviewed staging `deploy` at exact SHA
`53be9f7aa7aada15faedd0588686b26a4c652ecb`. The environment receipt, same-run
required checks, and delivery gate passed. Ordered staging D1 migrations and both
immutable version uploads completed. The upload step then reported `EAGAIN` and
`EPIPE` in Wrangler's version-list path. No parser diagnostic appeared in the
sanitized log.

The direct pipe is the concrete unsafe handoff. The exact low-level origin of the
runner error is not proven from sanitized evidence, so this plan does not overclaim
it. Completing Wrangler's output before launching the resolver removes the
producer/consumer lifetime coupling and gives the resolver one complete, immutable
JSON input.

No promotion or smoke ran. The rollback-after-promotion step remained skipped because
promotion never began, production was skipped, and traffic stayed unchanged. The
applied migrations and immutable uploads therefore form a coherent pre-promotion
partial state. Their exact version IDs must remain outside repository content and
unprotected evidence.

## Requirements

### VOC-104-D00 — Adoption precedes implementation

Issue #186 and its run are intake and evidence, not implementation authority. The
exact plan candidate requires specialist and independent R3 review, accountable
adoption, and normal merge before a different builder may create the declared
three-file implementation. No live-system action is authorized.

### VOC-104-D01 — Complete each JSON document before resolution

The API and web `wrangler versions list --env staging --json --config
wrangler.jsonc` commands must each write stdout to a distinct, securely created,
runner-local temporary file. Each command must exit successfully before its resolver
starts. Direct piping, process substitution, coprocesses, or another concurrent
handoff between list and resolver is forbidden.

Temporary paths and JSON bodies remain internal to the step. They are quoted, never
printed or exported, never uploaded as artifacts, and removed on success and failure.
Cleanup cannot replace or hide a failing list or resolver exit status.

### VOC-104-D02 — Preserve exact tag and UUID selection

The existing tag stays bound to SHA prefix, run ID, and attempt. Each resolver reads
only the matching Worker's completed file through ordinary file-backed stdin and
retains `resolveVersionId()` semantics: the document is an array, exactly one object
has the exact current tag, and that object's ID is a valid version UUID. Only then is
the UUID written to the existing API or web step output.

Earlier unpromoted versions, duplicate tags, invalid UUIDs, truncated JSON, a failed
list command, or a missing/mismatched capture must fail before promotion. The JSON
body, temporary path, credentials, and protected current-run IDs are not printed as
diagnostic evidence.

### VOC-104-D03 — Preserve the delivery sequence and rollback boundary

The staging sequence remains:

1. validate approval and exact account;
2. capture the current unique 100%-traffic API and web rollback targets;
3. apply the ordered compatible D1 ledger;
4. upload both immutable current-run versions;
5. complete both version-list documents and resolve exact current-run UUIDs;
6. promote those exact UUIDs;
7. run bounded smoke; and
8. after a promotion or smoke failure, attempt both exact Worker rollbacks
   independently.

A failure in step 4 or 5 skips promotion and smoke and leaves traffic unchanged. It
does not trigger promotion rollback because no new version received traffic. Once
promotion starts, the current rollback condition and independent dual-Worker attempt
remain intact. D1 is never rolled back by Worker rollback.

### VOC-104-D04 — Safe handling of the existing partial state

The observed run applied the reviewed compatible migration ledger and uploaded
unpromoted immutable versions. A future independently reviewed dispatch must not
promote or delete those versions by inference. It reads the currently serving
100%-traffic deployments as rollback targets, runs the same migration command so
Cloudflare D1 migration tracking applies only pending ledger entries, creates new
run/attempt-tagged versions, and selects only those fresh exact tags.

No cleanup of the earlier immutable versions is required for safe repository
remediation. No exact ID from the protected log may be copied into a package,
workflow, fixture, comment, issue, artifact, or other repository record.

### VOC-104-D05 — Deterministic complete-JSON regression coverage

`inspectDeliveryWorkflow()` must recognize the required file-backed sequence and
reject the current direct pipe. Focused tests must cover distinct API/web temporary
files, producer completion before resolver start, matching resolver input, cleanup,
exact step-output assignment, and promotion consuming only resolved outputs.

An isolated no-network child-process test must pass a complete synthetic versions
array to the CLI resolver through a completed temporary file and assert the exact
UUID. Truncated JSON and ambiguous exact-tag input must fail closed. Synthetic UUIDs
only are allowed.

### VOC-104-D06 — Preserve all adjacent controls

Do not change resolver semantics, the locked Wrangler version/config, account or
deployment readback, migration ledger/order, upload tags, promotion command, smoke
bounds, rollback command/condition, approval and environment protection, secrets,
manifest/resources/cost, production sentinel, or production and learner-data holds.
No runbook, manifest, settings record, dependency, application, or historical package
change is included.

### VOC-104-D07 — Coherent verified delivery

One minimum-sufficient task maps to one implementation PR. The exact plan and
implementation revisions each require deterministic validation,
Cloudflare/CI-security specialist review, independent R3 verification by distinct
non-author actors, resolution of all blocking findings, and normal merge by a
separate non-author actor.

## Risk and protected areas

The plan-only path floor is R1. The implementation touches `.github/workflows/ci.yml`,
which has an automated R3 floor, and semantically changes staging deployment control.
R3 is therefore the effective class. It creates no standing founder or technical-
steward approval requirement; EHR is not triggered.

## Exclusions

No Cloudflare or GitHub settings access, secret access or mutation, workflow
dispatch, deployment, migration, upload, version deletion, promotion, rollback,
traffic, DNS, production, spending, learner-data, or launch action is included. No
dependency upgrade, Wrangler invocation during planning/implementation validation,
resolver redesign, broad workflow refactor, or documentation rewrite is included.

## Data, analytics, accessibility, and application behavior

None. The change affects a staging delivery shell handoff and its deterministic
repository checks. It touches no product data, analytics, UI, accessibility, API, or
application behavior.
