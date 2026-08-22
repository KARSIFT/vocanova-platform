export const SESSION_COOKIE = "vocanova_session";
export const CSRF_COOKIE = "vocanova_csrf";
export const OAUTH_STATE_COOKIE = "vocanova_oauth_state";

export function readCookie(request: Request, name: string): string {
  const header = request.headers.get("cookie") ?? "";
  for (const item of header.split(";")) {
    const [key, ...value] = item.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

export function sessionCookie(
  token: string,
  maxAge: number,
  secure = true,
): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function csrfCookie(
  token: string,
  maxAge: number,
  secure = true,
): string {
  return `${CSRF_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function oauthStateCookie(
  token: string,
  maxAge: number,
  secure = true,
): string {
  return `${OAUTH_STATE_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function clearCookie(
  name: string,
  httpOnly: boolean,
  secure = true,
): string {
  return `${name}=; Path=/; Max-Age=0; ${httpOnly ? "HttpOnly; " : ""}SameSite=Lax${secure ? "; Secure" : ""}`;
}
