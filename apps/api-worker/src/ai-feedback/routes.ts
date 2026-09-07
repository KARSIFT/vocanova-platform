import { z } from "@hono/zod-openapi";
import type { OpenAPIHono } from "@hono/zod-openapi";

import { SESSION_COOKIE_SECURITY } from "../http/openapi.js";
import { AIFeedbackError } from "../domain/ai-feedback.js";
import type { VocaNovaWorkerEnvironment } from "../http/middleware.js";
import { ProblemSchema, problemResponse } from "../http/problem.js";
import {
  authenticated,
  identityProblem,
  requireCsrf,
} from "../identity/routes.js";
import type { IdentityService } from "../identity/service.js";
import { D1AIFeedbackRepository } from "./repository.js";
import { AIFeedbackService } from "./service.js";

const Uuid = z.uuid();
const SubmitInput = z.object({
  sentenceText: z.string().max(300),
  source: z.enum(["word_detail", "review", "daily_mission", "free_practice"]),
  attemptId: Uuid,
});
const ReportInput = z.object({
  reason: z.string().max(200),
  classification: z.string().max(100).optional(),
});
const csrfParameter = {
  name: "X-CSRF-Token",
  in: "header" as const,
  required: true,
  schema: { type: "string" as const },
};
const FeedbackResult = z.object({
  sentenceId: Uuid.optional(),
  attemptId: Uuid.optional(),
  status: z.enum(["correct", "needs_improvement", "incorrect"]).optional(),
  originalSentence: z.string(),
  correctedSentence: z.string().optional(),
  explanation: z.string().optional(),
  improvementTip: z.string().optional(),
  missionCompleted: z.boolean(),
  canRetry: z.boolean(),
  reported: z.boolean(),
  errorCode: z.string().optional(),
  errorMessage: z.string().optional(),
  crisisResourceMessage: z.string().optional(),
});
const HistoryItem = z.object({
  attemptId: Uuid,
  completedAt: z.iso.datetime(),
  originalSentence: z.string(),
  status: z.enum(["correct", "needs_improvement", "incorrect"]),
  correctedSentence: z.string().optional(),
  explanation: z.string(),
  improvementTip: z.string().optional(),
  targetWord: z.string().optional(),
  targetMeaning: z.string().optional(),
});

