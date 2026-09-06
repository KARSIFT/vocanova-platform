export function formatReviewDateTime(
  isoDateTime: string,
  timezone?: string,
): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZoneName: "short",
    year: "numeric",
  };
  const date = new Date(isoDateTime);
  try {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: timezone ?? "UTC",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      ...options,
      timeZone: "UTC",
    }).format(date);
  }
}

export function isDueReview(isoDateTime: string, now = Date.now()): boolean {
  return Date.parse(isoDateTime) <= now;
}
