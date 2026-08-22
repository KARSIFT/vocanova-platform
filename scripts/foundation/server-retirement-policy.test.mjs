import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import {
  inspectRetiredText,
  inspectRetirementScripts,
  inspectServerRetirementPaths,
  validateServerRetirement,
} from "./server-retirement-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");

test("active tree is Cloudflare-native after the complete parity chain", () => {
  assert.deepEqual(validateServerRetirement(repositoryRoot), []);
});

test("Go, PostgreSQL runtime, Docker, Compose, Nginx, host, and staging-server paths fail closed", () => {
  const fixtures = [
    "apps/api/go.mod",
    "apps/api/cmd/api/main.go",
    "apps/web/Dockerfile",
    "apps/web/playwright.staging.config.ts",
    "apps/web/tests/staging-e2e/core-loop.staging.spec.ts",
    "infra/docker-compose.yml",
    "infra/nginx/nginx.conf",
    "scripts/foundation/mock-inventory.mjs",
  ];
  const errors = inspectServerRetirementPaths(fixtures);
  assert.equal(errors.length, fixtures.length);
});

test("root, workflow, setup, dependency, validator, and living-doc instructions fail closed", () => {
  for (const [relative, source] of [
    ["package.json", '{"scripts":{"ci:api":"go test ./..."}}'],
    [
      ".github/actions/setup-toolchain/action.yml",
      "uses: actions/setup-go@deadbeef",
    ],
    [".github/workflows/ci.yml", "jobs:\n  api:\n    run: pnpm run ci:api"],
    [".github/dependabot.yml", 'package-ecosystem: "gomod"'],
    ["README.md", "```bash\ndocker compose up\n```"],
    ["docs/development.md", "pnpm run ci:api"],
  ]) {
    assert.ok(inspectRetiredText(relative, source).length > 0, relative);
  }
});

test("the foundation aggregate cannot omit retirement validation", () => {
  const valid = JSON.stringify({
    scripts: {
      "ci:foundation": "pnpm run validate:workspace && pnpm run ci:retirement",
      "ci:retirement": "node scripts/foundation/server-retirement-policy.mjs",
    },
  });
  assert.deepEqual(inspectRetirementScripts(valid), []);
  assert.ok(
    inspectRetirementScripts(
      valid.replace(" && pnpm run ci:retirement", ""),
    ).some((error) => error.includes("ci:foundation")),
  );
  assert.ok(
    inspectRetirementScripts(
      valid.replace(
        "node scripts/foundation/server-retirement-policy.mjs",
        "true",
      ),
    ).some((error) => error.includes("ci:retirement")),
  );
});
