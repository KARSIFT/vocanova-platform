export default function SavedWordLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading saved word"
      className="animate-pulse p-[var(--spacing-lg)]"
    >
      <div className="h-[var(--spacing-2xl)] w-44 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-md)] h-7 w-1/3 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-xs)] h-4 w-1/4 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-lg)] rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)]">
        <div className="h-5 w-1/4 rounded bg-neutral-200" />
        <div className="mt-[var(--spacing-sm)] h-4 w-full rounded bg-neutral-200" />
        <div className="mt-[var(--spacing-md)] h-4 w-3/4 rounded bg-neutral-200" />
      </div>
    </div>
  );
}
