import { z } from "@hono/zod-openapi";
import type { Context } from "hono";

export const ProblemSchema = z
  .object({
    type: z.literal("about:blank"),
    title: z.string(),
    status: z.number().int(),
    detail: z.string(),
    requestId: z.uuid(),
  })
  .openapi("Problem");

export interface Problem {
  type: "about:blank";
  title: string;
  status: number;
  detail: string;
  requestId: string;
}

export function createProblem(
  requestId: string,
  status: number,
  title: string,
  detail: string,
): Problem {
  return { type: "about:blank", title, status, detail, requestId };
}

export function problemResponse(
  context: Context,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503,
  title: string,
  detail: string,
): Response {
  return context.json(
    createProblem(context.get("requestId"), status, title, detail),
    status,
    { "content-type": "application/problem+json" },
  );
}
