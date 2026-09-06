import Link from "next/link";

export default function SavedWordNotFound() {
  return (
    <div className="p-[var(--spacing-lg)]">
      <h1 className="text-xl font-semibold text-neutral-900">
        Saved item unavailable
      </h1>
      <p className="mt-[var(--spacing-sm)] text-base text-neutral-700">
        This saved item is no longer available. Return to your saved vocabulary
        to choose another item.
      </p>
      <Link
        href="/discover/saved"
        className="mt-[var(--spacing-lg)] inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
      >
        Back to saved vocabulary
      </Link>
    </div>
  );
}
