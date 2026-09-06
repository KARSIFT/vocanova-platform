export const SENTENCE_RECOVERY_KEY = "vocanova.sentence-recovery.v1";
const MAX_AGE_MS = 30 * 60 * 1000;

export interface SentenceRecoveryRecord {
  version: 1;
  ownerId: string;
  source: "word_detail" | "review" | "daily_mission" | "free_practice";
  attemptId: string;
  path: string;
  targetWord: string;
  shortDefinition?: string;
  sentence: string;
  createdAt: number;
}

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
function valid(record: unknown): record is SentenceRecoveryRecord {
  if (!record || typeof record !== "object") return false;
  const value = record as Record<string, unknown>;
  return (
    value.version === 1 &&
    validString(value.ownerId, 200) &&
    (value.source === "word_detail" ||
      value.source === "review" ||
      value.source === "daily_mission" ||
      value.source === "free_practice") &&
    validString(value.attemptId, 200) &&
    validPath(value.path) &&
    validString(value.targetWord, 200) &&
    typeof value.sentence === "string" &&
    value.sentence.trim().length > 0 &&
    value.sentence.length <= 300 &&
    (value.shortDefinition === undefined ||
      validString(value.shortDefinition, 300)) &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt) &&
    value.createdAt <= Date.now()
  );
}
function validString(value: unknown, max: number): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= max
  );
}
function validPath(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  if (value === "/home" || value === "/reviews") return true;
  try {
    const url = new URL(value, "http://vocanova.local");
    return (
      url.origin === "http://vocanova.local" &&
      ((/^\/discover\/[a-z0-9-]+\/[a-z0-9-]+$/.test(url.pathname) &&
        !url.search) ||
        (/^\/discover\/saved\/[^/]+$/.test(url.pathname) &&
          /^\?meaning=[^&]+$/.test(url.search)))
    );
  } catch {
    return false;
  }
}
export function saveSentenceRecovery(
  record: Omit<SentenceRecoveryRecord, "version" | "createdAt">,
): void {
  const target = storage();
  if (
    !target ||
    !record.ownerId ||
    !record.sentence.trim() ||
    record.sentence.length > 300
  )
    return;
  try {
    target.setItem(
      SENTENCE_RECOVERY_KEY,
      JSON.stringify({ ...record, version: 1, createdAt: Date.now() }),
    );
  } catch {
    // Storage failures never interrupt session recovery.
  }
}
export function readSentenceRecovery(
  ownerId?: string,
): SentenceRecoveryRecord | null {
  const target = storage();
  if (!target) return null;
  if (!ownerId) {
    try {
      target.removeItem(SENTENCE_RECOVERY_KEY);
    } catch {
      // Storage failures leave recovery disabled.
    }
    return null;
  }
  try {
    const raw = target.getItem(SENTENCE_RECOVERY_KEY);
    if (!raw) return null;
    const record: unknown = JSON.parse(raw);
    if (
      !valid(record) ||
      Date.now() - record.createdAt > MAX_AGE_MS ||
      record.ownerId !== ownerId
    ) {
      target.removeItem(SENTENCE_RECOVERY_KEY);
      return null;
    }
    return record;
  } catch {
    try {
      target.removeItem(SENTENCE_RECOVERY_KEY);
    } catch {
      // A malformed entry cannot be removed when storage is blocked.
    }
    return null;
  }
}
export function clearSentenceRecovery(ownerId?: string): void {
  const target = storage();
  if (!target) return;
  try {
    const record = readSentenceRecovery(ownerId);
    if (!ownerId || record) target.removeItem(SENTENCE_RECOVERY_KEY);
  } catch {
    // Storage failures never interrupt logout or account deletion.
  }
}