export function registerAIFeedbackRoutes(
  app: OpenAPIHono<VocaNovaWorkerEnvironment>,
  identityFactory: (env: CloudflareEnv) => IdentityService,
  serviceFactory: (env: CloudflareEnv) => AIFeedbackService,
): void {
  app.post("/api/v1/sentence-feedback", async (context) => {
    context.set("routeName", "submit_sentence_feedback");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      requireCsrf(context.req.raw);
      const input = SubmitInput.parse(await context.req.json());
      const { result, telemetry } = await serviceFactory(context.env).submit(
        user.id,
        input,
        context.req.header("idempotency-key") ?? "",
      );
      context.executionCtx.waitUntil(telemetry);
      return context.json(FeedbackResult.parse(result), 200);
    } catch (error) {
      return aiProblem(context, error);
    }
  });

  app.post("/api/v1/sentence-feedback/:attemptId/reports", async (context) => {
    context.set("routeName", "report_sentence_feedback");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      requireCsrf(context.req.raw);
      const attemptId = Uuid.parse(context.req.param("attemptId"));
      const input = ReportInput.parse(await context.req.json());
      const telemetry = serviceFactory(context.env).report(
        user.id,
        attemptId,
        input.reason,
        input.classification,
      );
      context.executionCtx.waitUntil(telemetry);
      await telemetry;
      return context.body(null, 204);
    } catch (error) {
      return aiProblem(context, error);
    }
  });

  app.get("/api/v1/sentence-feedback/history", async (context) => {
    context.set("routeName", "list_sentence_feedback_history");
    try {
      const { user } = await authenticated(
        context.req.raw,
        identityFactory(context.env),
      );
      const limit = context.req.query("limit");
      const page = await new D1AIFeedbackRepository(context.env.DB).listHistory(
        user.id,
        context.req.query("after") ?? "",
        limit === undefined ? 10 : Number(limit),
      );
      return context.json(
        z
          .object({
            items: z.array(HistoryItem),
            nextCursor: z.string().optional(),
          })
          .parse(page),
      );
    } catch (error) {
      return aiProblem(context, error);
    }
  });

  const json = (schema: z.ZodType) => ({ "application/json": { schema } });
  const problem = (description: string) => ({
    description,
    content: { "application/problem+json": { schema: ProblemSchema } },
  });
  app.openAPIRegistry.registerPath({
    method: "get",
    path: "/api/v1/sentence-feedback/history",
    operationId: "ListSentenceFeedbackHistory",
    tags: ["AI Feedback"],
    security: [{ [SESSION_COOKIE_SECURITY]: [] }],
    parameters: [
      {
        name: "after",
        in: "query",
        required: false,
        schema: { type: "string" },
      },
      {
        name: "limit",
        in: "query",
        required: false,
        schema: { type: "integer", default: 10 },
      },
    ],
    responses: {
      200: {
        description: "Recent completed sentence feedback",
        content: json(
          z.object({
            items: z.array(HistoryItem),
            nextCursor: z.string().optional(),
          }),
        ),
      },
      400: problem("Invalid cursor"),
      401: problem("Authentication required"),
      500: problem("Unexpected server error"),
    },
  });
  app.openAPIRegistry.registerPath({
    method: "post",
    path: "/api/v1/sentence-feedback",
    operationId: "SubmitSentenceFeedback",
    tags: ["AI Feedback"],
    security: [{ [SESSION_COOKIE_SECURITY]: [] }],
    parameters: [
      {
        name: "Idempotency-Key",
        in: "header",
        required: true,
        schema: { type: "string", minLength: 1, maxLength: 200 },
      },
      csrfParameter,
    ],
    request: { body: { content: json(SubmitInput) } },
    responses: {
      200: {
        description:
          "Feedback result, which may include a business-level error code",
        content: json(FeedbackResult),
      },
      400: problem("Malformed request"),
      401: problem("Authentication required"),
      403: problem("Invalid CSRF token"),
      404: problem("Owner or target resource not found"),
      409: problem("Idempotency conflict"),
      422: problem("Invalid request or Idempotency-Key"),
      500: problem("Unexpected server error"),
    },
  });
  app.openAPIRegistry.registerPath({
    method: "post",
    path: "/api/v1/sentence-feedback/{attemptId}/reports",
    operationId: "ReportSentenceFeedback",
    tags: ["AI Feedback"],
    security: [{ [SESSION_COOKIE_SECURITY]: [] }],
    parameters: [
      {
        name: "attemptId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      csrfParameter,
    ],
    request: { body: { content: json(ReportInput) } },
    responses: {
      204: { description: "Report recorded" },
      400: problem("Malformed report request"),
      401: problem("Authentication required"),
      403: problem("Invalid CSRF token"),
      404: problem("Feedback attempt not found"),
      422: problem("Invalid request body"),
      500: problem("Unexpected server error"),
    },
  });
}

function aiProblem(
  context: Parameters<typeof problemResponse>[0],
  error: unknown,
): Response {
  if (error instanceof AIFeedbackError) {
    const mapping: Record<
      AIFeedbackError["code"],
      [400 | 404 | 409 | 422, string]
    > = {
      invalid_idempotency: [422, "missing or invalid Idempotency-Key"],
      idempotency_conflict: [409, "idempotency conflict"],
      target_not_found: [404, "owner or target resource not found"],
      attempt_not_found: [404, "feedback attempt not found"],
      invalid_report: [400, "invalid report"],
      invalid_cursor: [400, "invalid cursor"],
    };
    const [status, detail] = mapping[error.code];
    return problemResponse(context, status, "Request Failed", detail);
  }
  return identityProblem(context, error);
}
