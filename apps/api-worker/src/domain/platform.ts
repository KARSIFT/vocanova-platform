export interface PlatformHealth {
  database: "ok" | "unhealthy";
}

export interface PlatformMetadata {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface PlatformRepository {
  checkHealth(): Promise<PlatformHealth>;
  getMetadata(key: string): Promise<PlatformMetadata | null>;
  putMetadata(record: PlatformMetadata): Promise<void>;
}
