export default function SavedVocabularyLoading() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading saved vocabulary"
      className="animate-pulse p-[var(--spacing-lg)]"
    >
      <div className="h-[var(--spacing-2xl)] w-36 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-xs)] h-4 w-3/4 rounded bg-neutral-200" />
      <div className="mt-[var(--spacing-lg)] h-[var(--spacing-2xl)] w-full rounded-md bg-neutral-200" />
      <div className="mt-[var(--spacing-lg)] space-y-[var(--spacing-md)]">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-md border border-neutral-200 bg-neutral-50 p-[var(--spacing-md)] shadow-sm"
          >
            <div className="h-5 w-1/3 rounded bg-neutral-200" />
            <div className="mt-[var(--spacing-sm)] h-4 w-full rounded bg-neutral-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
