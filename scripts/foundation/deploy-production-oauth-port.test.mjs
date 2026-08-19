import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const DEPLOY_WORKFLOW_PATH = path.resolve(
  ".github/workflows/deploy-production.yml",
);

test("VOC-041-TEST-02 retirement: removed production workflow cannot regress OAuth URL rendering", () => {
  // VOC-041's executable assertion applied to the production deployment
  // workflow. VOC-078-T03 retires that workflow entirely, so absence is now
  // the stronger invariant; the original evidence remains available in Git.
  assert.equal(existsSync(DEPLOY_WORKFLOW_PATH), false);
});
