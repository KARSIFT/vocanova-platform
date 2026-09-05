import assert from "node:assert/strict";
import { it } from "node:test";

import { ApiResponseError } from "@vocanova/api-client";

import { handleApiError } from "../../src/lib/session";

const fallbackMessage = "Unable to submit your answer. Please try again.";

it("uses caller-safe retry copy for authenticated server failures", () => {
  assert.equal(
    handleApiError(new ApiResponseError(500, null), fallbackMessage),
    fallbackMessage,
  );
  assert.equal(
    handleApiError(
      new ApiResponseError(503, { detail: "upstream request id: internal-only" }),
      fallbackMessage,
    ),
    fallbackMessage,
  );
});

it("retains actionable client-validation details", () => {
  assert.equal(
    handleApiError(
      new ApiResponseError(422, { detail: "Daily review target must be at most 100." }),
      fallbackMessage,
    ),
    "Daily review target must be at most 100.",
  );
});

it("retains the session-expiry redirect outcome", () => {
  assert.equal(
    handleApiError(new ApiResponseError(401, { detail: "session expired" }), fallbackMessage),
    "Your session expired. Redirecting you to sign in...",
  );
});
