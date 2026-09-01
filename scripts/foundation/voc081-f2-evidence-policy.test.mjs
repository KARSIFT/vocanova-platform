import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  DESIGNATED_F2_SURFACES,
  F2_RECORD_PATH,
  PROHIBITED_ACTIVE_TEXT_CLAIMS,
} from "./voc081-f2-evidence-policy.mjs";
import {
  inspectF2Document,
  inspectF2Record,
  inspectF2Scripts,
  inspectF2Surface,
  validateF2Evidence,
} from "./voc081-f2-evidence-policy.mjs";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const record = JSON.parse(
  readFileSync(
    resolve(repositoryRoot, "docs/operations/voc-081-f2-evidence.json"),
    "utf8",
  ),
);
const document = readFileSync(
  resolve(repositoryRoot, "docs/operations/voc-081-f2-evidence.md"),
  "utf8",
);
const clone = (value) => structuredClone(value);
const humanSurfaces = DESIGNATED_F2_SURFACES.filter(
  ({ path: surfacePath }) => surfacePath !== F2_RECORD_PATH,
);

const futureMilestoneState = {
  f2_repository_local: "complete-effective",
  f3_staging: "complete-effective-under-voc-105-evidence",
  f3_current_evidence: "docs/operations/voc-105-f3-evidence.json",
  a1_authenticated_product_acceptance: "unresolved",
  p1_plus_product_acceptance: "unresolved",
  production: "held",
  live_activation: "unresolved-held",
  voc080_holds: ["VOC-080-HOLD-01", "VOC-080-HOLD-02"],
};
const preMilestoneState = {
  f2_repository_local: "complete-effective",
  f3_staging: "unresolved-held",
  a1_authenticated_product_acceptance: "unresolved",
  p1_plus_product_acceptance: "unresolved",
  production: "held",
  live_activation: "unresolved-held",
  voc080_holds: ["VOC-080-HOLD-00", "VOC-080-HOLD-01", "VOC-080-HOLD-02"],
};

function exactJsonValue(value, expected) {
  if (Array.isArray(expected))
    return (
      Array.isArray(value) &&
      value.length === expected.length &&
      expected.every((item, index) => exactJsonValue(value[index], item))
    );
  if (expected && typeof expected === "object")
    return (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === Object.keys(expected).length &&
      Object.keys(expected).every(
        (key) =>
          Object.hasOwn(value, key) &&
          exactJsonValue(value[key], expected[key]),
      )
    );
  return value === expected;
}

function exactProfileForRecord(candidate) {
  const matches = [
    ["pre-voc105", preMilestoneState],
    ["voc105", futureMilestoneState],
  ].filter(([, profile]) =>
    exactJsonValue(candidate?.milestone_state, profile),
  );
  assert.equal(
    matches.length,
    1,
    "record must select one complete exact profile",
  );
  return matches[0][0];
}
const repositoryProfile = exactProfileForRecord(record);

function injectDuplicateMilestoneMember(
  candidate,
  source,
  key,
  duplicateValue,
) {
  const profile = exactProfileForRecord(candidate);
  const profileState =
    profile === "pre-voc105" ? preMilestoneState : futureMilestoneState;
  assert.ok(Object.hasOwn(profileState, key), `selected profile owns ${key}`);
  const escapedKey = JSON.stringify(key);
  const activeValue = JSON.stringify(profileState[key]);
  const escapeExpression = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const memberExpression = new RegExp(
    `${escapeExpression(escapedKey)}[ \\t\\r\\n]*:[ \\t\\r\\n]*${escapeExpression(activeValue)}`,
    "g",
  );
  const members = [...source.matchAll(memberExpression)];
  assert.equal(members.length, 1, `fixture has one active ${key} member`);
  const member = members[0][0];
  const prefix = source.slice(0, members[0].index);
  const suffix = source.slice(members[0].index + member.length);
  const replacement = `${member},\n    ${escapedKey}: ${JSON.stringify(duplicateValue)}`;
  const injected = `${prefix}${replacement}${suffix}`;
  assert.equal(
    injected,
    `${prefix}${replacement}${suffix}`,
    `fixture changes only the selected ${key} member`,
  );
  assert.equal(
    injected.slice(0, prefix.length),
    prefix,
    `fixture preserves the ${key} source prefix byte-for-byte`,
  );
  assert.equal(
    suffix ? injected.slice(-suffix.length) : "",
    suffix,
    `fixture preserves the ${key} source suffix byte-for-byte`,
  );
  assert.notEqual(injected, source, `fixture injects ${key}`);
  assert.equal(
    [...injected.matchAll(new RegExp(escapeExpression(escapedKey), "g"))]
      .length,
    2,
    `fixture has two raw ${key} members`,
  );
  return { source: injected, prefix, suffix };
}

