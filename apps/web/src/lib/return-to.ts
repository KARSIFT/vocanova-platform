const DEFAULT_RETURN_TO = "/home";

const EXACT_PROTECTED_PATHS = new Set([
  "/home",
  "/discover",
  "/reviews",
  "/progress",
  "/settings",
  "/settings/account",
  "/onboarding",
]);

const DISCOVER_PATH = /^\/discover\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)?$/;
const UNSAFE_CHARACTER = new RegExp(
  `[\\\\${String.fromCharCode(0)}-${String.fromCharCode(31)}${String.fromCharCode(127)}]`,
);
const ENCODED_UNSAFE_PATH_CHARACTER = /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f)/i;

export function normalizeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    UNSAFE_CHARACTER.test(value)
  ) {
    return DEFAULT_RETURN_TO;
  }

  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("#")
  ) {
    return DEFAULT_RETURN_TO;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return DEFAULT_RETURN_TO;
  }
  if (UNSAFE_CHARACTER.test(decoded)) {
    return DEFAULT_RETURN_TO;
  }

  let url: URL;
  try {
    url = new URL(candidate, "https://vocanova.local");
  } catch {
    return DEFAULT_RETURN_TO;
  }
  const path = url.pathname;
  if (
    url.origin !== "https://vocanova.local" ||
    ENCODED_UNSAFE_PATH_CHARACTER.test(path) ||
    (!EXACT_PROTECTED_PATHS.has(path) && !DISCOVER_PATH.test(path))
  ) {
    return DEFAULT_RETURN_TO;
  }

  return `${path}${url.search}`;
}
