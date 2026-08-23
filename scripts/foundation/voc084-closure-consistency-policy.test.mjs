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
      /review evidence|independent review evidence is missing/.test(message),
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
      /FAIL tuple is no longer labelled/.test(message),
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

test("missing holds, placeholder URLs, and exact mapping drift fail independently", () => {
  const missingHold = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/change.yaml",
      (text) => text.replace("    VOC-080-HOLD-00: held\n", ""),
    );
  });
  assert.ok(
    missingHold.some((message) =>
      /VOC-080-HOLD-00 is missing or released/.test(message),
    ),
  );

  const placeholderUrl = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "pull_request: https://github.com/KARSIFT/vocanova-platform/pull/87",
        "pull_request: https://example.com/pull/87",
      ),
    );
  });
  assert.ok(
    placeholderUrl.some((message) =>
      /VOC-080-T00 pull request does not match/.test(message),
    ),
  );

  const packageSummaryDrift = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "final_merge: a05ab5c60534f36d1b89d9b9d32296469e9942bf",
        "final_merge: " + "1".repeat(40),
      ),
    );
  });
  assert.ok(
    packageSummaryDrift.some((message) =>
      /VOC-080 package summary final merge/.test(message),
    ),
  );
});

test("package summaries, bidirectional graph links, and designated live boundaries fail closed", () => {
  const duplicatePackage = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "  - id: VOC-081\n    path: specs/changes/VOC-081",
        "  - id: VOC-080\n    path: specs/changes/VOC-081",
      ),
    );
  });
  assert.ok(
    duplicatePackage.some((message) =>
      /package summary VOC-080 must occur exactly once/.test(message),
    ),
  );

  const unknownPackage = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "  - id: VOC-083\n    path: specs/changes/VOC-083",
        "  - id: VOC-099\n    path: specs/changes/VOC-083",
      ),
    );
  });
  assert.ok(
    unknownPackage.some((message) =>
      /unknown package summary VOC-099/.test(message),
    ),
  );

  const wrongValidLink = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/tasks.md",
      (text) =>
        text.replace(
          "- Acceptance: `VOC-080-AC-00`",
          "- Acceptance: `VOC-080-AC-01`",
        ),
    );
  });
  assert.ok(
    wrongValidLink.some((message) => /task↔AC link|AC↔task link/.test(message)),
  );

  const wrongValidTestLink = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/test-plan.md",
      (text) =>
        text.replace(
          "- Covers: `VOC-080-AC-00`, `VOC-080-AC-09`",
          "- Covers: `VOC-080-AC-01`, `VOC-080-AC-09`",
        ),
    );
  });
  assert.ok(
    wrongValidTestLink.some((message) =>
      /AC↔test link|test↔AC link/.test(message),
    ),
  );

  const falseLive = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/change.yaml",
      (text) =>
        text.replace(
          "production_deployment: held-by-VOC-080-HOLD-01",
          "production_deployment: deployed",
        ),
    );
  });
  assert.ok(
    falseLive.some((message) =>
      /production_deployment must remain/.test(message),
    ),
  );

  const conflatedHold = errorsFor((root) => {
    mutate(
      root,
      "specs/changes/VOC-080-cloudflare-native-ruflo/change.yaml",
      (text) =>
        text.replace(
          "staging_deployment: held-by-VOC-080-HOLD-00",
          "staging_deployment: held-by-VOC-080-HOLD-01",
        ),
    );
  });
  assert.ok(
    conflatedHold.some((message) =>
      /staging_deployment must remain/.test(message),
    ),
  );
});

test("a historical FAIL URL moved out of evidence is rejected", () => {
  const moved = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "evidence: https://github.com/KARSIFT/vocanova-platform/pull/99#issuecomment-5382605362,",
        "reason: https://github.com/KARSIFT/vocanova-platform/pull/99#issuecomment-5382605362,\n            evidence: https://github.com/KARSIFT/vocanova-platform/actions/runs/32593748534,",
      ),
    );
  });
  assert.ok(
    moved.some((message) =>
      /must bind https:\/\/github.com\/KARSIFT\/vocanova-platform\/pull\/99#issuecomment-5382605362/.test(
        message,
      ),
    ),
  );
});

