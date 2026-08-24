import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const CURRENT_RECORD_PATH =
  "docs/governance/repository-settings-current.yaml";
export const FOUNDATION_COMMAND =
  "node scripts/foundation/voc085-settings-truthfulness-policy.mjs";

const CURRENT_RECORD_REQUIREMENTS = [
  {
    label: "repository identity",
    snippet:
      "repository: KARSIFT/vocanova-platform repository_identity: owner: KARSIFT name: vocanova-platform full_name: KARSIFT/vocanova-platform",
  },
  {
    label: "point-in-time observation dates",
    snippet: "observed_at: 2026-08-24 as_of: 2026-08-24",
  },
  {
    label: "read-only source contract",
    snippet:
      "source: github-rest-api-read-only observation_evidence: issue: 119",
  },
  {
    label: "freshness semantics",
    snippet:
      "freshness: semantics: point-in-time-observation-not-live-state network_free_guard_scope: internal-consistency-only-not-live-freshness live_freshness_proven: false",
  },
  {
    label: "staleness contract",
    snippet:
      "stale_when: - any later repository-settings mutation is authorized or observed - the observation can no longer be independently reverified required_follow_up: immediate-governed-doc-only-reconciliation-after-future-mutation",
  },
  {
    label: "settings-mutation prohibition",
    snippet: "settings_mutation: prohibited",
  },
  {
    label: "follow-up mutation boundary",
    snippet:
      "follow_up_boundary: future_settings_mutation_requires_immediate_governed_doc_only_follow_up: true this_record_does_not_authorize_or_perform_mutation: true",
  },
  {
    label: "dependency and vulnerability alert state",
    snippet:
      "dependency_vulnerability_alerts: enabled: true endpoint_status: 204",
  },
  {
    label: "Dependabot security-update state",
    snippet: "dependabot_security_updates: disabled",
  },
  {
    label: "secret scanning state",
    snippet:
      "secret_scanning: enabled: false push_protection: false validity_checks: false",
  },
  {
    label: "specialist review marker",
    snippet:
      "specialist_review: required: true status: pending-exact-final-revision-review",
  },
];

const ACTIVE_DOCUMENT_REQUIREMENTS = [
  {
    path: "README.md",
    requirements: [
      {
        label: "public point-in-time repository claim",
        snippet:
          "The repository is public on GitHub, current as observed at 2026-08-24.",
      },
      {
        label: "observed-versus-disabled hosted controls split",
        snippet:
          "dependency/vulnerability alerts are enabled as observed, while rulesets and branch protection are absent and Dependabot security updates and GitHub-hosted secret scanning/push protection are disabled.",
      },
      {
        label: "public-availability warning",
        snippet: "Public availability does not mean a control is configured.",
      },
    ],
  },
  {
    path: ".github/README.md",
    requirements: [
      {
        label: "current public settings guidance",
        snippet:
          "The repository is public, current as observed at 2026-08-24, but public availability does not mean a ruleset, branch protection, security feature, or other hosted enforcement control is configured.",
      },
    ],
  },
  {
    path: "docs/governance/repository-settings.md",
    requirements: [
      {
        label: "point-in-time hosted record warning",
        snippet:
          "which is current as observed at 2026-08-24 and is point-in-time evidence, not a live settings feed.",
      },
      {
        label: "enabled alerts versus disabled automation split",
        snippet:
          "The same read-only observation records dependency/vulnerability alerts enabled. This is distinct from the disabled Dependabot security-update automation.",
      },
      {
        label: "internal-consistency-only freshness boundary",
        snippet:
          "The record is point-in-time only. Its network-free guard proves internal consistency with the committed observation; it cannot prove live freshness.",
      },
      {
        label: "historical VOC-080 boundary",
        snippet:
          "They are not the current hosted state and are not rewritten to resemble the public observation above.",
      },
      {
        label: "prospective controls remain unconfigured",
        snippet:
          "The following are desired mature controls, not configured current state",
      },
      {
        label: "non-blocking settings hold",
        snippet:
          "It does not block repository-only planning, implementation, review, or merge.",
      },
      {
        label: "alerts are current evidence, not prospective",
        snippet:
          "The currently enabled dependency/vulnerability alerts are observed evidence, not a prospective held target.",
      },
      {
        label: "package does not activate prospective controls",
        snippet:
          "None of the prospective controls is enabled by this documentation package; any activation remains under `VOC-085-HOLD-00`.",
      },
      {
        label: "no settings-mutation claim",
        snippet: "This package and this guide perform no settings mutation.",
      },
    ],
  },
  {
    path: "docs/governance/16-autonomous-development-operating-model.md",
    requirements: [
      {
        label: "DOC-16 hosted settings observation boundary",
        snippet:
          "for the hosted settings posture current as observed at 2026-08-24. Neither record is a live settings feed.",
      },
      {
        label: "DOC-16 dependency audit distinction",
        snippet:
          "vulnerability alerts as observed; Dependabot security updates disabled",
      },
      {
        label: "DOC-16 secret scanning distinction",
        snippet:
          "GitHub-hosted secret scanning, push protection, and validity checks disabled as observed at 2026-08-24",
      },
    ],
  },
  {
    path: "docs/operations/cloudflare-delivery.md",
    requirements: [
      {
        label: "delivery guide public observation boundary",
        snippet: "The repository is public, current as observed at 2026-08-24.",
      },
      {
        label: "delivery guide no live inspection claim",
        snippet:
          "covers public visibility and absent branch restrictions; it does not inspect environments or secrets.",
      },
      {
        label: "delivery guide no hosted-config claim",
        snippet:
          "The repository therefore makes no claim that hosted environment approvals, secrets, or branch restrictions are configured.",
      },
      {
        label: "delivery guide held future settings mutation boundary",
        snippet:
          "Any future GitHub settings mutation remains held by `VOC-085-HOLD-00` and requires an immediate governed documentation-only follow-up; Cloudflare delivery activation remains separately held by the VOC-080 holds above.",
      },
    ],
  },
];

