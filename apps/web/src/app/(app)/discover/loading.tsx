export default function DiscoverLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading journey"
      className="animate-pulse p-[var(--spacing-lg)]"
    >
      <div className="h-7 w-1/3 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-xs)] h-4 w-2/3 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-lg)] grid grid-cols-1 gap-[var(--spacing-md)] sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
          >
            <div className="h-5 w-2/3 rounded bg-neutral-200" />
            <div className="mt-[var(--spacing-sm)] h-4 w-full rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
