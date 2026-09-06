import type {
  EnglishLevel,
  LearningGoal,
  MainUseCase,
} from "@vocanova/api-client";

export const ONBOARDING_RECOVERY_KEY = "vocanova.onboarding-recovery.v1";
const MAX_AGE_MS = 30 * 60 * 1000;
const ENGLISH_LEVELS = new Set<EnglishLevel>([
  "a1",
  "a2",
  "b1",
  "b2",
  "unknown",
]);
const LEARNING_GOALS = new Set<LearningGoal>([
  "general",
  "work",
  "travel",
  "study",
  "conversation",
  "exam",
]);
const MAIN_USE_CASES = new Set<MainUseCase>([
  "daily_life",
  "work",
  "travel",
  "study",
  "social",
]);
const DAILY_REVIEW_TARGETS = new Set([5, 10, 15, 20, 30, 50, 75, 100]);

export interface OnboardingRecoveryRecord {
  version: 1;
  ownerId: string;
  englishLevel: EnglishLevel;
  nativeLanguage: string;
  learningGoal: LearningGoal;
  mainUseCase: MainUseCase;
  dailyReviewTarget: number;
  timezone: string;
  step: number;
  createdAt: number;
}

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function validString(value: unknown, max: number): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= max
  );
}

function valid(record: unknown): record is OnboardingRecoveryRecord {
  if (!record || typeof record !== "object") return false;
  const value = record as Record<string, unknown>;
  return (
    value.version === 1 &&
    validString(value.ownerId, 200) &&
    ENGLISH_LEVELS.has(value.englishLevel as EnglishLevel) &&
    validString(value.nativeLanguage, 100) &&
    LEARNING_GOALS.has(value.learningGoal as LearningGoal) &&
    MAIN_USE_CASES.has(value.mainUseCase as MainUseCase) &&
    DAILY_REVIEW_TARGETS.has(value.dailyReviewTarget as number) &&
    validString(value.timezone, 100) &&
    Number.isInteger(value.step) &&
    (value.step as number) >= 0 &&
    (value.step as number) <= 4 &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt) &&
    value.createdAt <= Date.now()
  );
}

export function saveOnboardingRecovery(
  record: Omit<OnboardingRecoveryRecord, "version" | "createdAt">,
): void {
  const target = storage();
  const recovery = { ...record, version: 1 as const, createdAt: Date.now() };
  if (!target || !valid(recovery)) return;
  try {
    target.setItem(ONBOARDING_RECOVERY_KEY, JSON.stringify(recovery));
  } catch {
    // Storage failures never interrupt the session-expiry redirect.
  }
}

export function readOnboardingRecovery(
  ownerId?: string,
): OnboardingRecoveryRecord | null {
  const target = storage();
  if (!target) return null;
  if (!ownerId) {
    try {
      target.removeItem(ONBOARDING_RECOVERY_KEY);
    } catch {
      // Storage failures leave recovery unavailable.
    }
    return null;
  }
  try {
    const raw = target.getItem(ONBOARDING_RECOVERY_KEY);
    if (!raw) return null;
    const record: unknown = JSON.parse(raw);
    if (
      !valid(record) ||
      Date.now() - record.createdAt > MAX_AGE_MS ||
      record.ownerId !== ownerId
    ) {
      target.removeItem(ONBOARDING_RECOVERY_KEY);
      return null;
    }
    return record;
  } catch {
    try {
      target.removeItem(ONBOARDING_RECOVERY_KEY);
    } catch {
      // A malformed entry cannot be removed when storage is blocked.
    }
    return null;
  }
}

export function clearOnboardingRecovery(ownerId?: string): void {
  const target = storage();
  if (!target) return;
  try {
    const record = readOnboardingRecovery(ownerId);
    if (!ownerId || record) target.removeItem(ONBOARDING_RECOVERY_KEY);
  } catch {
    // Storage failures never interrupt onboarding completion or discard.
  }
}
