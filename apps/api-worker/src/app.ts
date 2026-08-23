import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

import { readRuntimeConfig } from "./config.js";
import type { EmailSender } from "./domain/identity.js";
import { D1PlatformRepository } from "./repositories/d1-platform-repository.js";
import type { PlatformRepository } from "./domain/platform.js";
import { D1IdentityRepository } from "./identity/repository.js";
import { registerIdentityRoutes } from "./identity/routes.js";
import { IdentityService, identityConfig } from "./identity/service.js";
import {
  ProblemSchema,
  createProblem,
  problemResponse,
} from "./http/problem.js";
import {
  corsPolicy,
  requestContext,
  type VocaNovaWorkerEnvironment,
} from "./http/middleware.js";

const HealthSchema = z
  .object({
    status: z.enum(["ok", "unhealthy"]),
    database: z.enum(["ok", "unhealthy"]),
    timestamp: z.iso.datetime(),
  })
  .openapi("Health");

const ConfigSchema = z
  .object({
    environment: z.enum(["local", "staging", "production"]),
    release: z.string(),
    runtime: z.literal("cloudflare-workers"),
    data: z.literal("d1"),
    migrationStatus: z.literal("identity-account-parity"),
  })
  .openapi("RuntimeConfig");

const healthRoute = createRoute({
  method: "get",
  path: "/healthz",
  summary: "Liveness and D1 reachability probe",
  tags: ["Operations"],
  responses: {
    200: {
      description: "Worker and D1 are reachable",
      content: { "application/json": { schema: HealthSchema } },
    },
    503: {
      description: "D1 is unreachable",
      content: { "application/problem+json": { schema: ProblemSchema } },
    },
  },
});

const configRoute = createRoute({
  method: "get",
  path: "/configz",
  summary: "Non-secret runtime configuration",
  tags: ["Operations"],
  responses: {
    200: {
      description: "Safe runtime configuration",
      content: { "application/json": { schema: ConfigSchema } },
    },
    503: {
      description: "Runtime configuration is invalid",
      content: { "application/problem+json": { schema: ProblemSchema } },
    },
  },
});

export const OPENAPI_DOCUMENT_CONFIG = {
  openapi: "3.1.0" as const,
  info: {
    title: "VocaNova Worker API migration target",
    version: "0.1.0",
    description:
      "Operational Worker/D1 migration target. Identity and account endpoints have parity evidence; the Go OpenAPI document remains canonical until every domain passes.",
  },
};

export interface AppDependencies {
  createPlatformRepository(database: D1Database): PlatformRepository;
  createIdentityService?(env: CloudflareEnv): IdentityService;
}

const defaultDependencies: AppDependencies = {
  createPlatformRepository: (database) => new D1PlatformRepository(database),
};

export function createApp(
  dependencies: AppDependencies = defaultDependencies,
): OpenAPIHono<VocaNovaWorkerEnvironment> {
  const app = new OpenAPIHono<VocaNovaWorkerEnvironment>();
  app.use("*", requestContext);
  app.use("*", corsPolicy);

  app.openapi(healthRoute, async (context) => {
    context.set("routeName", "healthz");
    const repository = dependencies.createPlatformRepository(context.env.DB);
    const health = await repository.checkHealth();
    if (health.database !== "ok") {
      return context.json(
        createProblem(
          context.get("requestId"),
          503,
          "Service Unavailable",
          "database is unreachable",
        ),
        503,
        { "content-type": "application/problem+json" },
      );
    }
    return context.json(
      {
        status: "ok" as const,
        database: "ok" as const,
        timestamp: new Date().toISOString(),
      },
      200,
    );
  });

  app.openapi(configRoute, (context) => {
    context.set("routeName", "configz");
    const config = readRuntimeConfig(context.env);
    if (!config.ok) {
      return context.json(
        createProblem(
          context.get("requestId"),
          503,
          "Service Unavailable",
          "runtime configuration is invalid",
        ),
        503,
        { "content-type": "application/problem+json" },
      );
    }
    return context.json(
      {
        environment: config.value.environment,
        release: config.value.release,
        runtime: "cloudflare-workers" as const,
        data: "d1" as const,
        migrationStatus: "identity-account-parity" as const,
      },
      200,
    );
  });

  registerIdentityRoutes(app, (env) =>
    dependencies.createIdentityService
      ? dependencies.createIdentityService(env)
      : new IdentityService(
          new D1IdentityRepository(env.DB),
          unavailableEmailSender,
          null,
          identityConfig(env),
        ),
  );

  app.doc31("/openapi.json", OPENAPI_DOCUMENT_CONFIG);

  app.notFound((context) => {
    context.set("routeName", "not_found");
    return problemResponse(context, 404, "Not Found", "route not found");
  });

  app.onError((error, context) => {
    context.set("routeName", "internal_error");
    console.error(
      JSON.stringify({
        event: "api_error",
        requestId: context.get("requestId"),
        category: error instanceof Error ? error.name : "unknown",
      }),
    );
    return problemResponse(
      context,
      500,
      "Internal Server Error",
      "an unexpected error occurred",
    );
  });
  return app;
}

export const app = createApp();

const unavailableEmailSender: EmailSender = {
  send: () => Promise.reject(new Error("email provider is not configured")),
};

export function createOpenApiDocument(): object {
  return app.getOpenAPI31Document(OPENAPI_DOCUMENT_CONFIG);
}
