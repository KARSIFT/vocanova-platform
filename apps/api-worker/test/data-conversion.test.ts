import { env } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

import {
  D1_IMPORT_MAX_CHUNK_BYTES,
  D1_IMPORT_MAX_ROW_BYTES,
  convertPostgresExport,
  type D1ImportPlan,
} from "../src/data-conversion/converter.js";
import {
  applyD1ImportPlan,
  reconcileD1Import,
  releaseD1ReconciliationWriteLock,
  type ReconciliationReport,
} from "../src/data-conversion/importer.js";
import {
  DATA_TABLE_NAMES,
  type DataTableName,
} from "../src/data-conversion/schema.js";
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
    const extraWord = structuredClone(rowOf(first, "canonical_words"));
    extraWord.id = "00000000-0000-0000-0000-00000000ff01";
    extraWord.text = "Ordering proof";
    extraWord.normalized_text = "ordering-proof";
    tableRows(first, "canonical_words").unshift(extraWord);
    tableRows(second, "canonical_words").push(structuredClone(extraWord));
    const secondTables = tablesOf(second);
    second.tables = Object.fromEntries(Object.entries(secondTables).reverse());

    const [firstPlan, secondPlan] = await Promise.all([
      convertPostgresExport(first, { chunkSize: 1 }),
      convertPostgresExport(second, { chunkSize: 1 }),
    ]);

    expect(firstPlan.checksum).toBe(secondPlan.checksum);
    expect(firstPlan.chunks).toHaveLength(51);
    expect(firstPlan.expectedRows.canonical_words.map((row) => row.id)).toEqual(
      [...firstPlan.expectedRows.canonical_words.map((row) => row.id)].sort(),
    );
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
      selected_option_meaning_id: "00000000-0000-0000-0000-00000000000b",
    });
    expect(firstPlan.expectedRows.ai_feedback_attempts[0]?.feedback_json).toBe(
      '{"confidence":0.123456789012345,"score":1,"suggestions":["synthetic"]}',
    );
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

    const oversized = syntheticPostgresExport();
    rowOf(oversized, "ai_feedback_attempts").feedback_text = "x".repeat(
      D1_IMPORT_MAX_ROW_BYTES,
    );
    await expect(convertPostgresExport(oversized)).rejects.toThrow(
      "import guardrail",
    );

    const held = syntheticPostgresExport();
    sourceOf(held).synthetic = false;
    await expect(convertPostgresExport(held)).rejects.toThrow(
      "only synthetic source exports are accepted",
    );
  });

  it("bounds encoded D1 batches by statement count and bytes", async () => {
    const fixture = syntheticPostgresExport();
    const extra = structuredClone(rowOf(fixture, "ai_feedback_attempts"));
    extra.id = "00000000-0000-0000-0000-00000000ff02";
    extra.request_hash = "b".repeat(64);
    extra.feedback_text = "x".repeat(3_000);
    tableRows(fixture, "ai_feedback_attempts").push(extra);

    const plan = await convertPostgresExport(fixture, {
      chunkSize: 40,
      maxChunkBytes: 12_000,
    });
    const feedbackChunks = plan.chunks.filter(
      (chunk) =>
        chunk.operation === "upsert" && chunk.table === "ai_feedback_attempts",
    );
    expect(feedbackChunks).toHaveLength(2);
    expect(
      plan.chunks.every(
        (chunk) =>
          chunk.rows.length <= 40 &&
          chunk.encodedBytes <= D1_IMPORT_MAX_CHUNK_BYTES,
      ),
    ).toBe(true);
  });

  it("uses exact signed arithmetic for domain aggregates", async () => {
    const fixture = fixtureFor("exact-signed-aggregate");
    const template = rowOf(fixture, "confidence_point_ledger");
    const amounts = [
      Number.MAX_SAFE_INTEGER,
      2,
      1,
      -1,
      1,
      -1,
      1,
      -1,
      1,
      -1,
      -2,
    ];
    tablesOf(fixture).confidence_point_ledger = amounts.map(
      (amount, index) => ({
        ...structuredClone(template),
        id: `00000000-0000-0000-0000-${(0xff10 + index).toString(16).padStart(12, "0")}`,
        amount,
        balance_after: 0,
        idempotency_key: `synthetic-exact-aggregate-${index}`,
      }),
    );
    const plan = await convertPostgresExport(fixture);
    expect(plan.expectedDomainAggregates.confidencePointDelta).toBe(
      Number.MAX_SAFE_INTEGER,
    );
    await runImport(env.DB, plan);
    await consumeReconciliation(env.DB, plan, (report) => {
      expect(report.domainAggregates.confidencePointDelta).toBe(
        Number.MAX_SAFE_INTEGER,
      );
    });

    const overflowing = fixtureFor("overflowing-signed-aggregate");
    const overflowTemplate = rowOf(overflowing, "confidence_point_ledger");
    tablesOf(overflowing).confidence_point_ledger = [
      { ...structuredClone(overflowTemplate), amount: Number.MAX_SAFE_INTEGER },
      {
        ...structuredClone(overflowTemplate),
        id: "00000000-0000-0000-0000-00000000ff20",
        amount: 1,
        idempotency_key: "synthetic-overflow-aggregate",
      },
    ];
    await expect(convertPostgresExport(overflowing)).rejects.toThrow(
      "confidence-point aggregate exceeds safe integer precision",
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
    const baseline = await convertPostgresExport(syntheticPostgresExport());
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
    expect(plan.redactedFieldCount).toBe(baseline.redactedFieldCount + 2);
  });

  it("imports fresh local D1 chunks and emits exact privacy-safe reconciliation", async () => {
    const plan = await convertPostgresExport(fixtureFor("fresh"), {
      chunkSize: 1,
    });
    const result = await runImport(env.DB, plan);

    expect(result).toMatchObject({
      resumedFromChunk: 0,
      appliedChunks: 50,
      totalChunks: 50,
      completed: true,
    });
    expect(result.appliedBatches).toBeGreaterThanOrEqual(result.appliedChunks);
    await consumeReconciliation(env.DB, plan, async (report) => {
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
      console.info(`VOCANOVA_RECONCILIATION ${serialized}`);
    });
  });

  it("makes a completed rerun a no-op", async () => {
    const plan = await convertPostgresExport(fixtureFor("rerun"), {
      chunkSize: 2,
    });
    await runImport(env.DB, plan);
    const rerun = await applyD1ImportPlan(env.DB, plan);

    expect(rerun.appliedChunks).toBe(0);
    expect(rerun.resumedFromChunk).toBe(plan.chunks.length);
    await consumeReconciliation(env.DB, plan, (report) => {
      expect(report.status).toBe("pass");
    });
  });

  it("resumes after an injected partial failure from the last atomic checkpoint", async () => {
    const plan = await convertPostgresExport(fixtureFor("resume"), {
      chunkSize: 1,
    });
    await runUntilChunk(env.DB, plan, 30);
    await expect(
      applyD1ImportPlan(env.DB, plan, { failBeforeChunk: 30 }),
    ).rejects.toThrow("injected failure before chunk 30");

    const resumed = await applyD1ImportPlan(env.DB, plan);
    expect(resumed.resumedFromChunk).toBe(30);
    expect(resumed.appliedChunks).toBe(1);
    await runImport(env.DB, plan);
    await consumeReconciliation(env.DB, plan, (report) => {
      expect(report.status).toBe("pass");
    });
  });

  it("fails closed on a malformed or inconsistent persisted checkpoint", async () => {
    const plan = await convertPostgresExport(fixtureFor("bad-checkpoint"));
    await env.DB.prepare(
      "INSERT INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3)",
    )
      .bind(
        "data_conversion:conversion-bad-checkpoint",
        '{"completed":false}',
        plan.exportedAt,
      )
      .run();

    await expect(applyD1ImportPlan(env.DB, plan)).rejects.toThrow(
      "checkpoint shape is invalid",
    );
  });

  it("fails closed on semantically inconsistent reconciliation evidence", async () => {
    const plan = await convertPostgresExport(
      fixtureFor("bad-reconciliation-checkpoint"),
    );
    await runImport(env.DB, plan);
    await reconcileD1Import(env.DB, plan);

    const key = "data_reconciliation_write_lock";
    const stored = await env.DB.prepare(
      "SELECT value_json FROM platform_metadata WHERE key = ?1",
    )
      .bind(key)
      .first<{ value_json: string }>();
    const lock = JSON.parse(stored?.value_json ?? "null") as {
      checkpoint: {
        domainAggregates: { activeUsers: number };
        tables: { users: { matches: boolean; sourceCount: number } };
      };
    };
    lock.checkpoint.tables.users.sourceCount = 99;
    await env.DB.prepare(
      "UPDATE platform_metadata SET value_json = ?1 WHERE key = ?2",
    )
      .bind(JSON.stringify(lock), key)
      .run();

    await expect(reconcileD1Import(env.DB, plan)).rejects.toThrow(
      "checkpoint table users has invalid evidence",
    );

    lock.checkpoint.tables.users.sourceCount = plan.sourceCounts.users;
    lock.checkpoint.tables.users.matches = false;
    await env.DB.prepare(
      "UPDATE platform_metadata SET value_json = ?1 WHERE key = ?2",
    )
      .bind(JSON.stringify(lock), key)
      .run();
    await expect(reconcileD1Import(env.DB, plan)).rejects.toThrow(
      "checkpoint table users has invalid evidence",
    );

    lock.checkpoint.tables.users.matches = true;
    lock.checkpoint.domainAggregates.activeUsers = 99;
    await env.DB.prepare(
      "UPDATE platform_metadata SET value_json = ?1 WHERE key = ?2",
    )
      .bind(JSON.stringify(lock), key)
      .run();
    await expect(reconcileD1Import(env.DB, plan)).rejects.toThrow(
      "checkpoint aggregate activeUsers is inconsistent",
    );
    await env.DB.prepare("DELETE FROM platform_metadata WHERE key = ?1")
      .bind(key)
      .run();
  });

  it(
    "reruns a completed reconciliation instead of returning a stale pass",
    { timeout: 10_000 },
    async () => {
      const plan = await convertPostgresExport(
        fixtureFor("stale-reconciliation"),
      );
      await runImport(env.DB, plan);
      await consumeReconciliation(env.DB, plan, (report) => {
        expect(report.status).toBe("pass");
      });

      await env.DB.prepare("UPDATE canonical_words SET text = ?1 WHERE id = ?2")
        .bind(
          "Post-checkpoint mutation",
          plan.expectedRows.canonical_words[0]?.id,
        )
        .run();

      const restarted = await reconcileD1Import(env.DB, plan);
      expect(restarted.status).toBe("pending");
      await consumeReconciliation(env.DB, plan, (report) => {
        expect(report.status).toBe("fail");
      });
    },
  );

  it("rejects a changed plan under a completed export id", async () => {
    const initialFixture = fixtureFor("stale");
    const initial = await convertPostgresExport(initialFixture);
    await runImport(env.DB, initial);

    const changedFixture = fixtureFor("stale");
    rowOf(changedFixture, "review_attempts").response_time_ms = 42;
    const changed = await convertPostgresExport(changedFixture);
    expect(changed.checksum).not.toBe(initial.checksum);
    await expect(applyD1ImportPlan(env.DB, changed)).rejects.toThrow(
      "checkpoint is stale",
    );
  });

  it("rehearses forward correction as a new full-export checkpoint", async () => {
    const initialFixture = fixtureFor("correction-base");
    const identity = structuredClone(
      rowOf(initialFixture, "external_identities"),
    );
    identity.id = "00000000-0000-0000-0000-00000000ff03";
    identity.provider_subject = "synthetic-forward-correction-subject";
    tableRows(initialFixture, "external_identities").push(identity);
    const initial = await convertPostgresExport(initialFixture);
    await runImport(env.DB, initial);

    const correctionFixture = structuredClone(initialFixture);
    correctionFixture.export_id = "conversion-correction-1";
    tableRows(correctionFixture, "external_identities")[1]!.deleted_at =
      "2026-08-22T05:30:00.123+03:30";
    rowOf(correctionFixture, "confidence_point_ledger").amount = 12;
    rowOf(correctionFixture, "confidence_point_ledger").balance_after = 12;
    const correction = await convertPostgresExport(correctionFixture);
    await runImport(env.DB, correction);
    await consumeReconciliation(env.DB, correction, async (report) => {
      expect(report.status).toBe("pass");
      expect(report.domainAggregates.confidencePointDelta).toBe(12);
      expect(report.tables.external_identities).toMatchObject({
        sourceCount: 2,
        excludedCount: 1,
        expectedCount: 1,
        actualCount: 1,
        matches: true,
      });
      expect(
        await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM external_identities WHERE id = ?1",
        )
          .bind(identity.id)
          .first<{ count: number }>(),
      ).toEqual({ count: 0 });
    });
  });

  it("resumes bounded clearing and multi-page reconciliation", async () => {
    const initialFixture = fixtureFor("bounded-clear-base");
    const template = rowOf(initialFixture, "canonical_words");
    for (let index = 0; index < 10; index += 1) {
      const row = structuredClone(template);
      row.id = `00000000-0000-0000-0000-${(0x1000 + index).toString(16).padStart(12, "0")}`;
      row.text = `Bounded clear ${index}`;
      row.normalized_text = `bounded-clear-${index}`;
      tableRows(initialFixture, "canonical_words").push(row);
    }
    const initialPlan = await convertPostgresExport(initialFixture, {
      chunkSize: 10,
    });
    await runImport(env.DB, initialPlan);
    const guardedReconciliationPlan = forbidExpectedTableScans(initialPlan);
    await runUntilReconciliationPage(
      env.DB,
      guardedReconciliationPlan,
      "canonical_words",
      10,
    );
    const reconciliationKey = "data_reconciliation_write_lock";
    const storedCheckpoint = await env.DB.prepare(
      "SELECT value_json FROM platform_metadata WHERE key = ?1",
    )
      .bind(reconciliationKey)
      .first<{ value_json: string }>();
    const validLock = storedCheckpoint?.value_json ?? "";
    const forgedLock = JSON.parse(validLock) as {
      checkpoint: { current: { rollingChecksum: string } };
    };
    forgedLock.checkpoint.current.rollingChecksum = "a".repeat(64);
    await env.DB.prepare(
      "UPDATE platform_metadata SET value_json = ?1 WHERE key = ?2",
    )
      .bind(JSON.stringify(forgedLock), reconciliationKey)
      .run();
    await expect(
      reconcileD1Import(env.DB, guardedReconciliationPlan),
    ).rejects.toThrow("cursor is not bound to an exact expected prefix");
    await env.DB.prepare(
      "UPDATE platform_metadata SET value_json = ?1 WHERE key = ?2",
    )
      .bind(validLock, reconciliationKey)
      .run();
    await expect(
      reconcileD1Import(env.DB, guardedReconciliationPlan, {
        failBeforePage: { table: "canonical_words", processedRows: 10 },
      }),
    ).rejects.toThrow(
      "injected reconciliation failure before canonical_words row 10",
    );
    await expect(
      env.DB.prepare("UPDATE canonical_words SET text = ?1 WHERE id = ?2")
        .bind(
          "Mutation during reconciliation",
          initialPlan.expectedRows.canonical_words[0]?.id,
        )
        .run(),
    ).rejects.toThrow("data reconciliation write lock is active");
    await consumeReconciliation(env.DB, guardedReconciliationPlan, (report) => {
      expect(report.status).toBe("pass");
    });

    const correction = await convertPostgresExport(
      fixtureFor("bounded-clear-correction"),
      { chunkSize: 10 },
    );
    const clearIndex = correction.chunks.findIndex(
      (chunk) =>
        chunk.operation === "clear" && chunk.table === "canonical_words",
    );
    await runUntilChunk(env.DB, correction, clearIndex);

    const partial = await applyD1ImportPlan(env.DB, correction);
    expect(partial).toMatchObject({
      resumedFromChunk: clearIndex,
      appliedChunks: 0,
      appliedBatches: 1,
      completed: false,
    });
    expect(
      await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM canonical_words",
      ).first<{
        count: number;
      }>(),
    ).toEqual({ count: 1 });

    const finishedClear = await applyD1ImportPlan(env.DB, correction);
    expect(finishedClear).toMatchObject({
      resumedFromChunk: clearIndex,
      appliedChunks: 1,
      appliedBatches: 1,
    });
    await runImport(env.DB, correction);
    await consumeReconciliation(env.DB, correction, (report) => {
      expect(report.status).toBe("pass");
    });
  }, 15_000);

  it("restarts from zero after lock loss and reports a changed prefix", async () => {
    const fixture = fixtureFor("lock-loss-restart");
    const template = rowOf(fixture, "canonical_words");
    for (let index = 0; index < 10; index += 1) {
      const row = structuredClone(template);
      row.id = `00000000-0000-0000-0000-${(0x2000 + index).toString(16).padStart(12, "0")}`;
      row.text = `Lock continuity ${index}`;
      row.normalized_text = `lock-continuity-${index}`;
      tableRows(fixture, "canonical_words").push(row);
    }
    const convertedPlan = await convertPostgresExport(fixture);
    const changedPrefixId = convertedPlan.expectedRows.canonical_words[0]?.id;
    const plan = forbidExpectedTableScans(convertedPlan);
    await runImport(env.DB, plan);
    await runUntilReconciliationPage(env.DB, plan, "canonical_words", 10);

    await env.DB.prepare("DELETE FROM platform_metadata WHERE key = ?1")
      .bind("data_reconciliation_write_lock")
      .run();
    await env.DB.prepare("UPDATE canonical_words SET text = ?1 WHERE id = ?2")
      .bind("Changed while the lock was absent", changedPrefixId)
      .run();

    await expect(
      reconcileD1Import(env.DB, plan, {
        failBeforePage: { table: "users", processedRows: 0 },
      }),
    ).rejects.toThrow("injected reconciliation failure before users row 0");
    const restartedLock = await env.DB.prepare(
      "SELECT value_json FROM platform_metadata WHERE key = ?1",
    )
      .bind("data_reconciliation_write_lock")
      .first<{ value_json: string }>();
    const restartedState = JSON.parse(restartedLock?.value_json ?? "null") as {
      checkpoint: { tableIndex: number; current: { rowCount: number } };
    };
    expect(restartedState.checkpoint).toMatchObject({
      tableIndex: 0,
      current: { rowCount: 0 },
    });
    await consumeReconciliation(env.DB, plan, (report) => {
      expect(report.status).toBe("fail");
      expect(report.tables.canonical_words.matches).toBe(false);
      expect(report.tables.canonical_words.expectedPrefixMatched).toBe(false);
    });
  }, 15_000);

  it("binds completed evidence and release to the exact generation", async () => {
    const plan = await convertPostgresExport(fixtureFor("release-generation"));
    await runImport(env.DB, plan);
    await runUntilFinalReconciliationPage(env.DB, plan);
    const finalPageResults = await Promise.allSettled([
      reconcileD1Import(env.DB, plan),
      reconcileD1Import(env.DB, plan),
    ]);
    const completedReports = finalPageResults.flatMap((result) =>
      result.status === "fulfilled" && result.value.status !== "pending"
        ? [result.value]
        : [],
    );
    expect(completedReports).toHaveLength(1);
    expect(
      finalPageResults.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    const completedA = completedReports[0]!;
    expect(completedA.status).toBe("pass");

    await expect(reconcileD1Import(env.DB, plan)).rejects.toThrow(
      "completed reconciliation awaits generation-bound release",
    );
    await expect(
      env.DB.prepare("UPDATE canonical_words SET text = ?1 WHERE id = ?2")
        .bind(
          "Mutation while completed evidence is consumed",
          plan.expectedRows.canonical_words[0]?.id,
        )
        .run(),
    ).rejects.toThrow("data reconciliation write lock is active");

    const duplicateReleaseResults = await Promise.allSettled([
      releaseD1ReconciliationWriteLock(
        env.DB,
        plan,
        completedA.reconciliationGeneration,
      ),
      releaseD1ReconciliationWriteLock(
        env.DB,
        plan,
        completedA.reconciliationGeneration,
      ),
    ]);
    expect(
      duplicateReleaseResults.filter((result) => result.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      duplicateReleaseResults.filter((result) => result.status === "rejected"),
    ).toHaveLength(1);
    await env.DB.prepare("UPDATE canonical_words SET text = ?1 WHERE id = ?2")
      .bind(
        "Mutation after generation A release",
        plan.expectedRows.canonical_words[0]?.id,
      )
      .run();

    const restarted = await reconcileD1Import(env.DB, plan);
    expect(restarted.status).toBe("pending");
    const completedB = await completeReconciliation(env.DB, plan);
    expect(completedB.status).toBe("fail");
    expect(completedB.reconciliationGeneration).not.toBe(
      completedA.reconciliationGeneration,
    );

    await expect(
      releaseD1ReconciliationWriteLock(
        env.DB,
        plan,
        completedA.reconciliationGeneration,
      ),
    ).rejects.toThrow(
      "reconciliation release generation does not match the completed receipt",
    );
    await expect(
      env.DB.prepare("UPDATE canonical_words SET text = ?1 WHERE id = ?2")
        .bind(
          "Mutation after stale generation A release",
          plan.expectedRows.canonical_words[0]?.id,
        )
        .run(),
    ).rejects.toThrow("data reconciliation write lock is active");
    await releaseD1ReconciliationWriteLock(
      env.DB,
      plan,
      completedB.reconciliationGeneration,
    );
  }, 15_000);

  it("lets D1 reject alternate/composite uniqueness conflicts atomically", async () => {
    const fixture = fixtureFor("alternate-unique");
    const duplicate = structuredClone(rowOf(fixture, "canonical_words"));
    duplicate.id = "00000000-0000-0000-0000-00000000ff04";
    tableRows(fixture, "canonical_words").push(duplicate);
    const plan = await convertPostgresExport(fixture, { chunkSize: 40 });

    await expect(runImport(env.DB, plan)).rejects.toThrow();
    expect(
      await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM canonical_words",
      ).first<{
        count: number;
      }>(),
    ).toEqual({ count: 0 });
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

    await expect(runImport(env.DB, brokenPlan)).rejects.toThrow();
    const validRowAfterFailure = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM canonical_words WHERE id = ?1",
    )
      .bind(validExtra.id)
      .first<{ count: number }>();
    expect(validRowAfterFailure?.count).toBe(0);

    const correctedFixture = structuredClone(brokenFixture);
    correctedFixture.export_id = "conversion-constraint-correction";
    tableRows(correctedFixture, "canonical_words")[2]!.status = "active";
    const correctedPlan = await convertPostgresExport(correctedFixture, {
      chunkSize: 10,
    });
    await runImport(env.DB, correctedPlan);
    await consumeReconciliation(env.DB, correctedPlan, (report) => {
      expect(report.status).toBe("pass");
    });
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
  fixture.export_id = `conversion-${suffix}`;
  return fixture;
}

function forbidExpectedTableScans(plan: D1ImportPlan): D1ImportPlan {
  const expectedRows = Object.fromEntries(
    DATA_TABLE_NAMES.map((tableName) => [
      tableName,
      new Proxy(plan.expectedRows[tableName], {
        get(target, property, receiver) {
          if (property !== "length") {
            throw new Error(
              `reconciliation scanned expected ${tableName} rows through ${String(property)}`,
            );
          }
          return Reflect.get(target, property, receiver);
        },
      }),
    ]),
  ) as D1ImportPlan["expectedRows"];
  const expectedPageEvidence = Object.fromEntries(
    DATA_TABLE_NAMES.map((tableName) => [
      tableName,
      new Proxy(plan.expectedPageEvidence[tableName], {
        get(target, property, receiver) {
          if (
            property !== "length" &&
            !/^(?:0|[1-9]\d*)$/.test(String(property))
          ) {
            throw new Error(
              `reconciliation scanned expected ${tableName} page evidence through ${String(property)}`,
            );
          }
          return Reflect.get(target, property, receiver);
        },
      }),
    ]),
  ) as D1ImportPlan["expectedPageEvidence"];
  return { ...plan, expectedRows, expectedPageEvidence };
}

async function runImport(
  database: D1Database,
  plan: D1ImportPlan,
): Promise<Awaited<ReturnType<typeof applyD1ImportPlan>>> {
  let firstResumedFromChunk: number | undefined;
  let appliedChunks = 0;
  let appliedBatches = 0;
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const result = await applyD1ImportPlan(database, plan);
    firstResumedFromChunk ??= result.resumedFromChunk;
    appliedChunks += result.appliedChunks;
    appliedBatches += result.appliedBatches;
    if (result.completed) {
      return {
        ...result,
        resumedFromChunk: firstResumedFromChunk,
        appliedChunks,
        appliedBatches,
      };
    }
  }
  throw new Error("test import did not complete within bounded invocations");
}