// These literals are copied from the adopted VOC-110 specification, not from
// the validator contract or a preserved downstream worktree.
const planOwnedFutureMarkers = {
  "docs/README.md": {
    required: [
      "The current [VOC-105 record](operations/voc-105-f3-evidence.md) validates every DOC-12 gate item and reports F3 staging foundation complete-effective.",
      "A1/P1+ acceptance, production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.",
    ],
    prohibited: [
      "F3/staging, A1/P1+ acceptance, production, deployment, live activation, and every inherited live-action hold remain unresolved.",
    ],
  },
  "docs/operations/README.md": {
    required: [
      "| RECORD | [VOC-105 F3 staging-foundation evidence](voc-105-f3-evidence.md) | active (F3 complete-effective) | operator | DOC-12, VOC-105 |",
      "The separate VOC-105 record validates every DOC-12 gate item and reports F3 staging foundation complete-effective.",
      "A1/P1+ acceptance remains unresolved and separate.",
      "Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.",
      "VOC-105 later records the exact successful delivery event as one input to the complete F3 gate decision; it performs no new live action.",
    ],
    prohibited: [
      "The record preserves its earlier integration-pending candidate state as history and does not claim F3, A1/P1+ acceptance, staging, production, deployment, or live activation.",
    ],
  },
  "docs/operations/voc-081-f2-evidence.md": {
    required: [
      "This F2 record does **not by itself** claim F3 staging, A1 authenticated-product acceptance, any P1+ product milestone, production readiness, or a public launch.",
      "The later [VOC-105 record](voc-105-f3-evidence.md) validates the separate F3 gate and reports F3 staging foundation complete-effective.",
      "A1/P1+ acceptance remains unresolved; production, learner data, and launch remain held or unresolved under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.",
      "## No-live evidence and current later-gate state",
      "No command or evidence step in this F2 record queried or mutated Cloudflare, DNS, a server, Sentry, repository settings, a secret, or production learner data.",
      "No F2 deployment occurred and no F2 deployment URL was expected.",
      "Later exact evidence in VOC-105 reports F3 staging foundation complete-effective.",
      "A1/P1+ acceptance remains unresolved; production readiness and traffic, learner-data access, and public launch remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.",
    ],
    prohibited: [
      "This record does **not** claim F3 staging, A1 authenticated-product acceptance, any P1+ product milestone, production readiness, a public launch, or a deployment.",
      "`VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held.",
      "## No-live and later-gate state",
      "No command or evidence step queries or mutates Cloudflare, DNS, a server, Sentry, repository settings, a secret, or production learner data.",
      "No deployment occurred and no deployment URL is expected.",
      "F3/staging, A1/P1+ acceptance, production, live activation, and every inherited VOC-080 hold remain unresolved/held.",
    ],
  },
  "docs/product/README.md": {
    required: [
      "The [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) separately validates every DOC-12 F3 gate item and reports the F3 staging foundation complete-effective.",
      "A1/P1+ acceptance remains unresolved and is a separate future outcome.",
      "Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `VOC-080-HOLD-02` remain held.",
    ],
    prohibited: [
      "F3, A1/P1+ acceptance, staging, production, deployment, and live activation remain unresolved and are not implied.",
    ],
  },
  "docs/product/12-mvp-implementation-plan.md": {
    required: [
      "The current [VOC-105 evidence record](../operations/voc-105-f3-evidence.md) validates every F3 gate item and reports the F3 staging foundation complete-effective.",
      "A1/P1+ product acceptance remains unresolved and is a separate future outcome.",
      "Production readiness and traffic, learner-data access, and public launch remain unresolved or held; `VOC-080-HOLD-01` and `HOLD-02` remain held.",
      "The later exact successful delivery event is recorded separately by VOC-105 and is only one input to its F3 gate decision.",
      "`VOC-080-HOLD-01` and `HOLD-02` remain fully unresolved and unchanged.",
      "VOC-105's separate gate evaluation reports F3 staging foundation complete-effective; the successful delivery run alone did not establish that result.",
      "A1/P1+ acceptance remains unresolved.",
      "Production readiness and traffic, learner-data access, and public launch remain unresolved or held under `VOC-080-HOLD-01` and `VOC-080-HOLD-02`.",
    ],
    prohibited: [
      "At their remaining action boundaries, F3 staging, A1/P1+ product acceptance, production, deployment, live activation, and `VOC-080-HOLD-00` through `HOLD-02` remain unresolved/held.",
      "F3, A1/P1+ acceptance beyond the Phase-1 resource/rollback proof, ordinary staging workflow delivery, production, and live product activation remain unresolved.",
    ],
  },
};

// These are literal preserved sources from the adopted VOC-111 plan.  They are
// deliberately not derived from the active checkout or validator exports.
const planOwnedPreMarkers = {
  "docs/README.md": [
    "[VOC-081's F2 record](operations/voc-081-f2-evidence.md)",
    "complete stack was integrated by PR #108 and passed post-merge revalidation",
    "repository/local F2 is complete and effective",
    "F3/staging, A1/P1+ acceptance",
    "production, deployment, live activation",
    "every inherited live-action hold\n  remain unresolved",
  ],
  "docs/operations/README.md": [
    "active (repository/local F2 complete)",
    "complete stack was integrated by PR #108 and passed post-merge",
    "repository/local F2 is complete and effective",
    "earlier integration-pending candidate state as history",
    "does not claim F3,",
    "A1/P1+ acceptance, staging, production, deployment, or live activation",
  ],
  "docs/operations/voc-081-f2-evidence.md": [
    "This is the machine-checked active record",
    "Repository/local F2 is complete and effective",
    "## Exact integration evidence",
    "## Historical candidate state",
    "## No-live and later-gate state",
    "F3/staging, A1/P1+ acceptance, production, live",
    "remain unresolved/held",
    "`VOC-080-HOLD-00`, `VOC-080-HOLD-01`, and `VOC-080-HOLD-02` remain held.",
    "No deployment occurred and no deployment URL is expected.",
  ],
  "docs/product/README.md": [
    "VOC-081 supplies the contributor-verifiable F2 foundation",
    "integrated by PR #108 and passed post-merge revalidation",
    "F2 complete and effective",
    "preserving the earlier candidate state as history",
    "F3, A1/P1+ acceptance, staging, production, deployment, and live activation remain",
    "unresolved and are not implied",
  ],
  "docs/product/12-mvp-implementation-plan.md": [
    "PR #108 integrated the complete VOC-081 stack and final evidence",
    "Repository/local\nF2 is therefore complete and effective",
    "candidate-era state remains historical evidence",
    "F3 staging, A1/P1+",
    "product acceptance, production, deployment, live activation, and",
    "remain unresolved/held",
    "`VOC-080-HOLD-00` through `HOLD-02` remain unresolved/held",
  ],
};
const planOwnedF2SupportMarkers = [
  "# VOC-081 F2 Repository/Local Evidence Record",
  "## Acceptance boundary",
  "## Exact task evidence",
  "## Command and CI contract",
  "## Local shape and limitations",
  "## Rollback status",
  "repository-local-f2-candidate-integration-pending",
  "Native Windows behavior is not claimed",
  ".wrangler/state/vocanova-local",
  "a8694932671ad9c44fd2a97c128b14e6089e5faf",
  "36d526bdec83e28b17aa30a6814d42b92f058ec1",
  "5383790286",
  "5385582178",
  "5383822937",
  "32612887965",
  "32634344456",
  "32612888017",
  "32612888012",
  "32634654242",
  "32634654225",
  "not-applicable-push-path-filter",
  "32634654343",
  "9b0e90fcd89469763c9874a5b0ef951e4d76149d",
  "https://github.com/KARSIFT/vocanova-platform/pull/103",
  "aae4473d1072517b40e42bbb0dc4e992c37c16b5",
  "https://github.com/KARSIFT/vocanova-platform/pull/104",
  "38d8c27b64557e8e8bc58bb05ea3c2cd858e1136",
  "https://github.com/KARSIFT/vocanova-platform/pull/106",
  "ca7596cb72128e5fa47483a65678773a6968dd79",
  "https://github.com/KARSIFT/vocanova-platform/pull/107",
  "VOC-080-HOLD-01",
  "VOC-080-HOLD-02",
];

function normalizeAsciiWhitespace(source) {
  return source
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\n\f\v]+/g, " ")
    .replace(/^[ \t\n\f\v]+|[ \t\n\f\v]+$/g, "");
}

function whitespaceExpression(marker) {
  return normalizeAsciiWhitespace(marker)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replaceAll(" ", "[ \\t\\n\\f\\v]+");
}

function removeNormalizedMarker(source, marker) {
  return source.replace(new RegExp(whitespaceExpression(marker), "g"), "");
}

function joinFixtureLines(lines) {
  return `${[...new Set(lines)].join("\n")}\n`;
}

