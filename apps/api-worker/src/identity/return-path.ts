const APP_RETURN_PATH =
  /^(?:\/(?:home|reviews|progress|onboarding)|\/settings(?:\/account)?|\/discover(?:\/[A-Za-z0-9_-]+){0,2})$/;

function hasUnsafeCharacters(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return character === "\\" || code < 32 || code === 127;
  });
}

export function supportedAppReturnPath(
  value: string | undefined,
): string | null {
  if (!value || value.length > 2048 || hasUnsafeCharacters(value)) return null;
  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("#")
  )
    return null;
  try {
    if (hasUnsafeCharacters(decodeURIComponent(candidate))) return null;
    const target = new URL(candidate, "https://return-path.invalid");
    if (
      target.origin !== "https://return-path.invalid" ||
      !APP_RETURN_PATH.test(target.pathname)
    )
      return null;
    return `${target.pathname}${target.search}`;
  } catch {
    return null;
  }
}

export function supportedOAuthReturnUrl(
  value: string,
  baseUrl: string,
  exactAllowlist: readonly string[],
): string | null {
  if (hasUnsafeCharacters(value)) return null;
  try {
    const target = new URL(value);
    if (target.username || target.password) return null;
    if (exactAllowlist.includes(value)) return value;
    if (target.origin !== new URL(baseUrl).origin) return null;
    const path = supportedAppReturnPath(`${target.pathname}${target.search}`);
    return path ? new URL(path, target.origin).toString() : null;
  } catch {
    return null;
  }
}
