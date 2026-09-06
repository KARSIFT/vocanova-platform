export function formatReviewDateTime(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: "UTC",
    timeZoneName: "short",
    year: "numeric",
  }).format(new Date(isoDateTime));
}

export function isDueReview(isoDateTime: string, now = Date.now()): boolean {
  return Date.parse(isoDateTime) <= now;
}