function planOwnedSource(surface, profile) {
  const pre = planOwnedPreMarkers[surface.path];
  const future = planOwnedFutureMarkers[surface.path].required;
  const lines = (profile === "pre-voc105" ? pre : future).filter(
    (line) =>
      !(
        surface.path === "docs/product/12-mvp-implementation-plan.md" &&
        line === "remain unresolved/held"
      ),
  );
  return joinFixtureLines(
    surface.path === "docs/operations/voc-081-f2-evidence.md"
      ? [
          ...lines,
          ...(profile === "voc105"
            ? [
                "This is the machine-checked active record",
                "Repository/local F2 is complete and effective",
                "## Exact integration evidence",
                "## Historical candidate state",
              ]
            : []),
          ...planOwnedF2SupportMarkers,
        ]
      : lines,
  );
}

function futureSource(source, surface) {
  const markers = planOwnedFutureMarkers[surface.path];
  let result = source;
  for (const marker of markers.prohibited) {
    result = removeNormalizedMarker(result, marker);
  }
  for (const marker of markers.required) {
    if (
      !normalizeAsciiWhitespace(result).includes(
        normalizeAsciiWhitespace(marker),
      )
    ) {
      result += `\n${marker}\n`;
    }
  }
  return result;
}

function installSyntheticProfile(
  fixture,
  profile,
  reorderObjectMembers = false,
) {
  const futureRecord = clone(record);
  futureRecord.milestone_state =
    profile === "voc105" && reorderObjectMembers
      ? {
          voc080_holds: ["VOC-080-HOLD-01", "VOC-080-HOLD-02"],
          live_activation: "unresolved-held",
          production: "held",
          p1_plus_product_acceptance: "unresolved",
          a1_authenticated_product_acceptance: "unresolved",
          f3_current_evidence: "docs/operations/voc-105-f3-evidence.json",
          f3_staging: "complete-effective-under-voc-105-evidence",
          f2_repository_local: "complete-effective",
        }
      : clone(profile === "voc105" ? futureMilestoneState : preMilestoneState);
  writeFileSync(
    join(fixture, F2_RECORD_PATH),
    `${JSON.stringify(futureRecord, null, 2)}\n`,
  );
  for (const surface of humanSurfaces) {
    writeFileSync(
      join(fixture, surface.path),
      planOwnedSource(surface, profile),
    );
  }
}

function installFutureProfile(fixture, reorderObjectMembers = false) {
  installSyntheticProfile(fixture, "voc105", reorderObjectMembers);
}

// This negative-test corpus is intentionally owned by the test module rather
// than generated from the validator's production patterns or examples.
const TEXT_VARIANT_CORPUS = [
  {
    example: "Staging is complete.",
    reason: "active F3/staging claim is prohibited",
  },
  {
    example: "P5 product acceptance passed.",
    reason: "active A1/P1+ acceptance claim is prohibited",
  },
  {
    example: "Production is active.",
    reason: "active production/deployment claim is prohibited",
  },
  {
    example: "Live verification passed.",
    reason: "active live-activation/verification claim is prohibited",
  },
  {
    example: "All VOC-080 holds are released.",
    reason: "VOC-080 hold release claim is prohibited",
  },
  {
    example: "Repository/local F2 is still pending integration.",
    reason: "active repository/local F2 pending claim is prohibited",
  },
];

