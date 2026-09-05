import assert from "node:assert/strict";
import test from "node:test";

import {
  validateActionPins,
  validateStagingDeploymentWorkflow,
  validateWorkflowFile,
  validateYamlSyntax,
} from "./validate-workflows.mjs";

const valid = `name: Test
on:
  push:
  pull_request:
  merge_group:
permissions:
  contents: read
concurrency:
  cancel-in-progress: \${{ github.event_name != 'merge_group' }}
jobs:
  test:
    runs-on: ubuntu-24.04
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
`;

test("accepts a pinned, least-privilege merge-queue workflow", () => {
  assert.deepEqual(validateWorkflowFile("workflow.yml", valid), []);
});

test("rejects floating actions and unsafe privileged triggers", () => {
  const invalid = valid
    .replace("pull_request:", "pull_request_target:")
    .replace(/actions\/checkout@[0-9a-f]{40}/, "actions/checkout@main")
    .replace("persist-credentials: false", "persist-credentials: true");
  const violations = validateWorkflowFile("workflow.yml", invalid);
  assert(violations.some((item) => item.includes("full commit SHA")));
  assert(violations.some((item) => item.includes("event trigger")));
  assert(violations.some((item) => item.includes("persisted credentials")));
});

test("rejects path-filtered and cancellable merge-queue workflows", () => {
  const invalid = valid
    .replace(
      "  pull_request:\n",
      "  pull_request:\n    paths:\n      - apps/**\n",
    )
    .replace("github.event_name != 'merge_group'", "true");
  const violations = validateWorkflowFile("workflow.yml", invalid);
  assert(violations.some((item) => item.includes("path filters")));
  assert(violations.some((item) => item.includes("must not be cancelled")));
});

test("validates action pins inside composite actions", () => {
  assert.deepEqual(
    validateActionPins(
      ".github/actions/setup/action.yml",
      "runs:\n  steps:\n    - uses: actions/setup-node@main\n",
    ),
    [
      ".github/actions/setup/action.yml: action reference must use a full commit SHA: actions/setup-node@main",
    ],
  );
});

test("rejects job-level write access and secret interpolation", () => {
  const invalid = valid.replace(
    "    runs-on: ubuntu-24.04",
    "    permissions: write-all\n    runs-on: ubuntu-24.04\n    env:\n      TOKEN: ${{ secrets.PRODUCTION_TOKEN }}",
  );
  const violations = validateWorkflowFile("workflow.yml", invalid);
  assert(violations.some((item) => item.includes("write permission")));
  assert(violations.some((item) => item.includes("Actions secrets")));
});

test("rejects commented write permissions and bracket secret access", () => {
  const invalid = valid.replace(
    "    runs-on: ubuntu-24.04",
    "    permissions:\n      id-token: write # OIDC\n    runs-on: ubuntu-24.04\n    env:\n      TOKEN: ${{ secrets['PRODUCTION_TOKEN'] }}",
  );
  const violations = validateWorkflowFile("workflow.yml", invalid);
  assert(violations.some((item) => item.includes("write permission")));
  assert(violations.some((item) => item.includes("Actions secrets")));
});

test("validates timeout declarations per runner job", () => {
  const invalid = `${valid}
  second:
    runs-on: ubuntu-24.04
    steps: []
`;
  const violations = validateWorkflowFile("workflow.yml", invalid);
  assert(
    violations.some((item) =>
      item.includes(
        "runner job second must declare exactly one timeout-minutes",
      ),
    ),
  );
});

test("rejects malformed workflow and composite-action YAML", () => {
  assert(
    validateWorkflowFile("workflow.yml", `${valid}\nbroken: [`).some((item) =>
      item.includes("invalid YAML"),
    ),
  );
  assert(
    validateYamlSyntax("action.yml", "runs:\n  steps: [").some((item) =>
      item.includes("invalid YAML"),
    ),
  );
});

const validStagingDeployment = `name: Deploy staging
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: staging-deployment
  cancel-in-progress: false
jobs:
  validate:
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
      - run: pnpm validate
  deploy:
    needs: validate
    environment:
      name: staging
      url: https://stag.vocanova.site
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1
        with:
          persist-credentials: false
      - run: test "$GITHUB_REF" = refs/heads/main
      - run: pnpm exec wrangler deploy --env staging
        env:
          CLOUDFLARE_API_TOKEN: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      - run: node scripts/foundation/smoke-staging.mjs "$GITHUB_SHA"
`;

test("accepts the narrow staging deployment contract", () => {
  assert.deepEqual(
    validateStagingDeploymentWorkflow(
      ".github/workflows/deploy-staging.yml",
      validStagingDeployment,
    ),
    [],
  );
});

test("rejects an unsafe staging deployment contract", () => {
  const invalid = validStagingDeployment
    .replace("branches: [main]", "branches: [release]")
    .replace("cancel-in-progress: false", "cancel-in-progress: true")
    .replace("name: staging", "name: production")
    .replace("needs: validate", "needs: build")
    .replace("--env staging", "--env production")
    .replaceAll("CLOUDFLARE_API_TOKEN", "PRODUCTION_TOKEN");
  const violations = validateStagingDeploymentWorkflow(
    ".github/workflows/deploy-staging.yml",
    invalid,
  );
  for (const expected of [
    "push only main",
    "must not cancel",
    "staging environment",
    "must depend on validation",
    "only deploy the staging Wrangler environment",
    "unsupported Actions secret",
  ]) {
    assert(
      violations.some((item) => item.includes(expected)),
      expected,
    );
  }
});
