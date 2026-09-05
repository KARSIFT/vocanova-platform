import assert from "node:assert/strict";
import { it } from "node:test";

import { normalizeReturnTo } from "../../src/lib/return-to";

it("keeps documented protected local paths and their query strings", () => {
  assert.equal(normalizeReturnTo("/reviews?tab=due"), "/reviews?tab=due");
  assert.equal(normalizeReturnTo("/reviews?q=two%20words"), "/reviews?q=two%20words");
  assert.equal(
    normalizeReturnTo("/reviews?next=%2Fdiscover"),
    "/reviews?next=%2Fdiscover",
  );
  assert.equal(
    normalizeReturnTo("/discover/ordering-at-a-cafe/pour?source=magic"),
    "/discover/ordering-at-a-cafe/pour?source=magic",
  );
  assert.equal(normalizeReturnTo("/settings/account"), "/settings/account");
});

for (const unsafePath of [
  undefined,
  "",
  "\n/reviews",
  "https://example.test/reviews",
  "//example.test/reviews",
  "/discover/%2Fsecret",
  "/discover/word%5Csecret",
  "/unknown",
  "/signin",
  "/reviews%00",
]) {
  it(`falls back to home for ${String(unsafePath)}`, () => {
    assert.equal(normalizeReturnTo(unsafePath), "/home");
  });
}
