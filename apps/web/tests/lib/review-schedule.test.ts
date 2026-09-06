import assert from "node:assert/strict";
import { it } from "node:test";

import {
  formatReviewDateTime,
  isDueReview,
} from "../../src/lib/review-schedule";

const NOW = Date.parse("2099-08-22T12:00:00.000Z");

it("formats a scheduled review in UTC with its date and minute by default", () => {
  assert.equal(
    formatReviewDateTime("2099-08-22T12:30:00.000Z"),
    "Aug 22, 2099, 12:30 PM GMT+00:00",
  );
});

it("formats scheduled reviews in the learner timezone across offsets and DST", () => {
  assert.equal(
    formatReviewDateTime("2024-03-10T06:30:00.000Z", "America/New_York"),
    "Mar 10, 2024, 1:30 AM GMT-05:00",
  );
  assert.equal(
    formatReviewDateTime("2024-03-10T07:30:00.000Z", "America/New_York"),
    "Mar 10, 2024, 3:30 AM GMT-04:00",
  );
  assert.equal(
    formatReviewDateTime("2024-03-10T06:30:00.000Z", "Asia/Tehran"),
    "Mar 10, 2024, 10:00 AM GMT+03:30",
  );
  assert.equal(
    formatReviewDateTime("2024-03-10T06:30:00.000Z", "America/Los_Angeles"),
    "Mar 9, 2024, 10:30 PM GMT-08:00",
  );
});

it("falls back to UTC when the learner timezone cannot be used", () => {
  assert.equal(
    formatReviewDateTime("2099-08-22T12:30:00.000Z", "Not/A-Timezone"),
    "Aug 22, 2099, 12:30 PM GMT+00:00",
  );
});

it("treats a review scheduled at the exact current instant as due", () => {
  assert.equal(isDueReview("2099-08-22T12:00:00.000Z", NOW), true);
});

it("treats past reviews as due and future reviews as scheduled", () => {
  assert.equal(isDueReview("2099-08-22T11:59:59.999Z", NOW), true);
  assert.equal(isDueReview("2099-08-22T12:00:00.001Z", NOW), false);
});
