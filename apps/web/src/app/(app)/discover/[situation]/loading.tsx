export default function JourneySituationLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading journey situation"
      className="animate-pulse p-[var(--spacing-lg)]"
    >
      <div className="h-6 w-36 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-md)] h-8 w-2/3 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-xs)] h-5 w-3/4 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
          >
            <div className="h-6 w-1/3 rounded bg-neutral-200" />
            <div className="mt-[var(--spacing-sm)] h-5 w-4/5 rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
