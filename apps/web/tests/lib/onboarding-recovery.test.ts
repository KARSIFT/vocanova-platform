import assert from "node:assert/strict";
import { afterEach, it } from "node:test";

import {
  clearOnboardingRecovery,
  ONBOARDING_RECOVERY_KEY,
  readOnboardingRecovery,
  saveOnboardingRecovery,
} from "../../src/lib/onboarding-recovery";

class MemoryStorage {
  values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

let storage = new MemoryStorage();
function installStorage(next = new MemoryStorage()) {
  storage = next;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { sessionStorage: storage },
  });
}
function record(overrides = {}) {
  return {
    ownerId: "user-a",
    englishLevel: "b1" as const,
    nativeLanguage: "fa",
    learningGoal: "work" as const,
    mainUseCase: "daily_life" as const,
    dailyReviewTarget: 30,
    timezone: "Asia/Tehran",
    step: 4,
    ...overrides,
  };
}
afterEach(() => { Reflect.deleteProperty(globalThis, "window"); });

it("restores complete answers only for the verified owner", () => {
  installStorage();
  saveOnboardingRecovery(record());
  const restored = readOnboardingRecovery("user-a");
  assert.ok(restored);
  assert.deepEqual(
    { ...restored, createdAt: 0 },
    { ...record(), version: 1, createdAt: 0 },
  );
  assert.equal(readOnboardingRecovery("user-b"), null);
  assert.equal(storage.getItem(ONBOARDING_RECOVERY_KEY), null);
});

it("rejects malformed, expired, future, and oversized records", () => {
  installStorage();
  storage.setItem(ONBOARDING_RECOVERY_KEY, "not json");
  assert.equal(readOnboardingRecovery("user-a"), null);
  storage.setItem(
    ONBOARDING_RECOVERY_KEY,
    JSON.stringify({ ...record(), version: 1, createdAt: Date.now() - 30 * 60 * 1000 - 1 }),
  );
  assert.equal(readOnboardingRecovery("user-a"), null);
  storage.setItem(
    ONBOARDING_RECOVERY_KEY,
    JSON.stringify({ ...record(), version: 1, createdAt: Date.now() + 60_000 }),
  );
  assert.equal(readOnboardingRecovery("user-a"), null);
  saveOnboardingRecovery(record({ nativeLanguage: "x".repeat(101) }));
  assert.equal(storage.getItem(ONBOARDING_RECOVERY_KEY), null);
});

it("fails safely with unavailable storage and clears after discard or success", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { get sessionStorage() { throw new Error("blocked"); } },
  });
  assert.doesNotThrow(() => saveOnboardingRecovery(record()));
  assert.equal(readOnboardingRecovery("user-a"), null);
  installStorage();
  saveOnboardingRecovery(record());
  clearOnboardingRecovery("user-a");
  assert.equal(storage.getItem(ONBOARDING_RECOVERY_KEY), null);
});