function repositoryFixture(mutate) {
  const fixture = mkdtempSync(join(tmpdir(), "voc086-f2-evidence-"));
  cpSync(repositoryRoot, fixture, {
    recursive: true,
    filter: (source) => source !== join(repositoryRoot, "node_modules"),
  });
  try {
    mutate(fixture);
    return validateF2Evidence(fixture);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
}

function syntheticRepositoryFixture(
  profile,
  mutate,
  reorderObjectMembers = false,
) {
  return repositoryFixture((fixture) => {
    installSyntheticProfile(fixture, profile, reorderObjectMembers);
    mutate?.(fixture);
  });
}

test("the accepted VOC-081 repository/local F2 record is internally consistent", () => {
  assert.deepEqual(validateF2Evidence(repositoryRoot), []);
});

test("task omission, stale revision, or noncanonical evidence fails closed", () => {
  const missing = clone(record);
  missing.tasks.pop();
  assert.ok(
    inspectF2Record(missing).some((error) => error.includes("exactly T00")),
  );

  const stale = clone(record);
  stale.tasks[2].exact_sha = "0".repeat(40);
  assert.ok(
    inspectF2Record(stale).some((error) => error.includes("T02 exact")),
  );

  const foreign = clone(record);
  foreign.tasks[3].hosted_evidence = "https://example.test/evidence";
  assert.ok(
    inspectF2Record(foreign).some((error) =>
      error.includes("canonical pull request"),
    ),
  );
});

test("stale F2 status, later-gate release, or external effect fails closed", () => {
  const stale = clone(record);
  stale.status = "repository-local-f2-candidate-integration-pending";
  stale.milestone_state.f3_staging = "passed";
  stale.external_effects.deployment_performed = true;
  const errors = inspectF2Record(stale);
  assert.ok(errors.some((error) => error.includes("completion")));
  assert.ok(errors.some((error) => error.includes("milestone/hold")));
  assert.ok(errors.some((error) => error.includes("deployment_performed")));
});

test("platform, local-state, command, and rollback drift fails closed", () => {
  const drifted = clone(record);
  drifted.local_contract.native_windows_verified = true;
  drifted.local_contract.developer_state = ".wrangler";
  drifted.validated_commands.pop();
  drifted.rollback.status = "skipped";
  const errors = inspectF2Record(drifted);
  assert.ok(errors.some((error) => error.includes("platform limitation")));
  assert.ok(errors.some((error) => error.includes("commands")));
  assert.ok(errors.some((error) => error.includes("rollback")));
});

test("the human record carries the exact boundary and limitation markers", () => {
  assert.deepEqual(inspectF2Document(document, record), []);
  assert.ok(
    inspectF2Document(
      document.replace(
        "Native Windows behavior is not claimed",
        "Windows passes",
      ),
      record,
    ).some((error) => error.includes("Native Windows")),
  );
});

test("every designated living F2 surface has a precise active contract", () => {
  for (const surface of DESIGNATED_F2_SURFACES) {
    const source = readFileSync(resolve(repositoryRoot, surface.path), "utf8");
    assert.deepEqual(
      inspectF2Surface(source, surface.path, repositoryProfile),
      [],
    );

    for (const marker of [
      ...(surface.immutableRequired ?? []),
      ...(surface.profiles[repositoryProfile]?.required ?? []),
    ]) {
      const mutated = removeNormalizedMarker(source, marker);
      assert.notEqual(mutated, source);
      const errors = inspectF2Surface(mutated, surface.path, repositoryProfile);
      assert.ok(
        errors.some(
          (error) =>
            error.includes(`current ${repositoryProfile} marker`) ||
            error.includes("missing immutable F2 marker"),
        ),
        `${surface.path} must fail when marker ${marker} is removed`,
      );
    }

    for (const [marker, reason] of surface.stale) {
      const errors = inspectF2Surface(`${source}\n${marker}`, surface.path);
      assert.ok(
        errors.some((error) => error.includes(reason)),
        `${surface.path} must reject stale marker ${marker}`,
      );
    }
  }
});

test("every human-text surface rejects each contradictory active claim", () => {
  for (const surface of DESIGNATED_F2_SURFACES.filter(
    ({ path: surfacePath }) => surfacePath !== F2_RECORD_PATH,
  )) {
    const source = readFileSync(resolve(repositoryRoot, surface.path), "utf8");
    for (const claim of PROHIBITED_ACTIVE_TEXT_CLAIMS) {
      const errors = inspectF2Surface(
        `${source}\n${claim.example}`,
        surface.path,
      );
      assert.ok(
        errors.some((error) => error.includes(claim.reason)),
        `${surface.path} must reject ${claim.example}`,
      );
    }
  }
});

test("the independent text variant corpus fails on every human surface", () => {
  for (const surface of DESIGNATED_F2_SURFACES.filter(
    ({ path: surfacePath }) => surfacePath !== F2_RECORD_PATH,
  )) {
    const source = readFileSync(resolve(repositoryRoot, surface.path), "utf8");
    for (const variant of TEXT_VARIANT_CORPUS) {
      const errors = inspectF2Surface(
        `${source}\n${variant.example}`,
        surface.path,
      );
      assert.ok(
        errors.some((error) => error.includes(variant.reason)),
        `${surface.path} must reject independent variant ${variant.example}`,
      );
    }
  }
});

test("exact integration evidence fails closed one field at a time", () => {
  for (const field of [
    "pull_request",
    "final_head_sha",
    "merge_sha",
    "review_evidence",
    "hosted_evidence",
    "rollback_failure_evidence",
    "hosted_runs",
    "post_merge_runs",
  ]) {
    const malformed = clone(record);
    delete malformed.current_acceptance[field];
    assert.ok(
      inspectF2Record(malformed).some((error) =>
        error.includes("current acceptance evidence"),
      ),
      `missing current_acceptance.${field} must fail closed`,
    );
  }
});

test("later-gate promotion, hold release, and external effects fail independently", () => {
  for (const field of [
    "f3_staging",
    "a1_authenticated_product_acceptance",
    "p1_plus_product_acceptance",
    "production",
    "live_activation",
  ]) {
    const promoted = clone(record);
    promoted.milestone_state[field] = "passed";
    assert.ok(
      inspectF2Record(promoted).some((error) =>
        error.includes("milestone/hold"),
      ),
      `${field} promotion must fail closed`,
    );
  }

  const released = clone(record);
  released.milestone_state.voc080_holds.pop();
  assert.ok(
    inspectF2Record(released).some((error) => error.includes("milestone/hold")),
  );

  for (const field of [
    "cloudflare_queried_or_mutated",
    "dns_queried_or_mutated",
    "server_queried_or_mutated",
    "sentry_queried",
    "repository_settings_mutated",
    "secret_or_production_data_used",
    "deployment_performed",
    "deployment_url_expected",
  ]) {
    const effect = clone(record);
    effect.external_effects[field] = true;
    assert.ok(
      inspectF2Record(effect).some((error) =>
        error.includes(`external_effects.${field}`),
      ),
      `${field} must fail closed`,
    );
  }
});

test("malformed JSON and omitted designated surfaces fail through the aggregate", () => {
  for (const { path: surfacePath } of DESIGNATED_F2_SURFACES) {
    const missing = repositoryFixture((fixture) => {
      unlinkSync(join(fixture, surfacePath));
    });
    assert.ok(
      missing.some((error) =>
        error.includes(`${surfacePath}: designated F2 surface is missing`),
      ),
      `${surfacePath} omission must fail through the aggregate`,
    );
  }

  const malformed = repositoryFixture((fixture) => {
    writeFileSync(join(fixture, F2_RECORD_PATH), "{ malformed json\n");
  });
  assert.ok(
    malformed.some((error) =>
      error.includes(`${F2_RECORD_PATH}: cannot read valid JSON`),
    ),
  );
});

test("current and historical status conflation fails independently", () => {
  const pendingCurrent = clone(record);
  pendingCurrent.status = "repository-local-f2-candidate-integration-pending";
  assert.ok(
    inspectF2Record(pendingCurrent).some((error) =>
      error.includes("F2 task/status must report repository/local completion"),
    ),
  );

  const completedHistory = clone(record);
  completedHistory.candidate_history.status =
    "repository-local-f2-complete-effective";
  assert.ok(
    inspectF2Record(completedHistory).some((error) =>
      error.includes(
        "candidate-era status and condition must remain historical",
      ),
    ),
  );
});

test("the exact adopted VOC-105 current-state profile passes atomically", () => {
  for (const reorderObjectMembers of [false, true]) {
    const errors = syntheticRepositoryFixture(
      "voc105",
      undefined,
      reorderObjectMembers,
    );
    assert.deepEqual(errors, []);
  }
  assert.deepEqual(syntheticRepositoryFixture("pre-voc105"), []);
});

test("current-state JSON accepts only the two exact profiles", () => {
  const mutations = [
    (value) => delete value.f3_current_evidence,
    (value) => delete value.production,
    (value) => {
      value.unknown = "held";
    },
    (value) => {
      value.f3_staging = "passed";
    },
    (value) => {
      value.f3_current_evidence = "docs/operations/not-voc105.json";
    },
    (value) => {
      value.voc080_holds = ["VOC-080-HOLD-02", "VOC-080-HOLD-01"];
    },
    (value) => {
      value.voc080_holds = ["VOC-080-HOLD-01"];
    },
    (value) => {
      value.voc080_holds = ["VOC-080-HOLD-02"];
    },
    (value) => {
      value.production = ["held"];
    },
  ];
  for (const mutate of mutations) {
    const candidate = clone(record);
    candidate.milestone_state = clone(futureMilestoneState);
    mutate(candidate.milestone_state);
    assert.ok(
      inspectF2Record(candidate).some((error) =>
        error.includes("milestone/hold"),
      ),
    );
  }
});

test("test-owned live-profile selection is complete, order-insensitive, and fail closed", () => {
  const profiles = [
    ["pre-voc105", preMilestoneState],
    ["voc105", futureMilestoneState],
  ];
  const assertNoProfile = (label, milestone_state) =>
    assert.throws(
      () => exactProfileForRecord({ milestone_state }),
      /one complete exact profile/,
      label,
    );

  for (const [profile, state] of profiles) {
    assert.equal(exactProfileForRecord({ milestone_state: state }), profile);
    assert.equal(
      exactProfileForRecord({
        milestone_state: Object.fromEntries(
          [...Object.entries(state)].reverse(),
        ),
      }),
      profile,
      `${profile} object member order is non-semantic`,
    );
    for (const [key, value] of Object.entries(state)) {
      const without = clone(state);
      delete without[key];
      assertNoProfile(`${profile} omits ${key}`, without);

      const renamed = clone(state);
      renamed[`renamed_${key}`] = renamed[key];
      delete renamed[key];
      assertNoProfile(`${profile} renames ${key}`, renamed);

      const wrongType = clone(state);
      wrongType[key] = Array.isArray(value) ? "wrong-type" : [value];
      assertNoProfile(`${profile} changes ${key} type`, wrongType);

      if (Array.isArray(value)) {
        const reorderedHolds = clone(state);
        reorderedHolds[key] = [...value].reverse();
        assertNoProfile(`${profile} reorders ${key}`, reorderedHolds);

        const changedHold = clone(state);
        changedHold[key] = [...value];
        changedHold[key][0] = "VOC-080-HOLD-XX";
        assertNoProfile(`${profile} changes one ${key} value`, changedHold);
      } else {
        const wrongValue = clone(state);
        wrongValue[key] = `${value}-wrong`;
        assertNoProfile(`${profile} changes ${key} scalar value`, wrongValue);
      }
    }
    const unknown = clone(state);
    unknown.unknown = "held";
    assertNoProfile(`${profile} adds an unknown key`, unknown);
  }

  for (const [label, milestone_state] of [
    ["null", null],
    ["array", []],
    ["primitive", "pre-voc105"],
    ["missing", undefined],
  ])
    assertNoProfile(`rejects ${label} milestone_state`, milestone_state);
});

test("plan-owned pre and VOC-105 sources pass, then fail one required marker at a time", () => {
  for (const profile of ["pre-voc105", "voc105"]) {
    const profileRecord = clone(record);
    profileRecord.milestone_state = clone(
      profile === "pre-voc105" ? preMilestoneState : futureMilestoneState,
    );
    for (const surface of humanSurfaces) {
      const source = planOwnedSource(surface, profile);
      assert.deepEqual(
        inspectF2Surface(source, surface.path, profile),
        [],
        `${surface.path} ${profile} literal source must pass`,
      );
      if (surface.path === "docs/operations/voc-081-f2-evidence.md")
        assert.deepEqual(inspectF2Document(source, profileRecord), []);
      const required =
        profile === "pre-voc105"
          ? planOwnedPreMarkers[surface.path]
          : planOwnedFutureMarkers[surface.path].required;
      for (const marker of required) {
        const mutated = removeNormalizedMarker(source, marker);
        assert.notEqual(mutated, source, `${surface.path} removes ${marker}`);
        assert.ok(
          inspectF2Surface(mutated, surface.path, profile).some((error) =>
            error.includes(`current ${profile} marker`),
          ),
          `${surface.path} ${profile} must reject removed ${marker}`,
        );
      }
    }
  }
});

test("raw duplicate JSON keys and the VOC-105 evidence pointer fail before parsing", () => {
  for (const [profile, key, duplicateValue] of [
    ["pre-voc105", "f3_staging", "passed"],
    ["voc105", "f3_staging", "passed"],
    ["voc105", "f3_current_evidence", "docs/operations/other.json"],
  ]) {
    const errors = syntheticRepositoryFixture(profile, (fixture) => {
      const recordPath = join(fixture, F2_RECORD_PATH);
      const source = readFileSync(recordPath, "utf8");
      const candidate = JSON.parse(source);
      const injection = injectDuplicateMilestoneMember(
        candidate,
        source,
        key,
        duplicateValue,
      );
      assert.equal(
        injection.source.slice(0, injection.prefix.length),
        injection.prefix,
        `${profile} ${key} preserves the source prefix`,
      );
      assert.equal(
        injection.suffix
          ? injection.source.slice(-injection.suffix.length)
          : "",
        injection.suffix,
        `${profile} ${key} preserves the source suffix`,
      );
      writeFileSync(recordPath, injection.source);
    });
    assert.ok(
      errors.some((error) =>
        error.includes(`duplicate raw JSON key is prohibited: ${key}`),
      ),
      `${profile} duplicate ${key} must fail before parsed record validation`,
    );
  }
});

test("current-state JSON rejects every key mutation class one invariant at a time", () => {
  for (const key of Object.keys(futureMilestoneState)) {
    for (const mutate of [
      (value) => delete value[key],
      (value) => {
        value[`renamed_${key}`] = value[key];
        delete value[key];
      },
      (value) => {
        value[key] = Array.isArray(value[key]) ? [] : "wrong";
      },
      (value) => {
        value[key] = [value[key]];
      },
    ]) {
      const candidate = clone(record);
      candidate.milestone_state = clone(futureMilestoneState);
      mutate(candidate.milestone_state);
      assert.ok(
        inspectF2Record(candidate).some((error) =>
          error.includes("milestone/hold"),
        ),
        `${key} mutation must fail`,
      );
    }
  }
});

test("future markers are active-only, normalized, unique, and history exclusion is exact", () => {
  const f2Surface = humanSurfaces.find(
    ({ path: surfacePath }) =>
      surfacePath === "docs/operations/voc-081-f2-evidence.md",
  );
  const future = planOwnedSource(f2Surface, "voc105");
  const requiredMarker = planOwnedFutureMarkers[f2Surface.path].required[1];
  const withoutRequired = removeNormalizedMarker(future, requiredMarker);
  const historyStart = withoutRequired.indexOf("## Historical candidate state");
  const nextHeading = withoutRequired.indexOf("\n## ", historyStart + 1);
  const onlyHistory = `${withoutRequired.slice(0, nextHeading)}\n${requiredMarker}${withoutRequired.slice(nextHeading)}`;
  assert.ok(
    inspectF2Surface(onlyHistory, f2Surface.path, "voc105").some((error) =>
      error.includes("current voc105 marker"),
    ),
  );
  const exactHistory = future.replace(
    "## Historical candidate state",
    "## Historical candidate state\nRepository/local F2 still pending integration.",
  );
  assert.deepEqual(
    inspectF2Surface(exactHistory, f2Surface.path, "voc105"),
    [],
  );
  const prohibitedInHistory = exactHistory.replace(
    "Repository/local F2 still pending integration.",
    `Repository/local F2 still pending integration.\n${planOwnedFutureMarkers[f2Surface.path].prohibited[0]}`,
  );
  assert.ok(
    inspectF2Surface(prohibitedInHistory, f2Surface.path, "voc105").some(
      (error) => error.includes("prohibited voc105 marker"),
    ),
  );
  const nearHistory = exactHistory.replace(
    "## Historical candidate state",
    "## Historical candidate state (near match)",
  );
  assert.ok(
    inspectF2Surface(nearHistory, f2Surface.path, "voc105").some((error) =>
      error.includes("pending claim"),
    ),
  );

  for (const surface of humanSurfaces) {
    const source = planOwnedSource(surface, "voc105");
    const markers = planOwnedFutureMarkers[surface.path];
    assert.ok(
      inspectF2Surface(
        `${source}\n${markers.required[0]}`,
        surface.path,
        "voc105",
      ).some((error) => error.includes("must occur exactly once")),
      `${surface.path} must reject a duplicate required marker`,
    );
    assert.ok(
      inspectF2Surface(
        `${source}\n${markers.prohibited[0]}`,
        surface.path,
        "voc105",
      ).some((error) => error.includes("prohibited voc105 marker")),
      `${surface.path} must reject a retained prohibited marker`,
    );
  }

  const normalizationBase = planOwnedSource(humanSurfaces[0], "voc105");
  for (const replacement of [" \t\r\n", "\r", "\f", "\v"]) {
    assert.deepEqual(
      inspectF2Surface(
        normalizationBase.replaceAll(" ", replacement),
        "docs/README.md",
        "voc105",
      ),
      [],
    );
  }
});

test("every human surface rejects profile hybrids in either direction", () => {
  for (const surface of humanSurfaces) {
    const baseline = planOwnedSource(surface, "pre-voc105");
    const future = planOwnedSource(surface, "voc105");
    const futureErrors = inspectF2Surface(future, surface.path, "voc105");
    assert.deepEqual(
      futureErrors,
      [],
      `${surface.path} future profile must pass`,
    );

    const futureMarker =
      planOwnedFutureMarkers[surface.path].required[
        surface.path === "docs/operations/voc-081-f2-evidence.md" ? 1 : 0
      ];
    const futureToPre = removeNormalizedMarker(future, futureMarker);
    assert.ok(
      inspectF2Surface(futureToPre, surface.path, "voc105").some((error) =>
        error.includes("current voc105 marker"),
      ),
      `${surface.path} must reject one missing VOC-105 marker`,
    );

    const preMarker = planOwnedPreMarkers[surface.path][0];
    const preToFuture = `${baseline}\n${futureMarker}\n`;
    assert.ok(
      inspectF2Surface(preToFuture, surface.path, "pre-voc105").some(
        (error) =>
          error.includes("current pre-voc105 marker") ||
          error.includes("prohibited"),
      ),
      `${surface.path} must reject a pre-VOC-105/VOC-105 hybrid`,
    );
    assert.notEqual(preMarker, futureMarker);
  }
});

test("repository-wide profile hybrids fail one surface at a time in both directions", () => {
  for (const surface of humanSurfaces) {
    const futureToPre = syntheticRepositoryFixture("voc105", (fixture) => {
      const before = Object.fromEntries(
        humanSurfaces.map(({ path: surfacePath }) => [
          surfacePath,
          readFileSync(join(fixture, surfacePath), "utf8"),
        ]),
      );
      writeFileSync(
        join(fixture, surface.path),
        planOwnedSource(surface, "pre-voc105"),
      );
      assert.notEqual(
        readFileSync(join(fixture, surface.path), "utf8"),
        before[surface.path],
      );
      for (const other of humanSurfaces.filter(
        ({ path }) => path !== surface.path,
      ))
        assert.equal(
          readFileSync(join(fixture, other.path), "utf8"),
          before[other.path],
        );
    });
    assert.ok(
      futureToPre.some((error) => error.startsWith(`${surface.path}:`)),
      `${surface.path} stale pre-VOC-105 surface must fail the future repository`,
    );

    const preToFuture = syntheticRepositoryFixture("pre-voc105", (fixture) => {
      const before = Object.fromEntries(
        humanSurfaces.map(({ path: surfacePath }) => [
          surfacePath,
          readFileSync(join(fixture, surfacePath), "utf8"),
        ]),
      );
      writeFileSync(
        join(fixture, surface.path),
        planOwnedSource(surface, "voc105"),
      );
      assert.notEqual(
        readFileSync(join(fixture, surface.path), "utf8"),
        before[surface.path],
      );
      for (const other of humanSurfaces.filter(
        ({ path }) => path !== surface.path,
      ))
        assert.equal(
          readFileSync(join(fixture, other.path), "utf8"),
          before[other.path],
        );
    });
    assert.ok(
      preToFuture.some((error) => error.startsWith(`${surface.path}:`)),
      `${surface.path} VOC-105 surface must fail the pre-VOC-105 repository`,
    );
  }
});

function claimsFor(subjects, verbs, copulas = [""]) {
  return subjects.flatMap((subject) =>
    verbs.flatMap((verb) =>
      copulas.map(
        (copula) => `${subject} ${copula ? `${copula} ` : ""}${verb}.`,
      ),
    ),
  );
}

test("the complete later-claim matrix fails once on every human surface", () => {
  const f3Claims = claimsFor(
    ["F3", "F3 staging", "staging"],
    [
      "complete",
      "completed",
      "passed",
      "accepted",
      "active",
      "released",
      "enabled",
      "effective",
      "resolved",
    ],
    ["", "is"],
  );
  const acceptanceClaims = claimsFor(
    [
      "A1",
      "A1/P1",
      "A1/P1+",
      "A1 authenticated-product",
      "P1",
      "P1+",
      "P2",
      "P3",
      "P4",
      "P5",
      "P1-P5",
      "P2-P5",
      "P3-P5",
      "P4-P5",
      "P5-P5",
    ]
      .flatMap((identifier) => [
        `${identifier} acceptance`,
        `${identifier} product acceptance`,
      ])
      .concat(
        ["R1", "R2", "L1"].flatMap((identifier) => [
          `${identifier} acceptance`,
          `${identifier} product acceptance`,
        ]),
      ),
    [
      "complete",
      "completed",
      "passed",
      "accepted",
      "active",
      "effective",
      "resolved",
    ],
    ["", "is"],
  );
  const productionClaims = claimsFor(
    ["deployment", "production deployment", "production"],
    [
      "complete",
      "completed",
      "passed",
      "accepted",
      "active",
      "enabled",
      "released",
      "effective",
      "resolved",
    ],
    ["", "is"],
  );
  const liveClaims = claimsFor(
    ["live activation", "live verification", "live system", "live service"],
    [
      "complete",
      "completed",
      "passed",
      "accepted",
      "active",
      "enabled",
      "released",
      "verified",
      "effective",
      "resolved",
    ],
    ["", "is"],
  );
  const holdClaims = [
    ...claimsFor(
      [
        "VOC-080 hold",
        "VOC-080 holds",
        "all VOC-080 hold",
        "all VOC-080 holds",
      ],
      [
        "released",
        "cleared",
        "lifted",
        "complete",
        "completed",
        "passed",
        "accepted",
        "active",
        "enabled",
        "effective",
        "resolved",
      ],
      ["", "are", "is"],
    ),
    ...claimsFor(
      ["VOC-080-HOLD-00", "VOC-080-HOLD-01", "VOC-080-HOLD-02"],
      [
        "released",
        "cleared",
        "lifted",
        "complete",
        "completed",
        "passed",
        "accepted",
        "active",
        "enabled",
        "effective",
        "resolved",
      ],
      ["", "is"],
    ),
  ];
  const f2Claims = ["", "is", "remains"].flatMap((copula) =>
    ["", "still"].flatMap((still) =>
      ["pending", "pending integration", "incomplete", "candidate"].map(
        (state) =>
          `Repository/local F2 ${copula ? `${copula} ` : ""}${still ? `${still} ` : ""}${state}.`,
      ),
    ),
  );
  const boundaryClaims = claimsFor(
    [
      "product acceptance",
      "production readiness",
      "production traffic",
      "learner-data access",
      "learner data access",
      "public launch",
    ],
    [
      "complete",
      "completed",
      "passed",
      "accepted",
      "active",
      "enabled",
      "released",
      "verified",
      "effective",
      "resolved",
    ],
    ["", "is"],
  );
  const claims = [
    ...f3Claims,
    ...acceptanceClaims,
    ...productionClaims,
    ...liveClaims,
    ...holdClaims,
    ...f2Claims,
    ...boundaryClaims,
    "pRoDuCt AcCePtAnCe is ReSoLvEd.",
    "a1 product acceptance is passed.",
    "P1+ PrOdUcT AcCePtAnCe effective.",
    "r2 AcCePtAnCe is completed.",
    "Repository/local f2 remains still pending integration.",
    "REPOSITORY/LOCAL F2 CANDIDATE.",
    "PRODUCTION readiness EFFECTIVE.",
    "Production Traffic is verified.",
    "LeArNeR-DaTa AcCeSs active.",
    "PUBLIC launch is complete.",
  ];
  for (const surface of humanSurfaces) {
    const source = futureSource(
      readFileSync(resolve(repositoryRoot, surface.path), "utf8"),
      surface,
    );
    for (const claim of claims) {
      assert.ok(
        inspectF2Surface(`${source}\n${claim}`, surface.path, "voc105").some(
          (error) => error.includes("claim is prohibited"),
        ),
        `${surface.path} must reject ${claim}`,
      );
    }
  }
});

test("production claim matching excludes verified while live and generic checks retain it", () => {
  const source = readFileSync(
    resolve(repositoryRoot, "docs/README.md"),
    "utf8",
  );
  assert.ok(
    !inspectF2Surface(
      `${source}\nProduction is verified.`,
      "docs/README.md",
    ).some((error) => error.includes("production/deployment claim")),
  );
  const future = futureSource(source, humanSurfaces[0]);
  assert.ok(
    inspectF2Surface(
      `${future}\nLive service is verified.`,
      "docs/README.md",
      "voc105",
    ).some((error) => error.includes("live-activation/verification claim")),
  );
  assert.ok(
    inspectF2Surface(
      `${future}\nProduction readiness is verified.`,
      "docs/README.md",
      "voc105",
    ).some((error) => error.includes("later-milestone boundary claim")),
  );
});

const foundationPrefix = [
  "pnpm run validate:workspace",
  "pnpm run format:check",
  "pnpm run build:packages",
  "pnpm run ci:retirement",
  "pnpm run ci:final-evidence",
  "pnpm run ci:f2-evidence",
  "pnpm run ci:closure-consistency",
  "pnpm run ci:settings-truth",
];
const foundationTest = "node --test scripts/foundation/*.test.mjs";
const baselineDefinitions = {
  "validate:workspace": "node scripts/foundation/validate-workspace.mjs",
  "format:check":
    "prettier --check package.json pnpm-workspace.yaml eslint.config.js apps/web apps/api-worker packages scripts/foundation infrastructure docs/development.md",
  "build:packages":
    "tsc -b packages/api-client packages/design-tokens --pretty false",
  "ci:retirement": "node scripts/foundation/server-retirement-policy.mjs",
  "ci:final-evidence":
    "node scripts/foundation/voc080-final-evidence-policy.mjs",
  "ci:f2-evidence": "node scripts/foundation/voc081-f2-evidence-policy.mjs",
  "ci:closure-consistency":
    "node scripts/foundation/voc084-closure-consistency-policy.mjs",
  "ci:settings-truth":
    "node scripts/foundation/voc085-settings-truthfulness-policy.mjs",
};

function scriptFixture({ segments = foundationPrefix, scripts = {} } = {}) {
  return JSON.stringify({
    scripts: {
      ...baselineDefinitions,
      "ci:foundation": [...segments, foundationTest].join(" && "),
      ...scripts,
    },
  });
}

function assertScriptFailure(source, marker, message = marker) {
  const errors = inspectF2Scripts(source);
  assert.ok(
    errors.some((error) => error.includes(marker)),
    `${message}: ${errors.join(" | ")}`,
  );
}

test("the current, exact VOC-105, and two-extension foundation chains pass", () => {
  assert.deepEqual(inspectF2Scripts(scriptFixture()), []);
  assert.deepEqual(
    inspectF2Scripts(
      scriptFixture({
        segments: [...foundationPrefix, "pnpm run ci:f3-evidence"],
        scripts: {
          "ci:f3-evidence":
            "node scripts/foundation/voc105-f3-evidence-policy.mjs",
        },
      }),
    ),
    [],
  );
  assert.deepEqual(
    inspectF2Scripts(
      scriptFixture({
        segments: [
          ...foundationPrefix,
          "pnpm run ci:first-check",
          "pnpm run ci:second-check",
        ],
        scripts: {
          "ci:first-check": "node scripts/foundation/alpha-policy.mjs",
          "ci:second-check": "node scripts/foundation/beta-two-policy.mjs",
        },
      }),
    ),
    [],
  );
});

test("every exact prefix segment is independently required once and in order", () => {
  for (const [index, segment] of foundationPrefix.entries()) {
    assertScriptFailure(
      scriptFixture({
        segments: foundationPrefix.filter((_, i) => i !== index),
      }),
      "must occur exactly once",
      `omitting ${segment}`,
    );
    assertScriptFailure(
      scriptFixture({
        segments: [
          ...foundationPrefix.slice(0, index + 1),
          segment,
          ...foundationPrefix.slice(index + 1),
        ],
      }),
      "must occur exactly once",
      `duplicating ${segment}`,
    );
  }
  for (let index = 0; index < foundationPrefix.length - 1; index += 1) {
    const swapped = [...foundationPrefix];
    [swapped[index], swapped[index + 1]] = [swapped[index + 1], swapped[index]];
    assertScriptFailure(
      scriptFixture({ segments: swapped }),
      "prefix position",
      `swapping positions ${index + 1} and ${index + 2}`,
    );
  }
});

test("F2 direct execution, entry point, aliases, and bypasses fail closed", () => {
  const f2Index = foundationPrefix.indexOf("pnpm run ci:f2-evidence");
  const replaceF2 = (replacement) => {
    const segments = [...foundationPrefix];
    segments[f2Index] = replacement;
    return scriptFixture({ segments });
  };
  assertScriptFailure(replaceF2("node noop"), "exactly one executable");
  assertScriptFailure(
    scriptFixture({
      scripts: { "ci:f2-evidence": "node scripts/foundation/noop-policy.mjs" },
    }),
    "entry point is missing or drifted",
  );
  for (const replacement of [
    "echo pnpm run ci:f2-evidence",
    "# pnpm run ci:f2-evidence",
    "exit 0 && pnpm run ci:f2-evidence",
    "pnpm run ci:f2-evidence && echo suffix",
  ]) {
    assertScriptFailure(replaceF2(replacement), "prefix position", replacement);
  }
  assertScriptFailure(
    replaceF2("pnpm run ci:f2-evidence || true"),
    "|| fallback",
  );
  for (const alias of [
    "pnpm run ci:f2-evidence",
    "node scripts/foundation/voc081-f2-evidence-policy.mjs",
  ]) {
    assertScriptFailure(
      scriptFixture({ scripts: { "ci:alias-check": alias } }),
      "must not alias or mention",
      alias,
    );
  }
});

test("extension names, declarations, uniqueness, and placement fail closed", () => {
  for (const name of [
    "Upper",
    "under_score",
    "",
    "-leading",
    "trailing-",
    "double--hyphen",
  ]) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, `pnpm run ci:${name}`],
        scripts: { [`ci:${name}`]: "node scripts/foundation/valid-policy.mjs" },
      }),
      "extension name must use",
      name,
    );
  }
  assertScriptFailure(
    scriptFixture({
      segments: [...foundationPrefix, "pnpm run ci:unknown-check"],
    }),
    "is not declared",
  );
  assertScriptFailure(
    scriptFixture({
      segments: [
        ...foundationPrefix,
        "pnpm run ci:repeat-check",
        "pnpm run ci:repeat-check",
      ],
      scripts: {
        "ci:repeat-check": "node scripts/foundation/repeat-policy.mjs",
      },
    }),
    "duplicate extension name",
  );
  const beforeSettings = [...foundationPrefix];
  beforeSettings.splice(7, 0, "pnpm run ci:early-check");
  assertScriptFailure(
    scriptFixture({
      segments: beforeSettings,
      scripts: { "ci:early-check": "node scripts/foundation/early-policy.mjs" },
    }),
    "prefix position 8",
  );
  const afterTest = JSON.parse(
    scriptFixture({
      scripts: { "ci:late-check": "node scripts/foundation/late-policy.mjs" },
    }),
  );
  afterTest.scripts["ci:foundation"] += " && pnpm run ci:late-check";
  assertScriptFailure(JSON.stringify(afterTest), "exact and terminal");
});

