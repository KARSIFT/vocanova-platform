import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import { convertPostgresExport } from "../src/data-conversion/converter.js";
import {
  applyD1ImportPlan,
  reconcileD1Import,
} from "../src/data-conversion/importer.js";
import { DATA_TABLE_NAMES } from "../src/data-conversion/schema.js";
import { syntheticPostgresExport } from "./fixtures/postgres-export-v1.js";

describe("PostgreSQL-to-D1 conversion", () => {
  it("binds the versioned export contract to all 25 PostgreSQL source tables", () => {
    expect(DATA_TABLE_NAMES).toEqual([
      "users",
      "external_identities",
      "user_onboarding_profiles",
      "user_settings",
      "sessions",
      "magic_links",
      "oauth_states",
      "email_change_links",
      "account_deletion_requests",
      "canonical_words",
      "word_meanings",
      "word_examples",
      "usage_notes",
      "journey_situations",
      "journey_words",
      "user_words",
      "idempotency_keys",
      "review_attempts",
      "daily_mission_snapshots",
      "daily_activity_summaries",
      "learner_sentences",
      "ai_feedback_attempts",
      "confidence_point_ledger",
      "streak_states",
      "grace_day_ledger",
    ]);
  });

  it("normalizes PostgreSQL values deterministically independent of object order", async () => {
    const first = syntheticPostgresExport();
    const second = syntheticPostgresExport();
    const secondTables = tablesOf(second);
    second.tables = Object.fromEntries(Object.entries(secondTables).reverse());

    const [firstPlan, secondPlan] = await Promise.all([
      convertPostgresExport(first, { chunkSize: 1 }),
      convertPostgresExport(second, { chunkSize: 1 }),
    ]);

    expect(firstPlan.checksum).toBe(secondPlan.checksum);
    expect(firstPlan.chunks).toHaveLength(25);
    expect(firstPlan.expectedRows.users[0]).toMatchObject({
      email: "synthetic@example.invalid",
      display_name: "",
      avatar_url: "",
      created_at: "2026-08-22T00:00:00.123Z",
    });
    expect(firstPlan.expectedRows.sessions[0]?.token_hash).toBe("a".repeat(64));
    expect(firstPlan.expectedRows.external_identities[0]).toMatchObject({
      provider_email: "",
      provider_email_verified: 1,
    });
    expect(firstPlan.expectedRows.review_attempts[0]).toMatchObject({
      client_attempt_id: "legacy:00000000-0000-0000-0000-000000000012",
      metadata_json: '{"fixture":true,"ordering":{"a":1,"z":2}}',
      response_time_ms: Number.MAX_SAFE_INTEGER,
      was_hint_used: 0,
    });
    expect(
      firstPlan.expectedRows.confidence_point_ledger[0]?.metadata_json,
    ).toBe('{"a":1,"z":"last"}');
  });

  it("fails closed on unknown shape, unsafe precision, invalid time, duplicates, or held data", async () => {
    const unknownField = syntheticPostgresExport();
    rowOf(unknownField, "users").unexpected = true;
    await expect(convertPostgresExport(unknownField)).rejects.toThrow(
      "keys must be exactly",
    );

    const unsafeInteger = syntheticPostgresExport();
    rowOf(unsafeInteger, "review_attempts").response_time_ms =
      "9007199254740992";
    await expect(convertPostgresExport(unsafeInteger)).rejects.toThrow(
      "safe integer precision",
    );

    const invalidTimestamp = syntheticPostgresExport();
    rowOf(invalidTimestamp, "users").created_at = "2026-08-22 00:00:00";
    await expect(convertPostgresExport(invalidTimestamp)).rejects.toThrow(
      "explicit timezone",
    );

    const duplicate = syntheticPostgresExport();
    tableRows(duplicate, "users").push(
      structuredClone(rowOf(duplicate, "users")),
    );
    await expect(convertPostgresExport(duplicate)).rejects.toThrow(
      "duplicate id",
    );

    const held = syntheticPostgresExport();
    sourceOf(held).synthetic = false;
    await expect(convertPostgresExport(held)).rejects.toThrow(
      "VOC-080-HOLD-02",
    );
  });

  it("fails before import when a converted foreign key has no parent", async () => {
    const fixture = syntheticPostgresExport();
    rowOf(fixture, "user_words").meaning_id =
      "00000000-0000-0000-0000-00000000ffff";
    await expect(convertPostgresExport(fixture)).rejects.toThrow(
      "references missing word_meanings row",
    );
  });

  it("records an explicit exclusion for soft-deleted external identities", async () => {
    const fixture = syntheticPostgresExport();
    const deleted = structuredClone(rowOf(fixture, "external_identities"));
    deleted.id = "00000000-0000-0000-0000-00000000fffe";
    deleted.provider_subject = "synthetic-deleted-provider-subject";
    deleted.deleted_at = "2026-08-22T05:30:00.123+03:30";
    tableRows(fixture, "external_identities").push(deleted);

    const plan = await convertPostgresExport(fixture);
    expect(plan.sourceCounts.external_identities).toBe(2);
    expect(plan.excludedCounts.external_identities).toBe(1);
    expect(plan.expectedRows.external_identities).toHaveLength(1);
  });

  it("imports fresh local D1 chunks and emits exact privacy-safe reconciliation", async () => {
    const plan = await convertPostgresExport(fixtureFor("fresh"), {
      chunkSize: 1,
    });
    const result = await applyD1ImportPlan(env.DB, plan);
    const report = await reconcileD1Import(env.DB, plan);

    expect(result).toMatchObject({
      resumedFromChunk: 0,
      appliedChunks: 25,
      totalChunks: 25,
      completed: true,
    });
    expect(report.status).toBe("pass");
    expect(report.foreignKeyViolations).toBe(0);
    expect(Object.values(report.tables).every((table) => table.matches)).toBe(
      true,
    );
    expect(report.domainAggregates).toEqual({
      activeUsers: 1,
      activeSavedWords: 1,
      reviewAttempts: 1,
      completedMissions: 1,
      confidencePointDelta: 10,
      successfulAiFeedbackAttempts: 1,
    });
    expect(report.redactedFieldCount).toBeGreaterThan(0);

    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain("Synthetic learner content");
    expect(serialized).not.toContain("synthetic@example.invalid");
    expect(serialized).not.toContain("synthetic-idempotency-key");
    expect(serialized).not.toContain("a".repeat(64));
    console.info(`VOC080_RECONCILIATION ${serialized}`);
  });

  it("makes a completed rerun a no-op", async () => {
    const plan = await convertPostgresExport(fixtureFor("rerun"), {
      chunkSize: 2,
    });
    await applyD1ImportPlan(env.DB, plan);
    const rerun = await applyD1ImportPlan(env.DB, plan);

    expect(rerun.appliedChunks).toBe(0);
    expect(rerun.resumedFromChunk).toBe(plan.chunks.length);
    expect((await reconcileD1Import(env.DB, plan)).status).toBe("pass");
  });

  it("resumes after an injected partial failure from the last atomic checkpoint", async () => {
    const plan = await convertPostgresExport(fixtureFor("resume"), {
      chunkSize: 1,
    });
    await expect(
      applyD1ImportPlan(env.DB, plan, { failBeforeChunk: 12 }),
    ).rejects.toThrow("injected failure before chunk 12");

    const resumed = await applyD1ImportPlan(env.DB, plan);
    expect(resumed.resumedFromChunk).toBe(12);
    expect(resumed.appliedChunks).toBe(13);
    expect((await reconcileD1Import(env.DB, plan)).status).toBe("pass");
  });

  it("rejects a changed plan under a completed export id", async () => {
    const initialFixture = fixtureFor("stale");
    const initial = await convertPostgresExport(initialFixture);
    await applyD1ImportPlan(env.DB, initial);

    const changedFixture = fixtureFor("stale");
    rowOf(changedFixture, "review_attempts").response_time_ms = 42;
    const changed = await convertPostgresExport(changedFixture);
    expect(changed.checksum).not.toBe(initial.checksum);
    await expect(applyD1ImportPlan(env.DB, changed)).rejects.toThrow(
      "checkpoint is stale",
    );
  });

  it("rehearses forward correction as a new full-export checkpoint", async () => {
    const initial = await convertPostgresExport(fixtureFor("correction-base"));
    await applyD1ImportPlan(env.DB, initial);

    const correctionFixture = fixtureFor("correction-1");
    rowOf(correctionFixture, "confidence_point_ledger").amount = 12;
    rowOf(correctionFixture, "confidence_point_ledger").balance_after = 12;
    const correction = await convertPostgresExport(correctionFixture);
    await applyD1ImportPlan(env.DB, correction);
    const report = await reconcileD1Import(env.DB, correction);

    expect(report.status).toBe("pass");
    expect(report.domainAggregates.confidencePointDelta).toBe(12);
  });

  it("keeps a failed D1 chunk atomic and recovers with a new full correction", async () => {
    const brokenFixture = fixtureFor("constraint-failure");
    const validExtra = structuredClone(rowOf(brokenFixture, "canonical_words"));
    validExtra.id = "00000000-0000-0000-0000-00000000ff01";
    validExtra.text = "Atomic valid";
    validExtra.normalized_text = "atomic-valid";
    const invalidExtra = structuredClone(validExtra);
    invalidExtra.id = "00000000-0000-0000-0000-00000000ff02";
    invalidExtra.text = "Atomic invalid";
    invalidExtra.normalized_text = "atomic-invalid";
    invalidExtra.status = "unsupported";
    tableRows(brokenFixture, "canonical_words").push(validExtra, invalidExtra);
    const brokenPlan = await convertPostgresExport(brokenFixture, {
      chunkSize: 10,
    });

    await expect(applyD1ImportPlan(env.DB, brokenPlan)).rejects.toThrow();
    const validRowAfterFailure = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM canonical_words WHERE id = ?1",
    )
      .bind(validExtra.id)
      .first<{ count: number }>();
    expect(validRowAfterFailure?.count).toBe(0);

    const correctedFixture = structuredClone(brokenFixture);
    correctedFixture.export_id = "voc080-t09-constraint-correction";
    tableRows(correctedFixture, "canonical_words")[2]!.status = "active";
    const correctedPlan = await convertPostgresExport(correctedFixture, {
      chunkSize: 10,
    });
    await applyD1ImportPlan(env.DB, correctedPlan);
    expect((await reconcileD1Import(env.DB, correctedPlan)).status).toBe(
      "pass",
    );
  });
});

function tablesOf(
  fixture: Record<string, unknown>,
): Record<string, Record<string, unknown>[]> {
  return fixture.tables as Record<string, Record<string, unknown>[]>;
}

function rowOf(
  fixture: Record<string, unknown>,
  table: string,
): Record<string, unknown> {
  const row = tablesOf(fixture)[table]?.[0];
  if (!row) throw new Error(`missing synthetic fixture row for ${table}`);
  return row;
}

function tableRows(
  fixture: Record<string, unknown>,
  table: string,
): Record<string, unknown>[] {
  const rows = tablesOf(fixture)[table];
  if (!rows) throw new Error(`missing synthetic fixture table for ${table}`);
  return rows;
}

function sourceOf(fixture: Record<string, unknown>): Record<string, unknown> {
  return fixture.source as Record<string, unknown>;
}

function fixtureFor(suffix: string): Record<string, unknown> {
  const fixture = syntheticPostgresExport();
  fixture.export_id = `voc080-t09-${suffix}`;
  return fixture;
}
