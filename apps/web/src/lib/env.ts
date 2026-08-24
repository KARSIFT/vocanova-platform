export function getApiBaseURL(): string {
  if (typeof window === "undefined") {
    return (
      process.env.API_BASE_URL ??
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "http://127.0.0.1:8080"
    );
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";
}

export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://127.0.0.1:3000";
}
