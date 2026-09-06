import assert from "node:assert/strict";
import { it } from "node:test";

import { isDueReview } from "../../src/lib/review-schedule";

const NOW = Date.parse("2099-08-22T12:00:00.000Z");

it("treats a review scheduled at the exact current instant as due", () => {
  assert.equal(isDueReview("2099-08-22T12:00:00.000Z", NOW), true);
});

it("treats past reviews as due and future reviews as scheduled", () => {
  assert.equal(isDueReview("2099-08-22T11:59:59.999Z", NOW), true);
  assert.equal(isDueReview("2099-08-22T12:00:00.001Z", NOW), false);
});
