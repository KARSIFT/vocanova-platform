import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";

import { AccountAnonymizationProcessor } from "../src/identity/anonymization.js";

const USER = "10000000-0000-4000-8000-000000000099";
const NOW = "2026-09-05T00:00:00.000Z";
const TOKEN = "a".repeat(64);

beforeEach(async () => {
  for (const table of [
    "auth_rate_limits", "magic_links", "external_identities", "sessions",
    "account_deletion_requests", "users",
  ]) await env.DB.prepare(`DELETE FROM ${table}`).run();
});

describe("account anonymization", () => {
  it("dry-runs due accounts without mutating them and ignores non-due accounts", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    const processor = new AccountAnonymizationProcessor(env.DB, () => new Date(NOW));
    expect(await processor.run()).toEqual({ dryRun: true, due: 1, processed: 0, deleted: 0 });
    expect(await env.DB.prepare("SELECT count(*) AS count FROM users").first<{ count: number }>()).toEqual({ count: 1 });
    await env.DB.prepare("UPDATE account_deletion_requests SET purge_after = '2026-09-06T00:00:00.000Z'").run();
    expect(await processor.run()).toEqual({ dryRun: true, due: 0, processed: 0, deleted: 0 });
  });

  it("deletes account-linked identity and session-rate data atomically and is retry-safe", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    const processor = new AccountAnonymizationProcessor(env.DB, () => new Date(NOW));
    expect(await processor.run({ dryRun: false })).toEqual({ dryRun: false, due: 1, processed: 1, deleted: 1 });
    for (const table of ["users", "account_deletion_requests", "sessions", "external_identities", "magic_links", "auth_rate_limits"]) {
      expect(await env.DB.prepare(`SELECT count(*) AS count FROM ${table}`).first<{ count: number }>(), table).toEqual({ count: 0 });
    }
    expect(await processor.run({ dryRun: false })).toEqual({ dryRun: false, due: 0, processed: 0, deleted: 0 });
  });

  it("rolls back an account when a dependent delete fails", async () => {
    await seed("2026-09-04T00:00:00.000Z");
    await env.DB.prepare("CREATE TRIGGER fail_anonymization BEFORE DELETE ON sessions BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END").run();
    await expect(new AccountAnonymizationProcessor(env.DB, () => new Date(NOW)).run({ dryRun: false })).rejects.toThrow("synthetic failure");
    expect(await env.DB.prepare("SELECT count(*) AS count FROM users").first<{ count: number }>()).toEqual({ count: 1 });
    expect(await env.DB.prepare("SELECT count(*) AS count FROM account_deletion_requests").first<{ count: number }>()).toEqual({ count: 1 });
    await env.DB.prepare("DROP TRIGGER fail_anonymization").run();
  });
});

async function seed(purgeAfter: string) {
  await env.DB.batch([
    env.DB.prepare("INSERT INTO users (id, email, status, deleted_at, created_at, updated_at) VALUES (?1, NULL, 'deleted', ?2, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO external_identities (id, user_id, provider, provider_subject, provider_email, provider_email_verified, created_at, updated_at) VALUES ('20000000-0000-4000-8000-000000000099', ?1, 'email', 'person@example.test', 'person@example.test', 1, ?2, ?2)").bind(USER, NOW),
    env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES ('30000000-0000-4000-8000-000000000099', ?1, ?2, ?3, '2026-10-01T00:00:00.000Z')").bind(USER, TOKEN, NOW),
    env.DB.prepare("INSERT INTO magic_links (id, user_id, email, token_hash, environment, created_at, expires_at) VALUES ('40000000-0000-4000-8000-000000000099', NULL, 'person@example.test', ?1, 'local', ?2, '2026-10-01T00:00:00.000Z')").bind("b".repeat(64), NOW),
    env.DB.prepare("INSERT INTO account_deletion_requests (id, user_id, requested_at, purge_after, idempotency_key, created_at, updated_at) VALUES ('50000000-0000-4000-8000-000000000099', ?1, '2026-08-01T00:00:00.000Z', ?2, 'delete', ?3, ?3)").bind(USER, purgeAfter, NOW),
    env.DB.prepare("INSERT INTO auth_rate_limits (bucket_key, window_started_at, attempts) VALUES (?1, 0, 1)").bind(`account.delete:session:${TOKEN}`),
  ]);
}
