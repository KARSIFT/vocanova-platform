export default function WordDetailLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading word details"
      className="animate-pulse p-[var(--spacing-lg)]"
    >
      <div className="h-6 w-36 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-md)] h-8 w-1/2 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-xs)] h-5 w-1/4 rounded bg-neutral-200" />
      <section className="mt-[var(--spacing-lg)]">
        <div className="h-7 w-28 rounded bg-neutral-200" />
        <div className="mt-[var(--spacing-sm)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm">
          <div className="h-5 w-1/4 rounded bg-neutral-200" />
          <div className="mt-[var(--spacing-sm)] h-5 w-full rounded bg-neutral-200" />
          <div className="mt-[var(--spacing-xs)] h-5 w-4/5 rounded bg-neutral-200" />
        </div>
      </section>
    </div>
  );
}
