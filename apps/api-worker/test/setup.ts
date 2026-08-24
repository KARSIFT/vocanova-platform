import { beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { applyD1Migrations } from "cloudflare:test";

beforeAll(async () => {
  // The second application proves the migration ledger makes replay a no-op.
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
});
