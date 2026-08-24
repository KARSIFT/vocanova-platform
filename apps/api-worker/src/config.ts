import { z } from "zod";

const RuntimeConfigSchema = z.object({
  environment: z.enum(["local", "staging", "production"]),
  release: z.string().trim().min(1).max(120),
  corsAllowedOrigins: z.array(z.url()).max(20),
});

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;

export type RuntimeConfigResult =
  { ok: true; value: RuntimeConfig } | { ok: false };

export function readRuntimeConfig(env: CloudflareEnv): RuntimeConfigResult {
  try {
    const parsed = RuntimeConfigSchema.safeParse({
      environment: env.ENVIRONMENT,
      release: env.RELEASE,
      corsAllowedOrigins: parseOrigins(env.CORS_ALLOWED_ORIGINS),
    });
    return parsed.success ? { ok: true, value: parsed.data } : { ok: false };
  } catch {
    return { ok: false };
  }
}

function parseOrigins(value: string): string[] {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map((origin) => new URL(origin).origin);
}