test("extension entry points are direct, canonical, distinct, and noncolliding", () => {
  const invalidDefinitions = [
    "node outside/example-policy.mjs",
    "node scripts/foundation/example-policy.js",
    "node scripts/foundation/example.mjs",
    "node scripts/foundation/Upper-policy.mjs",
    "node scripts/foundation/under_score-policy.mjs",
    "node scripts/foundation/double--token-policy.mjs",
    "node scripts/foundation/example-policy.mjs argument",
    "pnpm run ci:other-check",
    "node scripts/foundation/example-policy.mjs && echo compound",
    "node scripts/foundation/example-policy.mjs # comment",
    "node scripts/foundation/example-policy.mjs; echo compound",
    "pnpm run ci:foundation",
  ];
  for (const definition of invalidDefinitions) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, "pnpm run ci:example-check"],
        scripts: { "ci:example-check": definition },
      }),
      "one direct canonical foundation policy entry point",
      definition,
    );
  }
  assertScriptFailure(
    scriptFixture({
      segments: [
        ...foundationPrefix,
        "pnpm run ci:first-check",
        "pnpm run ci:second-check",
      ],
      scripts: {
        "ci:first-check": "node scripts/foundation/shared-policy.mjs",
        "ci:second-check": "node scripts/foundation/shared-policy.mjs",
      },
    }),
    "entry point must be unique",
  );
  for (const [baselineName, definition] of Object.entries(
    baselineDefinitions,
  ).filter(([name]) => name !== "ci:f2-evidence")) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, "pnpm run ci:collision-check"],
        scripts: { "ci:collision-check": definition },
      }),
      `collides with baseline script ${baselineName}`,
      `entry-point collision with ${baselineName}`,
    );
  }
  for (const baselineName of Object.keys(baselineDefinitions).filter(
    (name) => name !== "ci:f2-evidence",
  )) {
    assertScriptFailure(
      scriptFixture({
        segments: [...foundationPrefix, `pnpm run ${baselineName}`],
      }),
      `extension name collides with baseline script ${baselineName}`,
      `name collision with ${baselineName}`,
    );
  }
});

