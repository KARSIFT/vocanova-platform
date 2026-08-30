# VOC-102 — Specification

## Objective and evidence

Correct the credential-free delivery gate so the GitHub environment and deployment
branch-policy responses returned by native Fetch are decoded before validation.

The source revision and failing event are both
`0f336eff3f614c8ea6a19350e4c1dc32d59867b0`. In run
[`33339035431`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33339035431),
all prerequisite jobs and `ci required` passed. The delivery gate then reported all
six environment projections absent, while `cloudflare staging` and `cloudflare
production` were skipped before environment execution or secret access.

The root cause is `requestJson()` treating any record without an own `ok` property as
decoded JSON. A native `Response` has an inherited `ok` getter, so
`Object.hasOwn(response, "ok")` is false even though `response.ok === true`,
`response.status === 200`, and `response.json` is callable. The undecoded response is
therefore validated as if it were the GitHub JSON body.

## Requirements

### VOC-102-D00 — Adoption precedes implementation

Issue #180, its evidence, and this draft do not authorize implementation. A reviewed
candidate must be adopted on `develop` before a different builder changes the two
approved files. Adoption authorizes repository work only and no external action.

### VOC-102-D01 — Decode Fetch-compatible responses

`requestJson()` must identify native and Fetch-compatible responses from their
response capabilities and shape, including inherited accessors. For such a response,
it must verify success status, require a JSON content type, await `json()`, and return
the decoded value. It must not use ownership of `ok` as the response discriminator.

### VOC-102-D02 — Fail closed at the response boundary

A response-like non-2xx result, a result without a JSON content type, or a result
whose `json()` rejects must follow the existing caught live-readback failure path.
The delivery decision remains ineligible and exposes no authorization header, token,
or response body.

### VOC-102-D03 — Preserve explicit decoded fixtures

An injected plain decoded record remains supported only when it does not present
Fetch-response capabilities. A response-like object cannot enter the fixture bypass,
including when its `ok` value is inherited.

### VOC-102-D04 — Native-boundary regression tests

Focused tests must exercise both GitHub readbacks with real native `Response`
instances and prove the exact protection projection reaches an eligible
`credential-check` decision. Separate cases must prove fail-closed non-2xx,
non-JSON, and malformed-JSON behavior, plus retained plain decoded-record behavior.

### VOC-102-D05 — Preserve delivery policy

The fix changes response decoding only. Existing dispatch identity, event/ref/SHA,
confirmation, required-check, environment/reviewer/branch protection, cost,
secret-isolation, staging, and production controls remain unchanged. No workflow,
manifest, runbook, settings record, application code, or historical package changes.

### VOC-102-D06 — Coherent verified delivery

One task maps to one implementation PR. The exact implementation revision requires
deterministic validation, Cloudflare/CI-security specialist review, independent R3
verification by distinct non-author actors, resolution of all blocking findings, and
normal merge by a separate non-author actor.

## Risk and protected areas

The plan and implementation paths each have an automated R1 path floor. The semantic
implementation risk is R3 because the code is fail-closed CI/CD delivery and
environment-protection enforcement. There is no R4 strategy, pricing, privacy,
public-promise, major-launch, or difficult-to-reverse decision. R3 creates no
standing personal approval requirement; EHR is not triggered.

## Exclusions

No GitHub workflow or setting change, secret read/write, Cloudflare read/write,
dispatch, deployment, Worker upload/promotion, D1 migration, traffic or DNS change,
spend, learner-data or production access, launch, or historical-package rewrite is
included.

## Data, analytics, accessibility, and migrations

None. The implementation decodes already-requested GitHub JSON in a credential-free
gate and changes no product data, schema, analytics, user interface, or accessibility
surface.
