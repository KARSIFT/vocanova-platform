import { describe, expect, it } from "vitest";
import { env } from "cloudflare:workers";

import { D1PlatformRepository } from "../src/repositories/d1-platform-repository.js";

describe("D1 platform repository", () => {
  it("applies the forward migration once even when replayed", async () => {
    const table = await env.DB.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name = ?1",
    )
      .bind("platform_metadata")
      .first<{ name: string; sql: string }>();
    expect(table?.name).toBe("platform_metadata");
    expect(table?.sql).toContain("STRICT");
    const migrationCount = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM d1_migrations",
    ).first<{ count: number }>();
    expect(migrationCount?.count).toBe(8);
    const reservationTable = await env.DB.prepare(
      "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name = ?1",
    )
      .bind("review_state_reservations")
      .first<{ name: string; sql: string }>();
    expect(reservationTable?.name).toBe("review_state_reservations");
    expect(reservationTable?.sql).toContain("STRICT");
  });

  it("binds dynamic values instead of interpolating SQL", async () => {
    const repository = new D1PlatformRepository(env.DB);
    await repository.putMetadata({
      key: "normal-key",
      value: { enabled: true },
      updatedAt: "2026-08-22T00:00:00.000Z",
    });
    await expect(repository.getMetadata("normal-key")).resolves.toEqual({
      key: "normal-key",
      value: { enabled: true },
      updatedAt: "2026-08-22T00:00:00.000Z",
    });
    await expect(
      repository.getMetadata("normal-key' OR 1 = 1 --"),
    ).resolves.toBeNull();
  });

  it("enforces JSON and timestamp constraints", async () => {
    await expect(
      env.DB.prepare(
        "INSERT INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3)",
      )
        .bind("invalid-json", "not-json", "2026-08-22T00:00:00.000Z")
        .run(),
    ).rejects.toThrow();
    await expect(
      env.DB.prepare(
        "INSERT INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3)",
      )
        .bind("invalid-time", "{}", "not-a-timestamp")
        .run(),
    ).rejects.toThrow();
  });
});
