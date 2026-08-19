import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import {
  RETIRED_CONTROL_PLANE_WORKFLOWS,
  RETIRED_SERVER_WORKFLOWS,
  TARGET_WORKFLOWS,
  inspectCommonWorkflowPolicy,
  inspectTargetWorkflow,
  validateWorkflowDirectory,
} from "./workflow-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const workflowDirectory = resolve(repositoryRoot, ".github/workflows");

test("the target workflows pass after external control-plane retirement", () => {
  assert.deepEqual(
    validateWorkflowDirectory(workflowDirectory, "additive"),
    [],
  );
});

test("retired workflow filenames and external control-plane calls are rejected", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "vocanova-workflows-"));
  try {
    for (const filename of TARGET_WORKFLOWS) {
      writeFileSync(
        resolve(temporary, filename),
        readFileSync(resolve(workflowDirectory, filename), "utf8"),
      );
    }
    writeFileSync(
      resolve(temporary, RETIRED_CONTROL_PLANE_WORKFLOWS[0]),
      "name: retired\n",
    );
    writeFileSync(
      resolve(temporary, "external.yml"),
      "jobs:\n  call:\n    uses: KARSIFT/karsift-ai-infra/.github/workflows/review.yml@deadbeef\n",
    );
    const errors = validateWorkflowDirectory(temporary, "additive");
    assert.ok(errors.some((error) => error.includes("retired external")));
    assert.ok(errors.some((error) => error.includes("external control-plane")));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("retired server workflows and server-bound capabilities are rejected", () => {
  const temporary = mkdtempSync(
    resolve(tmpdir(), "vocanova-server-workflows-"),
  );
  try {
    for (const filename of TARGET_WORKFLOWS) {
      writeFileSync(
        resolve(temporary, filename),
        readFileSync(resolve(workflowDirectory, filename), "utf8"),
      );
    }
    writeFileSync(
      resolve(temporary, RETIRED_SERVER_WORKFLOWS[0]),
      "name: retired deploy\n",
    );
    const fixtures = {
      "manual.yml": "on: [workflow_dispatch]\n",
      "scheduled.yml": "on: {schedule: [{cron: '0 * * * *'}]}\n",
      "ssh-command.yml": "steps:\n  - run: ssh deploy@example.invalid true\n",
      "ssh-agent.yml": "steps:\n  - uses: webfactory/ssh-agent@deadbeef\n",
      "cloudflare-api.yml":
        "steps:\n  - run: curl -X POST https://api.cloudflare.com/client/v4/zones\n",
      "service-secret.yml":
        "env:\n  TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n",
      "sentry.yml":
        "steps:\n  - run: curl https://sentry.io/api/0/projects/example\n",
      "environment.yml": "environment:\n  name: production\n",
      "health-port.yml":
        "steps:\n  - run: curl https://api-production.vocanova.site:8443/healthz\n",
      "health-expression.yml":
        "steps:\n  - run: curl \"https://${{ inputs.production_api_host || 'api-production.vocanova.site' }}:8443/healthz\"\n",
      "web-readiness.yml":
        "steps:\n  - run: curl https://staging.vocanova.site/\n",
    };
    for (const [filename, source] of Object.entries(fixtures)) {
      writeFileSync(resolve(temporary, filename), source);
    }

    const errors = validateWorkflowDirectory(temporary, "additive");
    assert.ok(errors.some((error) => error.includes("retired server-bound")));
    for (const filename of Object.keys(fixtures)) {
      assert.ok(
        errors.some(
          (error) =>
            error.startsWith(`${filename}:`) &&
            error.includes("prohibited server capability"),
        ),
        `${filename} must be rejected as server-bound automation`,
      );
    }
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("common policy rejects write permission, unsafe triggers, and floating actions", () => {
  const source = `permissions:\n  contents: write\non:\n  pull_request_target:\njobs:\n  test:\n    runs-on: ubuntu-24.04\n    timeout-minutes: 5\n    steps:\n      - uses: actions/checkout@v4\n      - run: docker run ghcr.io/example/scanner:latest\n`;
  const errors = inspectCommonWorkflowPolicy("unsafe.yml", source);
  assert.ok(errors.some((error) => error.includes("contents: read")));
  assert.ok(errors.some((error) => error.includes("write permission")));
  assert.ok(errors.some((error) => error.includes("prohibited trigger")));
  assert.ok(errors.some((error) => error.includes("not pinned")));
  assert.ok(errors.some((error) => error.includes("immutable digest")));
});

test("target contract rejects removal of deterministic CI commands", () => {
  const source = readFileSync(
    resolve(workflowDirectory, "ci.yml"),
    "utf8",
  ).replace("pnpm install --frozen-lockfile", "pnpm install");
  assert.ok(
    inspectTargetWorkflow("ci.yml", source).some((error) =>
      error.includes("pnpm install --frozen-lockfile"),
    ),
  );
});

test("final phase rejects legacy workflow inventory", () => {
  assert.ok(validateWorkflowDirectory(workflowDirectory, "final").length > 0);
});

test("final phase accepts exactly the four target filenames", () => {
  const temporary = mkdtempSync(resolve(tmpdir(), "vocanova-workflows-"));
  try {
    for (const filename of TARGET_WORKFLOWS) {
      writeFileSync(
        resolve(temporary, filename),
        readFileSync(resolve(workflowDirectory, filename), "utf8"),
      );
    }
    assert.deepEqual(validateWorkflowDirectory(temporary, "final"), []);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});
