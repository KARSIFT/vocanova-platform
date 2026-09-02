import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { validateArchitecture } from "./validate-architecture.mjs";

async function fixture(files) {
  const root = await mkdtemp(path.join(tmpdir(), "vocanova-architecture-"));
  await mkdir(path.join(root, "apps"));
  await mkdir(path.join(root, "packages"));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

test("allows internal imports and application imports from shared packages", async () => {
  const root = await fixture({
    "apps/web/src/page.ts":
      'import "./local.js";\nimport "@vocanova/api-client";\n',
    "apps/web/src/local.ts": "export {};\n",
    "packages/api-client/src/index.ts": "export {};\n",
  });
  assert.deepEqual(await validateArchitecture(root), []);
});

test("rejects direct imports between applications", async () => {
  const root = await fixture({
    "apps/web/src/page.ts": 'import "../../api-worker/src/index.js";\n',
    "apps/api-worker/src/index.ts": "export {};\n",
  });
  const violations = await validateArchitecture(root);
  assert.equal(violations.length, 1);
  assert.match(violations[0], /must not import apps\/api-worker/);
});

test("rejects shared-package imports from an application", async () => {
  const root = await fixture({
    "apps/api-worker/src/index.ts": "export {};\n",
    "packages/api-client/src/index.ts":
      'export { app } from "../../../apps/api-worker/src/index.js";\n',
  });
  const violations = await validateArchitecture(root);
  assert.equal(violations.length, 1);
  assert.match(
    violations[0],
    /packages\/api-client must not import apps\/api-worker/,
  );
});
