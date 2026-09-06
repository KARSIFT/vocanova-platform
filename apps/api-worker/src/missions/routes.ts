import { z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";

import { SESSION_COOKIE_SECURITY } from "../http/openapi.js";
import { MissionsError } from "../domain/missions.js";
import type { VocaNovaWorkerEnvironment } from "../http/middleware.js";
import { problemResponse } from "../http/problem.js";
import { authenticated, identityProblem } from "../identity/routes.js";
import type { IdentityService } from "../identity/service.js";
import { D1MissionsRepository } from "./repository.js";

const Streak = z.object({
  currentStreakCount: z.number().int(),
  longestStreakCount: z.number().int(),
  status: z.enum(["active", "at_risk", "broken"]),
  graceDayBalance: z.number().int(),
});
const DailyMission = z.object({
  localDate: z.iso.date(),
  timezone: z.string(),
  reviewTarget: z.number().int(),
  reviewsCompleted: z.number().int(),
  newWordTarget: z.number().int().optional(),
  newWordsCompleted: z.number().int().optional(),
  sentencePracticeTarget: z.number().int().optional(),
  sentencePracticesCompleted: z.number().int().optional(),
  policyVersion: z.string(),
  status: z.enum(["open", "completed", "missed", "protected"]),
  completedAt: z.iso.datetime().optional(),
  graceApplied: z.boolean(),
  streak: Streak,
});
const Progress = z.object({
  confidencePointsBalance: z.number().int(),
  streak: Streak,
  completionHistory: z.array(
    z.object({
      localDate: z.iso.date(),
      completed: z.boolean(),
      status: z.enum(["open", "completed", "missed", "protected"]),
    }),
  ),
});

export function registerMissionsRoutes(
  app: OpenAPIHono<VocaNovaWorkerEnvironment>,
  identityFactory: (env: CloudflareEnv) => IdentityService,
  repositoryFactory: (env: CloudflareEnv) => D1MissionsRepository,
): void {
  app.get("/api/v1/daily-mission", async (context) => {
    context.set("routeName", "get_daily_mission");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      return context.json(
        DailyMission.parse(
          await repositoryFactory(context.env).getDailyMission(
            user.id,
            context.req.query("timezone") ?? "",
          ),
        ),
        200,
      );
    } catch (error) {
      return missionsProblem(context, error);
    }
  });

  app.get("/api/v1/progress", async (context) => {
    context.set("routeName", "get_progress");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      return context.json(
        Progress.parse(
          await repositoryFactory(context.env).getProgress(
            user.id,
            context.req.query("timezone") ?? "",
          ),
        ),
        200,
      );
    } catch (error) {
      return missionsProblem(context, error);
    }
  });

  const timezoneParameter = [
    {
      name: "timezone",
      in: "query" as const,
      required: false,
      schema: { type: "string" as const },
    },
  ];
  app.openAPIRegistry.registerPath({
    method: "get",
    path: "/api/v1/daily-mission",
    operationId: "GetDailyMission",
    tags: ["Missions"],
    security: [{ [SESSION_COOKIE_SECURITY]: [] }],
    parameters: timezoneParameter,
    responses: {
      200: {
        description: "Today's daily mission projection",
        content: { "application/json": { schema: DailyMission } },
      },
    },
  });
  app.openAPIRegistry.registerPath({
    method: "get",
    path: "/api/v1/progress",
    operationId: "GetProgress",
    tags: ["Missions"],
    security: [{ [SESSION_COOKIE_SECURITY]: [] }],
    parameters: timezoneParameter,
    responses: {
      200: {
        description: "Progress projection",
        content: { "application/json": { schema: Progress } },
      },
    },
  });
}

function missionsProblem(
  context: Parameters<typeof problemResponse>[0],
  error: unknown,
): Response {
  if (error instanceof MissionsError)
    return problemResponse(
      context,
      400,
      "Invalid Request",
      "invalid IANA timezone",
    );
  return identityProblem(context, error);
}
