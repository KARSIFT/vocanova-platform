import assert from "node:assert/strict";
import { it } from "node:test";

import { normalizeReturnTo } from "../../src/lib/return-to";

it("keeps documented protected local paths and their query strings", () => {
  assert.equal(normalizeReturnTo("/reviews?tab=due"), "/reviews?tab=due");
  assert.equal(
    normalizeReturnTo("/reviews?q=two%20words"),
    "/reviews?q=two%20words",
  );
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

it("preserves encoded punctuation within one saved-word path segment", () => {
  for (const path of [
    "/discover/saved/repeat%3F?meaning=meaning-1",
    "/discover/saved/topic%23tag?meaning=meaning-2",
  ])
    assert.equal(normalizeReturnTo(path), path);
});

it("rejects encoded separators and nested encodings in saved-word paths", () => {
  for (const path of [
    "/discover/saved/word%2Fother?meaning=meaning-1",
    "/discover/saved/word%5Cother?meaning=meaning-1",
    "/discover/saved/word%252Fother?meaning=meaning-1",
    "/discover/saved/word%00?meaning=meaning-1",
  ])
    assert.equal(normalizeReturnTo(path), "/home");
});