async function runUntilChunk(
  database: D1Database,
  plan: D1ImportPlan,
  targetChunk: number,
): Promise<void> {
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const result = await applyD1ImportPlan(database, plan);
    if (result.resumedFromChunk + result.appliedChunks >= targetChunk) return;
    if (result.completed) {
      throw new Error(`test import completed before chunk ${targetChunk}`);
    }
  }
  throw new Error(`test import did not reach chunk ${targetChunk}`);
}

async function completeReconciliation(
  database: D1Database,
  plan: D1ImportPlan,
): Promise<ReconciliationReport> {
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const result = await reconcileD1Import(database, plan);
    if (result.status !== "pending") {
      return result;
    }
  }
  throw new Error("test reconciliation did not complete within bounded pages");
}

async function consumeReconciliation<T>(
  database: D1Database,
  plan: D1ImportPlan,
  consume: (report: ReconciliationReport) => T | Promise<T>,
): Promise<T> {
  const report = await completeReconciliation(database, plan);
  try {
    return await consume(report);
  } finally {
    await releaseD1ReconciliationWriteLock(
      database,
      plan,
      report.reconciliationGeneration,
    );
  }
}

async function runUntilReconciliationPage(
  database: D1Database,
  plan: D1ImportPlan,
  table: DataTableName,
  processedRows: number,
): Promise<void> {
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const result = await reconcileD1Import(database, plan);
    if (
      result.status === "pending" &&
      result.table === table &&
      result.processedRowsInTable === processedRows
    ) {
      return;
    }
    if (result.status !== "pending") {
      throw new Error(`test reconciliation completed before ${String(table)}`);
    }
  }
  throw new Error(`test reconciliation did not reach ${String(table)}`);
}

async function runUntilFinalReconciliationPage(
  database: D1Database,
  plan: D1ImportPlan,
): Promise<void> {
  for (let attempt = 0; attempt < 10_000; attempt += 1) {
    const result = await reconcileD1Import(database, plan);
    if (
      result.status === "pending" &&
      result.completedTables === DATA_TABLE_NAMES.length - 1
    ) {
      return;
    }
    if (result.status !== "pending") {
      throw new Error("test reconciliation completed before its final page");
    }
  }
  throw new Error("test reconciliation did not reach its final page");
}
