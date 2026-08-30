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
        `${text}\n\n## Historical note\n\n_Historical, no longer true:_ The repository was private on GitHub before the 2026-08-24 observation.\n`,
    );
    mutate(
      root,
      ".github/README.md",
      (text) =>
        `${text}\n\n## Historical note\n\n_Historical, no longer true:_ The repository was private on GitHub before the public observation record.\n`,
    );
    mutate(
      root,
      "docs/governance/repository-settings.md",
      (text) =>
        `${text}\n\n## Historical examples\n\n_Historical, no longer true:_ The VOC-080 private-repository snapshot was the current hosted state before the public observation record existed.\n\nProspective only: a future governed observation may become the source for current repository settings after a later re-verification.\n`,
    );
    mutate(
      root,
      "docs/governance/16-autonomous-development-operating-model.md",
      (text) =>
        `${text}\n\n## Historical note\n\n_Historical, no longer true:_ The repository was private and the private plan described the current repository state before the 2026-08-24 observation.\n`,
    );
    mutate(
      root,
      "docs/operations/cloudflare-delivery.md",
      (text) =>
        `${text}\n\n## Historical examples\n\n_Historical, no longer true:_ Hosted environment approvals are configured and secrets are active for the delivery posture.\n\nProspective only: branch restrictions are configured after a separately authorized future settings mutation.\n`,
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
      /repository-settings-current\.yaml: missing current_record\.observed_at/.test(
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
      /repository-settings-current\.yaml: missing current_record\.freshness\.network_free_guard_scope/.test(
        message,
      ),
    ),
  );

  const staleAutomaticDeletion = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace(
        "delete_branch_on_merge: true\n",
        "delete_branch_on_merge: false\n",
      ),
    );
  });
  assert.ok(
    staleAutomaticDeletion.some((message) =>
      /current_record\.delete_branch_on_merge must equal true/.test(message),
    ),
  );

  const missingMutationAuthority = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace(
        "  authority: https://github.com/KARSIFT/vocanova-platform/pull/152\n",
        "",
      ),
    );
  });
  assert.ok(
    missingMutationAuthority.some((message) =>
      /missing current_record\.settings_mutation\.authority/.test(message),
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
        "This guide records but does not itself perform\nVOC-092's completed one-field settings mutation.",
        "This package and this guide perform settings mutation.",
      ),
    );
  });
  assert.ok(
    settingsMutation.some((message) =>
      /repository-settings\.md: missing record-versus-mutation boundary/.test(
        message,
      ),
    ),
  );

  const liveAction = errorsFor((root) => {
    mutate(root, "docs/operations/cloudflare-delivery.md", (text) =>
      text.replace(
        "The repository therefore makes no\nclaim that hosted environment approvals, secrets, or branch restrictions are\nconfigured.",
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

test("appended contradictory current and held claims fail even when the safe snippets remain", () => {
  const appendedReadmePrivateCurrent = errorsFor((root) => {
    mutate(root, "README.md", (text) =>
      text.replace(
        "configured.\n\nIts canonical runtime roots",
        "configured.\n\nThe repository is private on GitHub, current as observed at 2026-08-24.\n\nIts canonical runtime roots",
      ),
    );
  });
  assert.ok(
    appendedReadmePrivateCurrent.some((message) =>
      /README\.md: contradictory private-current repository claim in active README repository-summary section/.test(
        message,
      ),
    ),
  );

  const appendedGithubPrivateCurrent = errorsFor((root) => {
    mutate(root, ".github/README.md", (text) =>
      text.replace(
        "record](../docs/governance/repository-settings-current.yaml).\n",
        "record](../docs/governance/repository-settings-current.yaml).\nThe repository is private, current as observed at 2026-08-24.\n",
      ),
    );
  });
  assert.ok(
    appendedGithubPrivateCurrent.some((message) =>
      /\.github\/README\.md: contradictory private-current repository claim in active \.github current-settings section/.test(
        message,
      ),
    ),
  );

  const appendedVoc080CurrentClaim = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "current-as-observed-at-2026-08-24 repository settings.\n",
        "current-as-observed-at-2026-08-24 repository settings.\nThe VOC-080 private-repository snapshot remains the current hosted state.\n",
      ),
    );
  });
  assert.ok(
    appendedVoc080CurrentClaim.some((message) =>
      /repository-settings\.md: contradictory VOC-080 private snapshot claimed current in active VOC-080 historical-boundary section/.test(
        message,
      ),
    ),
  );

  const appendedCurrentHostedPrivate = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "VOC-092's completed one-field settings mutation.\n\n## VOC-100 Cloudflare staging environment truth",
        "VOC-092's completed one-field settings mutation.\nThe repository is private.\n\n## VOC-100 Cloudflare staging environment truth",
      ),
    );
  });
  assert.ok(
    appendedCurrentHostedPrivate.some((message) =>
      /repository-settings\.md: contradictory private-current repository claim in active current hosted-posture section/.test(
        message,
      ),
    ),
  );

  const appendedSettingsMutation = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "VOC-092's completed one-field settings mutation.\n\n## VOC-100 Cloudflare staging environment truth",
        "VOC-092's completed one-field settings mutation.\n\nThis package and this guide perform settings mutation to activate the current hosted posture.\n\n## VOC-100 Cloudflare staging environment truth",
      ),
    );
  });
  assert.ok(
    appendedSettingsMutation.some((message) =>
      /repository-settings\.md: contradictory settings-mutation claim in active current hosted-posture section/.test(
        message,
      ),
    ),
  );

  const appendedHeldPromotion = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings.md", (text) =>
      text.replace(
        "record. It does not block repository-only planning, implementation, review, or merge.\n",
        "record. It does not block repository-only planning, implementation, review, or merge.\nRulesets and protected `develop`/`main` branches are configured current state for this repository.\n",
      ),
    );
  });
  assert.ok(
    appendedHeldPromotion.some((message) =>
      /repository-settings\.md: contradictory held controls promoted to configured current state in active held-controls section/.test(
        message,
      ),
    ),
  );

  const appendedLiveHostedClaim = errorsFor((root) => {
    mutate(root, "docs/operations/cloudflare-delivery.md", (text) =>
      text.replace(
        "by the VOC-080 holds above.\n",
        "by the VOC-080 holds above.\nHosted environment approvals, secrets, and branch restrictions are configured for the current delivery posture.\n",
      ),
    );
  });
  assert.ok(
    appendedLiveHostedClaim.some((message) =>
      /cloudflare-delivery\.md: contradictory hosted environment or branch restrictions claimed configured in active delivery-settings section/.test(
        message,
      ),
    ),
  );

  const appendedDeliveryPrivate = errorsFor((root) => {
    mutate(root, "docs/operations/cloudflare-delivery.md", (text) =>
      text.replace(
        "by the VOC-080 holds above.\n",
        "by the VOC-080 holds above.\nThe repository is private.\n",
      ),
    );
  });
  assert.ok(
    appendedDeliveryPrivate.some((message) =>
      /cloudflare-delivery\.md: contradictory private-current repository claim in active delivery-settings section/.test(
        message,
      ),
    ),
  );

  const appendedDoc16PrivateCurrent = errorsFor((root) => {
    mutate(
      root,
      "docs/governance/16-autonomous-development-operating-model.md",
      (text) =>
        text.replace(
          "settings feed, and automatic branch deletion is not automatic merge or deployment.\n\n## Release gate",
          "settings feed, and automatic branch deletion is not automatic merge or deployment.\nThe repository is private.\n\n## Release gate",
        ),
    );
  });
  assert.ok(
    appendedDoc16PrivateCurrent.some((message) =>
      /16-autonomous-development-operating-model\.md: contradictory private-current repository claim in active DOC-16 release-authority section/.test(
        message,
      ),
    ),
  );
});

