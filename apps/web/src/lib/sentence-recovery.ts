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
    typeof value.ownerId === "string" &&
    typeof value.source === "string" &&
    typeof value.attemptId === "string" &&
    typeof value.path === "string" &&
    typeof value.targetWord === "string" &&
    typeof value.sentence === "string" &&
    value.sentence.length <= 300 &&
    typeof value.createdAt === "number"
  );
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
  } catch {}
}
export function readSentenceRecovery(
  ownerId?: string,
): SentenceRecoveryRecord | null {
  const target = storage();
  if (!target || !ownerId) return null;
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
    return null;
  }
}
export function clearSentenceRecovery(ownerId?: string): void {
  const target = storage();
  if (!target) return;
  try {
    const record = readSentenceRecovery(ownerId);
    if (!ownerId || record) target.removeItem(SENTENCE_RECOVERY_KEY);
  } catch {}
}