test("malformed input and shell-control syntax fail without execution", () => {
  assertScriptFailure("{ malformed", "cannot parse");
  assertScriptFailure(
    JSON.stringify({ scripts: [] }),
    "scripts must be an object",
  );
  assertScriptFailure(
    scriptFixture({ scripts: { "ci:bad-type": 42 } }),
    "must be a string",
  );
  const controls = [
    "",
    "echo; true",
    "echo\ntrue",
    "echo > output",
    "echo < input",
    "echo & true",
    "echo # comment",
    "echo $(uname)",
    "echo `uname`",
  ];
  for (const control of controls) {
    const source = JSON.parse(scriptFixture());
    source.scripts["ci:foundation"] = [
      ...foundationPrefix,
      control,
      foundationTest,
    ].join(" && ");
    assertScriptFailure(
      JSON.stringify(source),
      control === "" ? "empty command segment" : "prohibited shell-control",
      JSON.stringify(control),
    );
  }
  const sentinel = join(tmpdir(), `voc109-no-exec-${process.pid}`);
  rmSync(sentinel, { force: true });
  assertScriptFailure(
    scriptFixture({
      segments: [...foundationPrefix, "pnpm run ci:unsafe-check"],
      scripts: {
        "ci:unsafe-check": `node -e \"require('fs').writeFileSync('${sentinel}','bad')\"`,
      },
    }),
    "one direct canonical foundation policy entry point",
  );
  assert.equal(existsSync(sentinel), false);
});