test("current-record API schema, normalized values, duplicates, and comments fail with concrete reasons", () => {
  const missingStagingObservation = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace(
        /cloudflare_staging_environment_observation:\n[\s\S]*?\nspecialist_review:/,
        "specialist_review:",
      ),
    );
  });
  assert.ok(
    missingStagingObservation.some((message) =>
      /repository-settings-current\.yaml: missing current_record\.cloudflare_staging_environment_observation/.test(
        message,
      ),
    ),
  );

  const missingEndpoint = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace("  - GET /repos/KARSIFT/vocanova-platform/rulesets\n", ""),
    );
  });
  assert.ok(
    missingEndpoint.some((message) =>
      /repository-settings-current\.yaml: current_record\.source_endpoints must contain 9 item\(s\), found 8/.test(
        message,
      ),
    ),
  );

  const contradictorySchema = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace("      http_status: 204\n", "      http_status: 200\n"),
    );
  });
  assert.ok(
    contradictorySchema.some((message) =>
      /repository-settings-current\.yaml: current_record\.source_schema_surface\.dependency_vulnerability_alerts\.raw_response_semantics\.http_status must equal 204, found 200/.test(
        message,
      ),
    ),
  );

  const contradictoryNormalizedValue = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace("visibility: public\n", "visibility: private\n"),
    );
  });
  assert.ok(
    contradictoryNormalizedValue.some((message) =>
      /repository-settings-current\.yaml: current_record\.visibility must equal "public", found "private"/.test(
        message,
      ),
    ),
  );

  const duplicateKey = errorsFor((root) => {
    mutate(
      root,
      "docs/governance/repository-settings-current.yaml",
      (text) => `${text}\nvisibility: private\n`,
    );
  });
  assert.ok(
    duplicateKey.some((message) =>
      /repository-settings-current\.yaml:\d+: duplicate key 'visibility'/.test(
        message,
      ),
    ),
  );

  const commentAttempt = errorsFor((root) => {
    mutate(root, "docs/governance/repository-settings-current.yaml", (text) =>
      text.replace(
        "source: github-rest-api-read-only-after-authorized-voc092-setting-mutation\n",
        "source: github-rest-api-read-only-after-authorized-voc092-setting-mutation # comment attempt\n",
      ),
    );
  });
  assert.ok(
    commentAttempt.some((message) =>
      /repository-settings-current\.yaml:\d+: comments are not allowed in this strict YAML subset/.test(
        message,
      ),
    ),
  );
});
