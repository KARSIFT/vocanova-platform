const JSON_HEADERS = {
  "cache-control": "no-store",
  "content-type": "application/json; charset=utf-8",
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: JSON_HEADERS });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const cookie = request.headers.get("cookie") ?? "";

    if (request.method !== "GET") {
      return json({ detail: "Method not allowed" }, 405);
    }

    if (url.pathname === "/api/v1/me") {
      if (cookie.includes("vocanova_session=api-error")) {
        return json({ detail: "Synthetic API failure" }, 503);
      }
      if (!cookie.includes("vocanova_session=")) {
        return json({ detail: "Unauthorized" }, 401);
      }
      return json({
        email: "workerd-fixture@example.test",
        displayName: "Workerd Fixture",
        emailVerifiedAt: "2026-01-01T00:00:00Z",
        onboardingStatus: "completed",
      });
    }

    if (url.pathname === "/api/v1/user-words") {
      return json({ items: [], nextCursor: null });
    }

    if (url.pathname === "/api/v1/reviews/due") {
      return json({ items: [], nextCursor: null, totalCount: 2 });
    }

    if (url.pathname === "/api/v1/daily-mission") {
      return json({
        localDate: "2026-08-22",
        timezone: "UTC",
        reviewTarget: 13,
        reviewsCompleted: 3,
        newWordTarget: 5,
        newWordsCompleted: 1,
        sentencePracticeTarget: 3,
        sentencePracticesCompleted: 0,
        policyVersion: "voc080-t03-workerd",
        status: "open",
        graceApplied: false,
        streak: {
          currentStreakCount: 4,
          longestStreakCount: 7,
          status: "active",
          graceDayBalance: 1,
        },
      });
    }

    return json({ detail: "Not found" }, 404);
  },
} satisfies ExportedHandler;
