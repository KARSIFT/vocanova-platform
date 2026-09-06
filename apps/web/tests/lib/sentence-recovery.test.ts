import assert from "node:assert/strict";
import { afterEach, it } from "node:test";

import {
  clearSentenceRecovery,
  readSentenceRecovery,
  saveSentenceRecovery,
  SENTENCE_RECOVERY_KEY,
} from "../../src/lib/sentence-recovery";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

let storage = new MemoryStorage();
function installStorage(next = new MemoryStorage()) {
  storage = next;
  Object.defineProperty(globalThis, "window", { configurable: true, value: { sessionStorage: storage } });
}
function record(overrides = {}) {
  return { ownerId: "user-a", source: "word_detail" as const, attemptId: "uw-1", path: "/discover/ordering-at-a-cafe/pour", targetWord: "pour", sentence: "I pour coffee.", ...overrides };
}
afterEach(() => { Reflect.deleteProperty(globalThis, "window"); });

it("restores only an unexpired record for its verified owner", () => {
  installStorage(); saveSentenceRecovery(record());
  assert.equal(readSentenceRecovery("user-a")?.sentence, "I pour coffee.");
  assert.equal(readSentenceRecovery("user-b"), null);
  assert.equal(storage.getItem(SENTENCE_RECOVERY_KEY), null);
});

it("rejects malformed, expired, missing-identity, and oversized records", () => {
  installStorage();
  storage.setItem(SENTENCE_RECOVERY_KEY, "not json");
  assert.equal(readSentenceRecovery("user-a"), null);
  storage.setItem(SENTENCE_RECOVERY_KEY, JSON.stringify({ ...record(), version: 1, createdAt: Date.now() - 30 * 60 * 1000 - 1 }));
  assert.equal(readSentenceRecovery("user-a"), null);
  saveSentenceRecovery(record({ sentence: "x".repeat(301) }));
  assert.equal(storage.getItem(SENTENCE_RECOVERY_KEY), null);
  saveSentenceRecovery(record());
  assert.equal(readSentenceRecovery(undefined), null);
  assert.equal(storage.getItem(SENTENCE_RECOVERY_KEY), null);
});

it("clears records with invalid source, owner, target, definition, path, or future time", () => {
  installStorage();
  for (const invalid of [
    record({ source: "unknown" }), record({ ownerId: "" }), record({ targetWord: "" }),
    record({ shortDefinition: 4 }), record({ path: "/settings" }),
    record({ createdAt: Date.now() + 1 }),
  ]) {
    storage.setItem(SENTENCE_RECOVERY_KEY, JSON.stringify({ ...invalid, version: 1 }));
    assert.equal(readSentenceRecovery("user-a"), null);
    assert.equal(storage.getItem(SENTENCE_RECOVERY_KEY), null);
  }
});

it("fails closed when session storage is unavailable and clears on discard or success", () => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: { get sessionStorage() { throw new Error("blocked"); } } });
  assert.doesNotThrow(() => saveSentenceRecovery(record()));
  assert.equal(readSentenceRecovery("user-a"), null);
  installStorage(); saveSentenceRecovery(record());
  clearSentenceRecovery("user-a");
  assert.equal(storage.getItem(SENTENCE_RECOVERY_KEY), null);
});
