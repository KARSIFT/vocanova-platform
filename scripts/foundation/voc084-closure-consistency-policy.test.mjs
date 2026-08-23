import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  FOUNDATION_COMMAND,
  inspectFoundationScripts,
  validateClosureConsistency,
} from "./voc084-closure-consistency-policy.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const inventoryRelative =
  "specs/changes/VOC-084-reconcile-package-closure-state/closure-inventory.yaml";

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "voc084-"));
  cpSync(
    path.join(repositoryRoot, "package.json"),
    path.join(root, "package.json"),
  );
  cpSync(
    path.join(repositoryRoot, "specs/changes"),
    path.join(root, "specs/changes"),
    { recursive: true },
  );
  return root;
}

function mutate(root, relativePath, callback) {
  const absolute = path.join(root, relativePath);
  const original = readFileSync(absolute, "utf8");
  writeFileSync(absolute, callback(original), "utf8");
}

function errorsFor(callback) {
  const root = fixture();
  try {
    callback(root);
    return validateClosureConsistency(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("the adopted VOC-084 closure inventory and active claims pass", () => {
  assert.deepEqual(validateClosureConsistency(repositoryRoot), []);
});

test("stale active status and missing evidence fail independently", () => {
  const stale = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/tasks.md",
      (text) => text.replace("- Status: complete;", "- Status: pending;"),
    );
  });
  assert.ok(
    stale.some((message) => /active task status is stale/.test(message)),
  );

  const missingEvidence = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "https://github.com/KARSIFT/vocanova-platform/pull/87#issuecomment-5379567727",
        "",
      ),
    );
  });
  assert.ok(
    missingEvidence.some((message) =>
      /independent review evidence is missing/.test(message),
    ),
  );
});

test("historical FAILs and held action boundaries cannot be rewritten", () => {
  const failRewrite = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "verdict: fail\n          evidence: https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385195955",
        "verdict: pass\n          evidence: https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385195955",
      ),
    );
  });
  assert.ok(
    failRewrite.some((message) =>
      /historical FAIL was rewritten/.test(message),
    ),
  );

  const released = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/change.yaml",
      (text) =>
        text.replace(
          "    VOC-080-HOLD-00: held",
          "    VOC-080-HOLD-00: released",
        ),
    );
  });
  assert.ok(
    released.some((message) =>
      /VOC-080-HOLD-00 is missing or released/.test(message),
    ),
  );
});

test("identifier drift, placeholders, and aggregate omission fail closed", () => {
  const drift = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace("  - id: VOC-080-T00", "  - id: VOC-081-T00"),
    );
  });
  assert.ok(
    drift.some((message) =>
      /VOC-080-T00 inventory row is missing/.test(message),
    ),
  );

  const placeholder = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "implementation_head: 5b857fe4b8aa5a427165545aebfbb1f562771886",
        "implementation_head: " + "0".repeat(40),
      ),
    );
  });
  assert.ok(
    placeholder.some((message) =>
      /implementation_head is missing, non-exact, or a placeholder/.test(
        message,
      ),
    ),
  );

  const omitted = errorsFor((root) => {
    mutate(root, "package.json", (text) =>
      text.replace(" && pnpm run ci:closure-consistency", ""),
    );
  });
  assert.ok(omitted.some((message) => /ci:foundation omits/.test(message)));
});

test("file classifications fail independently on omission, duplicate, invalid, and contradiction", () => {
  const omitted = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "path: specs/changes/VOC-080-cloudflare-native-ruflo/README.md",
        "path: specs/changes/VOC-080-cloudflare-native-ruflo/README-missing.md",
      ),
    );
  });
  assert.ok(
    omitted.some((message) =>
      /file classification omission: specs\/changes\/VOC-080-cloudflare-native-ruflo\/README\.md/.test(
        message,
      ),
    ),
  );

  const duplicate = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "      reconciliation_required: VOC-084-T02-explicitly-label-superseded-integration-pending-wording,\n",
        "",
      ),
    );
    mutate(
      root,
      inventoryRelative,
      (text) =>
        text +
        "  - {\n      path: specs/changes/VOC-080-cloudflare-native-ruflo/README.md,\n      classification: active-claim,\n    }\n",
    );
  });
  assert.ok(
    duplicate.some((message) => /file classification duplicate/.test(message)),
  );

  const invalid = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "classification: active-claim,\n      basis: current-package-summary-and-limitations,",
        "classification: unknown,\n      basis: current-package-summary-and-limitations,",
      ),
    );
  });
  assert.ok(
    invalid.some((message) => /file classification is invalid/.test(message)),
  );

  const contradiction = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "classification: active-claim,\n      basis: current-package-summary-and-limitations,",
        "classification: historical,\n      basis: current-package-summary-and-limitations,",
      ),
    );
  });
  assert.ok(
    contradiction.some((message) =>
      /file classification contradicts content/.test(message),
    ),
  );
});

test("the aggregate hook has one explicit command", () => {
  const valid = JSON.stringify({
    scripts: {
      "ci:foundation": "pnpm run ci:closure-consistency",
      "ci:closure-consistency": FOUNDATION_COMMAND,
    },
  });
  assert.deepEqual(inspectFoundationScripts(valid), []);
  assert.ok(
    inspectFoundationScripts(
      valid.replace("ci:closure-consistency", "ci:missing"),
    ).length > 0,
  );
});
