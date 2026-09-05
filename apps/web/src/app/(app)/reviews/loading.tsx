export default function ReviewsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading review"
      className="animate-pulse p-[var(--spacing-lg)]"
    >
      <div className="flex items-center justify-between">
        <div className="h-7 w-1/4 rounded bg-neutral-200" />
        <div className="h-4 w-1/5 rounded bg-neutral-200" />
      </div>
      <section className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm">
        <div className="h-5 w-1/3 rounded bg-neutral-200" />
        <div className="mt-[var(--spacing-md)] h-8 w-full rounded bg-neutral-200" />
        <div className="mt-[var(--spacing-md)] grid grid-cols-2 gap-[var(--spacing-sm)]">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[var(--spacing-2xl)] rounded bg-neutral-200"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
