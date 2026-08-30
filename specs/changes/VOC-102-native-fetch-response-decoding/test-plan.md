# VOC-102 — Test Plan

## VOC-102-TEST-00 — Governance, scope, and delivery shape

- Covers: `VOC-102-AC-00`
- Procedure: run governance validation and risk classification; inspect package
  lifecycle, exact path inventory, one-task/one-PR mapping, authority exclusions, and
  the implementation diff.
- Expected: the plan is draft until exact-candidate review/adoption; plan and
  implementation automated path floor is R1 and semantic implementation risk is R3;
  exactly two implementation paths are allowed; no external action is authorized.
- Evidence: `VOC-102-EV-00`

## VOC-102-TEST-01 — Native Fetch JSON success

- Covers: `VOC-102-AC-01`
- Procedure: inject an `http` function into `evaluateDeliveryEvent()` that returns
  two real native `Response` instances in endpoint order. Use `200` JSON responses
  with `application/json; charset=utf-8`, exact environment/reviewer/branch settings,
  and an exact credential-check event.
- Expected: both bodies are consumed by `json()` and the result is exactly
  `eligible: true`, `environment: staging`, `operation: credential-check`, and an
  empty reasons array.
- Evidence: `VOC-102-EV-01`

## VOC-102-TEST-02 — Native Fetch failures

- Covers: `VOC-102-AC-02`
- Procedure: separately inject a native non-2xx JSON `Response`, a successful native
  text/plain `Response`, and a successful native application/json `Response` with
  malformed JSON. Exercise the gate, not a duplicated helper implementation.
- Expected: each result is ineligible through `live environment protection readback
failed`; status/content-type/parse failure is distinguishable enough to diagnose,
  while authorization headers, token values, and response bodies are absent.
- Evidence: `VOC-102-EV-02`

## VOC-102-TEST-03 — Plain decoded fixture compatibility

- Covers: `VOC-102-AC-03`
- Procedure: inject the environment and branch-policy bodies as plain decoded
  records through the same `http` seam, then compare with a real native response whose
  `ok` remains inherited.
- Expected: plain records retain the intended test seam and reach eligibility;
  native/response-like values always take the checked decoding path.
- Evidence: `VOC-102-EV-03`

## VOC-102-TEST-04 — Regression, invariants, and exact revision

- Covers: `VOC-102-AC-04`
- Procedure: run the focused test file, delivery validation, complete foundation
  checks, applicable workspace checks, governance validation, risk classification,
  and `git diff --check`. Inspect the exact implementation diff and obtain specialist
  and independent R3 review of that SHA.
- Expected: all applicable commands pass; every pre-existing negative delivery test
  and production hold remains intact; only two approved files differ; historical
  packages have zero diff; distinct non-author exact-SHA reviews have zero unresolved
  blocking findings.
- Evidence: `VOC-102-EV-04`

## Exact baseline reproduction

At `0f336eff3f614c8ea6a19350e4c1dc32d59867b0`, run this credential-free diagnostic
with a real native response and the gate's injected HTTP seam:

```bash
node --version
node --input-type=module <<'NODE'
import {
  evaluateDeliveryEvent,
  loadDeliveryManifest,
} from "./scripts/foundation/cloudflare-delivery-policy.mjs";

const sha = "0f336eff3f614c8ea6a19350e4c1dc32d59867b0";
const environment = {
  id: 20890778457,
  name: "cloudflare-staging",
  wait_timer: 0,
  can_admins_bypass: false,
  protection_rules: [
    {
      type: "required_reviewers",
      prevent_self_review: false,
      reviewers: [
        {
          type: "User",
          reviewer: { login: "m-e-h-r-d-a-a-d", id: 7955432 },
        },
      ],
    },
  ],
  deployment_branch_policy: {
    protected_branches: false,
    custom_branch_policies: true,
  },
};
const branchPolicies = {
  total_count: 1,
  branch_policies: [{ name: "develop", type: "branch" }],
};
const responses = [environment, branchPolicies].map(
  (body) =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "content-type": "application/json; charset=utf-8" },
    }),
);

console.log(
  JSON.stringify({
    hasOwnOk: Object.hasOwn(responses[0], "ok"),
    ok: responses[0].ok,
    status: responses[0].status,
    hasJson: typeof responses[0].json === "function",
  }),
);

let responseIndex = 0;
const result = await evaluateDeliveryEvent(
  loadDeliveryManifest(process.cwd()),
  {
    event_name: "workflow_dispatch",
    actor: "m-e-h-r-d-a-a-d",
    actor_id: 7955432,
    triggering_actor: "m-e-h-r-d-a-a-d",
    ref: "refs/heads/develop",
    sha,
    inputs: {
      delivery_environment: "staging",
      delivery_operation: "credential-check",
      confirmation: `CHECK staging ${sha}`,
    },
  },
  {
    requiredResult: "success",
    // Non-secret sentinel only: injected HTTP below performs no network request.
    githubToken: "injected-http-no-network",
    http: async () => {
      const response = responses[responseIndex];
      responseIndex += 1;
      if (!response) throw new Error("unexpected injected HTTP call");
      return response;
    },
  },
);

console.log(`eligible=${result.eligible}`);
for (const reason of result.reasons) console.log(reason);
NODE
```

Recorded result on Node `v24.18.0`:

```text
{"hasOwnOk":false,"ok":true,"status":200,"hasJson":true}
eligible=false
live environment name is not cloudflare-staging
live environment ID is invalid
environment admin bypass must be disabled
environment must have exactly one required-reviewer rule
environment must use only custom deployment branch policies
environment must have exactly one custom develop branch policy
```

The matching hosted evidence is run
[`33339035431`](https://github.com/KARSIFT/vocanova-platform/actions/runs/33339035431),
job `cloudflare delivery gate`, exact event SHA
`0f336eff3f614c8ea6a19350e4c1dc32d59867b0`. The six messages match; all prerequisite
jobs passed, and the staging and production environment jobs were skipped.

## Commands

- `node --test scripts/foundation/cloudflare-delivery-policy.test.mjs`
- `node scripts/foundation/cloudflare-delivery-policy.mjs`
- `pnpm run ci:foundation`
- `pnpm validate` if applicable under `docs/development.md`
- `bash scripts/governance/validate-governance.sh`
- `bash scripts/governance/classify-change-risk.sh`
- `git diff --check`

## Evidence definitions

- `VOC-102-EV-00`: exact plan review/adoption record, package validation, path/risk
  evidence, hosted plan checks, and normal different-actor plan merge.
- `VOC-102-EV-01`: focused real-native-`Response` success test at the exact
  implementation SHA.
- `VOC-102-EV-02`: focused non-2xx, non-JSON, and malformed-JSON fail-closed results
  with redaction assertions.
- `VOC-102-EV-03`: focused plain decoded-record compatibility and response-bypass
  exclusion results.
- `VOC-102-EV-04`: complete local/hosted checks, exact two-file diff, historical
  package zero-diff proof, exact-SHA specialist/independent R3 verdicts, and normal
  different-actor merge evidence.

No test may use a real secret, production data, live GitHub mutation, Cloudflare API,
workflow dispatch, or deployment.
