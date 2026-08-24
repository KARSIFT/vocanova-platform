import assert from "node:assert/strict";
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  LIVING_RELEASE_SURFACES,
  validateDevelopHistorySynchronization,
} from "./voc093-develop-history-synchronization-policy.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "voc093-"));
  for (const relativePath of ["package.json", ...LIVING_RELEASE_SURFACES]) {
    const source = path.join(repositoryRoot, relativePath);
    const destination = path.join(root, relativePath);
    mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(source, destination);
  }
  return root;
}

function mutate(root, relativePath, callback) {
  const absolutePath = path.join(root, relativePath);
  const original = readFileSync(absolutePath, "utf8");
  writeFileSync(absolutePath, callback(original), "utf8");
}

function errorsFor(callback) {
  const root = fixture();
  try {
    callback(root);
    return validateDevelopHistorySynchronization(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("current living release guidance passes the VOC-093 policy", () => {
  assert.deepEqual(validateDevelopHistorySynchronization(repositoryRoot), []);
});

test("every living release surface must retain the synchronization boundary", () => {
  for (const relativePath of LIVING_RELEASE_SURFACES) {
    const errors = errorsFor((root) => {
      mutate(root, relativePath, (text) =>
        text.replace(
          /post-promotion history\s+synchronization/gi,
          "post-release history record",
        ),
      );
    });
    assert.ok(
      errors.some((message) =>
        message.includes(
          `${relativePath}: missing post-promotion history synchronization boundary`,
        ),
      ),
      `${relativePath} omission must fail closed`,
    );
  }
});

test("promotion-alone and settings-mutation claims fail independently", () => {
  const promotionAlone = errorsFor((root) => {
    mutate(
      root,
      "AGENTS.md",
      (text) =>
        `${text}\nRelease promotion alone completes branch finalization.\n`,
    );
  });
  assert.ok(
    promotionAlone.some((message) =>
      /release promotion alone cannot finalize branch history/.test(message),
    ),
  );

  const settingsMutation = errorsFor((root) => {
    mutate(
      root,
      "CONTRIBUTING.md",
      (text) =>
        `${text}\nHistory synchronization changes repository settings.\n`,
    );
  });
  assert.ok(
    settingsMutation.some((message) =>
      /must not claim a settings mutation/.test(message),
    ),
  );
});

test("deployment and permanent-branch deletion claims fail independently", () => {
  const deployment = errorsFor((root) => {
    mutate(
      root,
      ".github/README.md",
      (text) => `${text}\nHistory synchronization deploys to Cloudflare.\n`,
    );
  });
  assert.ok(
    deployment.some((message) =>
      /must not claim deployment or Cloudflare activity/.test(message),
    ),
  );

  const deletion = errorsFor((root) => {
    mutate(
      root,
      "docs/governance/repository-settings.md",
      (text) => `${text}\nManually delete \`main\` after synchronization.\n`,
    );
  });
  assert.ok(
    deletion.some((message) =>
      /manual or permanent-branch deletion is prohibited/.test(message),
    ),
  );
});

test("foundation discovery and required recovery evidence fail closed", () => {
  const undiscovered = errorsFor((root) => {
    mutate(root, "package.json", (text) =>
      text.replace(
        "node --test scripts/foundation/*.test.mjs",
        "node --test scripts/foundation/other.test.mjs",
      ),
    );
  });
  assert.ok(
    undiscovered.some((message) => /ci:foundation must include/.test(message)),
  );

  const noRecovery = errorsFor((root) => {
    for (const relativePath of LIVING_RELEASE_SURFACES) {
      mutate(root, relativePath, (text) =>
        text.replace(/exact SHA/gi, "recorded commit"),
      );
    }
  });
  assert.ok(
    noRecovery.some((message) =>
      /missing short-lived-head recovery evidence/.test(message),
    ),
  );
});