test("task and package closure fields reject valid-looking structured drift", () => {
  const taskReview = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "verdict: pass,\n        evidence: https://github.com/KARSIFT/vocanova-platform/pull/87#issuecomment-5379567727",
        "verdict: pass-corrected-final-verdict,\n        evidence: https://github.com/KARSIFT/vocanova-platform/pull/87#issuecomment-5379567727",
      ),
    );
  });
  assert.ok(
    taskReview.some((message) => /VOC-080-T00 review verdict/.test(message)),
  );

  const taskHosted = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "governance: https://github.com/KARSIFT/vocanova-platform/actions/runs/32566533205",
        "governance: https://github.com/KARSIFT/vocanova-platform/actions/runs/32566533090",
      ),
    );
  });
  assert.ok(
    taskHosted.some((message) => /VOC-080-T01 hosted governance/.test(message)),
  );

  const taskRollback = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "status: pass-repository-only,\n        evidence: https://github.com/KARSIFT/vocanova-platform/pull/87",
        "status: pass-repository-only-held-delivery-contract,\n        evidence: https://github.com/KARSIFT/vocanova-platform/pull/87",
      ),
    );
  });
  assert.ok(
    taskRollback.some((message) => /VOC-080-T00 rollback status/.test(message)),
  );

  const taskPostMerge = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "reason: package-final-post-merge-record-is-authoritative",
        "reason: later-package-post-merge-record-is-authoritative",
      ),
    );
  });
  assert.ok(
    taskPostMerge.some((message) =>
      /VOC-080-T00 post-merge reason/.test(message),
    ),
  );

  const packageReview = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "https://github.com/KARSIFT/vocanova-platform/pull/86#issuecomment-5379258747",
        "https://github.com/KARSIFT/vocanova-platform/pull/102#issuecomment-5383027287",
      ),
    );
  });
  assert.ok(
    packageReview.some((message) =>
      /VOC-080 package final review evidence/.test(message),
    ),
  );

  const packageAdoption = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "https://github.com/KARSIFT/vocanova-platform/pull/110#issuecomment-5385610129",
        "https://github.com/KARSIFT/vocanova-platform/pull/111#issuecomment-5385610829",
      ),
    );
  });
  assert.ok(
    packageAdoption.some((message) =>
      /VOC-082 package plan adoption_evidence/.test(message),
    ),
  );

  const packagePostMerge = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "quality: not-applicable-push-path-filter",
        "quality: not-applicable-path-filter",
      ),
    );
  });
  assert.ok(
    packagePostMerge.some((message) =>
      /package post-merge quality/.test(message),
    ),
  );
});

test("duplicate structured closure maps fail even when both values look valid", () => {
  const duplicateTaskMap = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "        evidence: https://github.com/KARSIFT/vocanova-platform/pull/87#issuecomment-5379567727,\n      }\n    hosted:",
        "        evidence: https://github.com/KARSIFT/vocanova-platform/pull/87#issuecomment-5379567727,\n      }\n    review:\n      {verdict: pass, evidence: https://github.com/KARSIFT/vocanova-platform/pull/88#issuecomment-5379667367}\n    hosted:",
      ),
    );
  });
  assert.ok(
    duplicateTaskMap.some((message) =>
      /VOC-080-T00 review map section must occur exactly once/.test(message),
    ),
  );

  const duplicatePackageMap = errorsFor((root) => {
    mutate(root, inventoryRelative, (text) =>
      text.replace(
        "        evidence: https://github.com/KARSIFT/vocanova-platform/pull/86#issuecomment-5379258747\n    final_merge:",
        "        evidence: https://github.com/KARSIFT/vocanova-platform/pull/86#issuecomment-5379258747\n      final_review:\n        verdict: pass\n        evidence: https://github.com/KARSIFT/vocanova-platform/pull/102#issuecomment-5383027287\n    final_merge:",
      ),
    );
  });
  assert.ok(
    duplicatePackageMap.some((message) =>
      /VOC-080 package final review map section must occur exactly once/.test(
        message,
      ),
    ),
  );
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
