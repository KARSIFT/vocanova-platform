import type { MiddlewareHandler } from "hono";

import { readRuntimeConfig } from "../config.js";

type WorkerEnvironment = {
  Bindings: CloudflareEnv;
  Variables: WorkerVariables;
};

export interface WorkerVariables {
  requestId: string;
  routeName: string;
}

export const requestContext: MiddlewareHandler<WorkerEnvironment> = async (
  context,
  next,
) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  context.set("requestId", requestId);
  context.set("routeName", "unmatched");
  context.header("x-request-id", requestId);
  await next();
  console.log(
    JSON.stringify({
      event: "api_request",
      requestId,
      method: context.req.method,
      route: context.get("routeName"),
      status: context.res.status,
      durationMs: Date.now() - startedAt,
    }),
  );
};

export const corsPolicy: MiddlewareHandler<WorkerEnvironment> = async (
  context,
  next,
) => {
  const origin = context.req.header("origin");
  const config = readRuntimeConfig(context.env);
  const allowed =
    config.ok && origin !== undefined
      ? config.value.corsAllowedOrigins.includes(origin)
      : false;

  if (allowed && origin) {
    context.header("access-control-allow-origin", origin);
    context.header("access-control-allow-credentials", "true");
    context.header("vary", "Origin");
  }

  if (
    context.req.method === "OPTIONS" &&
    context.req.header("access-control-request-method")
  ) {
    if (allowed) {
      context.header(
        "access-control-allow-methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
      context.header(
        "access-control-allow-headers",
        context.req.header("access-control-request-headers") ??
          "Content-Type, Authorization",
      );
      context.header("access-control-max-age", "600");
    }
    return context.body(null, 204);
  }

  await next();
};

export type VocaNovaWorkerEnvironment = WorkerEnvironment;
