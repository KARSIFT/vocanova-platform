import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import {
  FOUNDATION_TIMEOUT_MINUTES,
  RETIRED_CONTROL_PLANE_WORKFLOWS,
  RETIRED_SERVER_WORKFLOWS,
  TARGET_WORKFLOWS,
  inspectCommonWorkflowPolicy,
  inspectSetupAction,
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

test("the shared toolchain action is pinned and cache-safe", () => {
  const source = readFileSync(
    resolve(repositoryRoot, ".github/actions/setup-toolchain/action.yml"),
    "utf8",
  );
  assert.deepEqual(inspectSetupAction(source), []);
  assert.ok(
    inspectSetupAction(source.replace("cache: true", "cache: false")).some(
      (error) => error.includes("pnpm/action-setup"),
    ),
  );
  assert.ok(
    inspectSetupAction(`${source}\n# cache node_modules\n`).some((error) =>
      error.includes("node_modules"),
    ),
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
  const canonicalSource = readFileSync(
    resolve(workflowDirectory, "ci.yml"),
    "utf8",
  );
  const source = canonicalSource.replace(
    "pnpm run ci:web",
    "pnpm run lint:web",
  );
  assert.ok(
    inspectTargetWorkflow("ci.yml", source).some((error) =>
      error.includes("pnpm run ci:web"),
    ),
  );
  assert.ok(
    inspectTargetWorkflow(
      "ci.yml",
      source.replace("pnpm run ci:worker-api", "pnpm run lint:worker-api"),
    ).some((error) => error.includes("pnpm run ci:worker-api")),
  );
  assert.ok(
    inspectTargetWorkflow(
      "ci.yml",
      source.replace("pnpm run ci:local-stack", "pnpm run test:local-stack"),
    ).some((error) => error.includes("pnpm run ci:local-stack")),
  );
  assert.ok(
    inspectTargetWorkflow(
      "ci.yml",
      source.replace("        local-stack,\n", ""),
    ).some((error) => error.includes("must need local-stack")),
  );
  assert.deepEqual(inspectTargetWorkflow("ci.yml", canonicalSource), []);
  assert.equal(FOUNDATION_TIMEOUT_MINUTES, 20);

  const exactTimeoutError =
    "foundation job timeout-minutes must be the exact unquoted integer 20";
  const duplicateTimeoutError =
    "foundation job must declare exactly one timeout-minutes scalar";
  const duplicateFoundationError = "foundation job must appear exactly once";
  const cases = [
    {
      name: "former timeout",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        "    timeout-minutes: 15",
      ),
      expected: exactTimeoutError,
    },
    {
      name: "lower drift",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        "    timeout-minutes: 19",
      ),
      expected: exactTimeoutError,
    },
    {
      name: "higher drift",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        "    timeout-minutes: 21",
      ),
      expected: exactTimeoutError,
    },
    {
      name: "open ended drift",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        "    timeout-minutes: 30",
      ),
      expected: exactTimeoutError,
    },
    {
      name: "decimal timeout",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        "    timeout-minutes: 20.0",
      ),
      expected: exactTimeoutError,
    },
    {
      name: "quoted timeout",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        '    timeout-minutes: "20"',
      ),
      expected: exactTimeoutError,
    },
    {
      name: "expression timeout",
      source: canonicalSource.replace(
        "    timeout-minutes: 20",
        "    timeout-minutes: ${{ matrix.timeout }}",
      ),
      expected: exactTimeoutError,
    },
    {
      name: "missing foundation timeout",
      source: canonicalSource.replace("    timeout-minutes: 20\n", ""),
      expected: duplicateTimeoutError,
    },
    {
      name: "duplicate foundation timeout",
      source: canonicalSource.replace(
        "    timeout-minutes: 20\n",
        "    timeout-minutes: 20\n    timeout-minutes: 20\n",
      ),
      expected: duplicateTimeoutError,
    },
    {
      name: "duplicate foundation job",
      source: canonicalSource.replace(
        "\n  packages:\n",
        "\n  foundation:\n    name: duplicate foundation\n    runs-on: ubuntu-24.04\n    timeout-minutes: 20\n    steps:\n      - run: true\n\n  packages:\n",
      ),
      expected: duplicateFoundationError,
    },
    {
      name: "duplicate inline foundation job",
      source: canonicalSource.replace(
        "\n  packages:\n",
        "\n  foundation: { runs-on: ubuntu-24.04, timeout-minutes: 20 }\n\n  packages:\n",
      ),
      expected: duplicateFoundationError,
    },
    {
      name: "twenty on another job only",
      source: canonicalSource
        .replace("    timeout-minutes: 20", "    timeout-minutes: 15")
        .replace(
          "  packages:\n    name: packages\n    runs-on: ubuntu-24.04\n    timeout-minutes: 15",
          "  packages:\n    name: packages\n    runs-on: ubuntu-24.04\n    timeout-minutes: 20",
        ),
      expected: exactTimeoutError,
    },
    {
      name: "twenty on another job with foundation timeout absent",
      source: canonicalSource
        .replace("    timeout-minutes: 20\n", "")
        .replace(
          "  packages:\n    name: packages\n    runs-on: ubuntu-24.04\n    timeout-minutes: 15",
          "  packages:\n    name: packages\n    runs-on: ubuntu-24.04\n    timeout-minutes: 20",
        ),
      expected: duplicateTimeoutError,
    },
    {
      name: "twenty on another job with foundation job absent",
      source: canonicalSource
        .replace("  foundation:\n", "  renamed-foundation:\n")
        .replace(
          "  packages:\n    name: packages\n    runs-on: ubuntu-24.04\n    timeout-minutes: 15",
          "  packages:\n    name: packages\n    runs-on: ubuntu-24.04\n    timeout-minutes: 20",
        ),
      expected: duplicateFoundationError,
    },
  ];

  for (const fixture of cases) {
    assert.ok(
      inspectTargetWorkflow("ci.yml", fixture.source).some((error) =>
        error.includes(fixture.expected),
      ),
      fixture.name,
    );
  }
});

