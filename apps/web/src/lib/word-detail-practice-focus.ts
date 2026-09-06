const FOCUS_KEY = "vocanova.word-detail-practice-focus.v1";
const MAX_AGE_MS = 30_000;

interface PracticeFocusIntent {
  version: 1;
  meaningId: string;
  path: string;
  createdAt: number;
}

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function validIntent(value: unknown): value is PracticeFocusIntent {
  return (
    !!value &&
    typeof value === "object" &&
    (value as PracticeFocusIntent).version === 1 &&
    typeof (value as PracticeFocusIntent).meaningId === "string" &&
    (value as PracticeFocusIntent).meaningId.length > 0 &&
    typeof (value as PracticeFocusIntent).path === "string" &&
    (value as PracticeFocusIntent).path.startsWith("/discover/") &&
    typeof (value as PracticeFocusIntent).createdAt === "number"
  );
}

export function requestWordDetailPracticeFocus(
  meaningId: string,
  path: string,
): void {
  const target = storage();
  if (!target || !meaningId || !path.startsWith("/discover/")) return;
  try {
    target.setItem(
      FOCUS_KEY,
      JSON.stringify({ version: 1, meaningId, path, createdAt: Date.now() }),
    );
  } catch {
    // Focus coordination is optional when session storage is unavailable.
  }
}

export function consumeWordDetailPracticeFocus(
  meaningId: string,
  path: string,
): boolean {
  const target = storage();
  if (!target) return false;
  try {
    const raw = target.getItem(FOCUS_KEY);
    if (!raw) return false;
    const intent: unknown = JSON.parse(raw);
    if (!validIntent(intent) || Date.now() - intent.createdAt > MAX_AGE_MS) {
      target.removeItem(FOCUS_KEY);
      return false;
    }
    if (intent.path !== path) {
      target.removeItem(FOCUS_KEY);
      return false;
    }
    if (intent.meaningId !== meaningId) return false;
    target.removeItem(FOCUS_KEY);
    return true;
  } catch {
    return false;
  }
}
