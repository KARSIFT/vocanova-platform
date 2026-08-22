export const MISSION_POLICY_VERSION = "p4-mission-policy-v1";
export const DEFAULT_TIMEZONE = "UTC";
export const DEFAULT_REVIEW_TARGET = 20;

export interface StreakView {
  currentStreakCount: number;
  longestStreakCount: number;
  status: "active" | "at_risk" | "broken";
  graceDayBalance: number;
}

export interface DailyMission {
  localDate: string;
  timezone: string;
  reviewTarget: number;
  reviewsCompleted: number;
  newWordTarget?: number;
  newWordsCompleted?: number;
  sentencePracticeTarget?: number;
  sentencePracticesCompleted?: number;
  policyVersion: string;
  status: "open" | "completed" | "missed" | "protected";
  completedAt?: string;
  graceApplied: boolean;
  streak: StreakView;
}

export interface Progress {
  confidencePointsBalance: number;
  streak: StreakView;
  completionHistory: Array<{ localDate: string; completed: boolean }>;
}

export class MissionsError extends Error {
  constructor(readonly code: "invalid_timezone") {
    super(code);
    this.name = "MissionsError";
  }
}

export function isValidTimezone(value: string): boolean {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}

export function localDate(now: Date, timezone: string): string {
  if (!isValidTimezone(timezone)) throw new MissionsError("invalid_timezone");
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${value.year}-${value.month}-${value.day}`;
}

export function addDays(date: string, days: number): string {
  const instant = new Date(`${date}T00:00:00.000Z`);
  instant.setUTCDate(instant.getUTCDate() + days);
  return instant.toISOString().slice(0, 10);
}

export function daysBetween(later: string, earlier: string): number {
  return Math.floor(
    (Date.parse(`${later}T00:00:00.000Z`) -
      Date.parse(`${earlier}T00:00:00.000Z`)) /
      86_400_000,
  );
}