test("required-job aggregation blocks a synthetic subsystem failure", () => {
  const script = resolve(
    repositoryRoot,
    "scripts/foundation/require-successful-jobs.sh",
  );
  const passing = spawnSync(
    "bash",
    [script, "foundation=success", "local-stack=success", "web=success"],
    { encoding: "utf8" },
  );
  assert.equal(passing.status, 0, passing.stderr);

  const blocked = spawnSync(
    "bash",
    [script, "foundation=success", "local-stack=failure", "web=success"],
    { encoding: "utf8" },
  );
  assert.equal(blocked.status, 1);
  assert.match(blocked.stderr, /required jobs did not succeed/);

  const workflowSource = readFileSync(
    resolve(workflowDirectory, "ci.yml"),
    "utf8",
  );
  assert.ok(
    inspectTargetWorkflow(
      "ci.yml",
      workflowSource.replace(
        "          FOUNDATION_RESULT: ${{ needs.foundation.result }}\n",
        "",
      ),
    ).some((error) => error.includes("FOUNDATION_RESULT")),
  );
  assert.ok(
    inspectTargetWorkflow(
      "ci.yml",
      workflowSource.replace('          "foundation=$FOUNDATION_RESULT"\n', ""),
    ).some((error) => error.includes('"foundation=$FOUNDATION_RESULT"')),
  );
  const completePassing = spawnSync(
    "bash",
    [
      script,
      "cloudflare-delivery-policy=success",
      "foundation=success",
      "local-stack=success",
      "packages=success",
      "web=success",
      "worker-api=success",
    ],
    { encoding: "utf8" },
  );
  assert.equal(completePassing.status, 0, completePassing.stderr);

  for (const result of ["failure", "cancelled", "skipped", "", "unknown"]) {
    const blocked = spawnSync(
      "bash",
      [
        script,
        "cloudflare-delivery-policy=success",
        `foundation=${result}`,
        "local-stack=success",
        "packages=success",
        "web=success",
        "worker-api=success",
      ],
      { encoding: "utf8" },
    );
    assert.equal(blocked.status, 1, result || "empty");
    assert.match(blocked.stderr, /required jobs did not succeed/);
  }
});

test("final phase accepts the repository inventory after duplicate removal", () => {
  assert.deepEqual(validateWorkflowDirectory(workflowDirectory, "final"), []);
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