function normalizeWhitespace(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .trim();
}

function readRequiredText(repositoryRoot, relativePath, errors) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!existsSync(absolutePath)) {
    errors.push(`${relativePath}: required file is missing`);
    return null;
  }
  return readFileSync(absolutePath, "utf8");
}

function requireSnippet(errors, relativePath, text, label, snippet) {
  if (!normalizeWhitespace(text).includes(normalizeWhitespace(snippet))) {
    errors.push(`${relativePath}: missing ${label}`);
  }
}

function inspectCurrentRecord(repositoryRoot) {
  const errors = [];
  const text = readRequiredText(repositoryRoot, CURRENT_RECORD_PATH, errors);
  if (text === null) return errors;

  for (const { label, snippet } of CURRENT_RECORD_REQUIREMENTS) {
    requireSnippet(errors, CURRENT_RECORD_PATH, text, label, snippet);
  }

  return errors;
}

function inspectActiveDocuments(repositoryRoot) {
  const errors = [];

  for (const {
    path: relativePath,
    requirements,
  } of ACTIVE_DOCUMENT_REQUIREMENTS) {
    const text = readRequiredText(repositoryRoot, relativePath, errors);
    if (text === null) continue;
    for (const { label, snippet } of requirements) {
      requireSnippet(errors, relativePath, text, label, snippet);
    }
  }

  return errors;
}

export function inspectFoundationScripts(packageJsonText) {
  const errors = [];
  let packageJson;

  try {
    packageJson = JSON.parse(packageJsonText);
  } catch {
    return ["package.json: invalid JSON"];
  }

  if (packageJson?.scripts?.["ci:settings-truth"] !== FOUNDATION_COMMAND) {
    errors.push(
      "package.json: ci:settings-truth must run the VOC-085 settings truthfulness validator",
    );
  }

  if (
    !packageJson?.scripts?.["ci:foundation"]?.includes(
      "pnpm run ci:settings-truth",
    )
  ) {
    errors.push(
      "package.json: ci:foundation omits settings truthfulness validation",
    );
  }

  return errors;
}

export function validateSettingsTruth(repositoryRoot) {
  const errors = [];
  const packageJsonText = readRequiredText(
    repositoryRoot,
    "package.json",
    errors,
  );
  if (packageJsonText !== null) {
    errors.push(...inspectFoundationScripts(packageJsonText));
  }
  errors.push(...inspectCurrentRecord(repositoryRoot));
  errors.push(...inspectActiveDocuments(repositoryRoot));
  return errors;
}

function main() {
  const scriptRoot = path.dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = path.resolve(scriptRoot, "../..");
  const errors = validateSettingsTruth(repositoryRoot);
  if (errors.length > 0) {
    console.error(
      `VOC-085 settings truthfulness validation failed with ${errors.length} error(s).`,
    );
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    "VOC-085 settings truthfulness validation passed. Internal consistency only; live freshness is not proven.\n",
  );
}

main();
