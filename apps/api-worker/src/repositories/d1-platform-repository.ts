import type {
  PlatformHealth,
  PlatformMetadata,
  PlatformRepository,
} from "../domain/platform.js";

interface HealthRow {
  ok: number;
}

interface MetadataRow {
  key: string;
  value_json: string;
  updated_at: string;
}

export class D1PlatformRepository implements PlatformRepository {
  constructor(private readonly database: D1Database) {}

  async checkHealth(): Promise<PlatformHealth> {
    try {
      const row = await this.database
        .prepare("SELECT 1 AS ok")
        .first<HealthRow>();
      return { database: row?.ok === 1 ? "ok" : "unhealthy" };
    } catch {
      return { database: "unhealthy" };
    }
  }

  async getMetadata(key: string): Promise<PlatformMetadata | null> {
    const row = await this.database
      .prepare(
        "SELECT key, value_json, updated_at FROM platform_metadata WHERE key = ?1",
      )
      .bind(key)
      .first<MetadataRow>();
    if (!row) return null;
    return {
      key: row.key,
      value: JSON.parse(row.value_json) as unknown,
      updatedAt: row.updated_at,
    };
  }

  async putMetadata(record: PlatformMetadata): Promise<void> {
    await this.database
      .prepare(
        "INSERT INTO platform_metadata (key, value_json, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at",
      )
      .bind(record.key, JSON.stringify(record.value), record.updatedAt)
      .run();
  }
}
