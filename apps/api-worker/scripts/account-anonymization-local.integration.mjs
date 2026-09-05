import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getPlatformProxy } from "wrangler";
import { runLocalAnonymization } from "./account-anonymization-local.mjs";
import { LOCAL_D1_PATHS, runLocalD1Migrations } from "./local-d1-init.mjs";

test("local anonymization adapter uses only disposable D1 state", async () => {
  const stateDirectory = await mkdtemp(join(tmpdir(), "vocanova-anonymize-"));
  try {
    assert.equal(
      runLocalD1Migrations({ purpose: "test", stateDirectory, stdio: "pipe" })
        .status,
      0,
    );
    const platform = await getPlatformProxy({
      configPath: LOCAL_D1_PATHS.canonicalConfigPath,
      environment: "",
      envFiles: [],
      remoteBindings: false,
      persist: { path: join(stateDirectory, "v3") },
    });
    try {
      await platform.env.DB.batch([
        platform.env.DB.prepare(
          "INSERT INTO users (id, email, status, deleted_at, created_at, updated_at) VALUES ('10000000-0000-4000-8000-000000000098', NULL, 'deleted', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z', '2026-09-01T00:00:00.000Z')",
        ),
        platform.env.DB.prepare(
          "INSERT INTO account_deletion_requests (id, user_id, requested_at, purge_after, idempotency_key, created_at, updated_at) VALUES ('20000000-0000-4000-8000-000000000098', '10000000-0000-4000-8000-000000000098', '2026-08-01T00:00:00.000Z', '2026-08-02T00:00:00.000Z', 'test', '2026-08-01T00:00:00.000Z', '2026-08-01T00:00:00.000Z')",
        ),
      ]);
    } finally {
      await platform.dispose();
    }
    assert.equal(
      (await runLocalAnonymization({ stateDirectory, dryRun: true })).due,
      1,
    );
    assert.equal(
      (await runLocalAnonymization({ stateDirectory, dryRun: false })).deleted,
      1,
    );
    assert.equal(
      (await runLocalAnonymization({ stateDirectory, dryRun: false })).due,
      0,
    );
  } finally {
    await rm(stateDirectory, { recursive: true, force: true });
  }
});
