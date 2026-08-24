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
  FOUNDATION_COMMAND,
  inspectFoundationScripts,
  validateSettingsTruth,
} from "./voc085-settings-truthfulness-policy.mjs";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");
const FIXTURE_FILES = [
  "package.json",
  "README.md",
  ".github/README.md",
  "docs/governance/repository-settings-current.yaml",
  "docs/governance/repository-settings.md",
  "docs/governance/16-autonomous-development-operating-model.md",
  "docs/operations/cloudflare-delivery.md",
];

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), "voc085-"));
  for (const relativePath of FIXTURE_FILES) {
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
    return validateSettingsTruth(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("the reconciled VOC-085 record and active guidance pass", () => {
  assert.deepEqual(validateSettingsTruth(repositoryRoot), []);
});

test("explicitly labelled historical and prospective text remains accepted", () => {
  const errors = errorsFor((root) => {
    mutate(
      root,
      "README.md",
      (text) =>
        `${text}\n\n_Historical, no longer true:_ The repository was private before the 2026-08-24 observation.\n\nProspective only: rulesets and protected branches may be activated only after a separately authorized future settings mutation.\n`,
    );
  });
  assert.deepEqual(errors, []);
});

test("missing point-in-time or freshness fields and aggregate omission fail closed", () => {
  const missingObservedAt = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace("observed_at: 2026-08-24\n", ""),
    );
  });
  assert.ok(
    missingObservedAt.some((message) =>
      /repository-settings-current\.yaml: missing point-in-time observation dates/.test(
        message,
      ),
    ),
  );

  const missingFreshness = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace(
        "  network_free_guard_scope: internal-consistency-only-not-live-freshness\n",
        "",
      ),
    );
  });
  assert.ok(
    missingFreshness.some((message) =>
      /repository-settings-current\.yaml: missing freshness semantics/.test(
        message,
      ),
    ),
  );

  const omitted = inspectFoundationScripts(
    JSON.stringify(
      {
        scripts: {
          "ci:foundation": "pnpm run ci:closure-consistency",
          "ci:settings-truth": FOUNDATION_COMMAND,
        },
      },
      null,
      2,
    ),
  );
  assert.ok(omitted.some((message) => /ci:foundation omits/.test(message)));
});

test("stale private-current claims and current-history conflation fail independently", () => {
  const stalePrivate = errorsFor((root) => {
    mutate(root, "README.md", (text) =>
      text.replace(
        "The repository is public on GitHub,",
        "The repository is private on GitHub,",
      ),
    );
  });
  assert.ok(
    stalePrivate.some((message) =>
      /README\.md: missing public point-in-time repository claim/.test(message),
    ),
  );

  const historyAsCurrent = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "They are not the current hosted state and are not rewritten to resemble\nthe public observation above.",
        "They are the current hosted state and are rewritten to resemble\nthe public observation above.",
      ),
    );
  });
  assert.ok(
    historyAsCurrent.some((message) =>
      /repository-settings\.md: missing historical VOC-080 boundary/.test(
        message,
      ),
    ),
  );
});

test("held-control promotion, prospective-alert drift, non-blocking hold drift, and mutation or live-action claims fail independently", () => {
  const promotedHold = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "The following are desired mature controls, not configured current state:",
        "The following are desired mature controls, configured current state:",
      ),
    );
  });
  assert.ok(
    promotedHold.some((message) =>
      /repository-settings\.md: missing prospective controls remain unconfigured/.test(
        message,
      ),
    ),
  );

  const prospectiveAlerts = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "The currently enabled dependency/vulnerability alerts are observed evidence, not a\nprospective held target.",
        "The currently enabled dependency/vulnerability alerts are observed evidence, a\nprospective held target.",
      ),
    );
  });
  assert.ok(
    prospectiveAlerts.some((message) =>
      /repository-settings\.md: missing alerts are current evidence, not prospective/.test(
        message,
      ),
    ),
  );

  const blockingHold = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "It does not block repository-only planning, implementation, review, or merge.",
        "It blocks repository-only planning, implementation, review, and merge.",
      ),
    );
  });
  assert.ok(
    blockingHold.some((message) =>
      /repository-settings\.md: missing non-blocking settings hold/.test(
        message,
      ),
    ),
  );

  const settingsMutation = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "This package and this guide perform no settings\nmutation.",
        "This package and this guide perform settings\nmutation.",
      ),
    );
  });
  assert.ok(
    settingsMutation.some((message) =>
      /repository-settings\.md: missing no settings-mutation claim/.test(
        message,
      ),
    ),
  );

  const liveAction = errorsFor((root) => {
    mutate(root, "docs/operations/cloudflare-delivery.md", (text) =>
      text.replace(
        "The repository therefore makes no claim that hosted environment approvals,\nsecrets, or branch restrictions are configured.",
        "The repository therefore claims that hosted environment approvals,\nsecrets, and branch restrictions are configured.",
      ),
    );
  });
  assert.ok(
    liveAction.some((message) =>
      /cloudflare-delivery\.md: missing delivery guide no hosted-config claim/.test(
        message,
      ),
    ),
  );
});
