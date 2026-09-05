import Link from "next/link";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 p-[var(--spacing-lg)]">
      <div className="w-full max-w-[28rem] space-y-[var(--spacing-lg)] rounded-xl border border-neutral-200 bg-white p-[var(--spacing-lg)] shadow-sm">
        <div className="space-y-[var(--spacing-xs)]">
          <p className="text-base font-semibold text-primary-700">Vocanova</p>
          <h1 className="text-3xl font-semibold text-neutral-900">
            Practical English, every day
          </h1>
          <p className="text-base text-neutral-700">
            Build confidence with short, focused vocabulary practice.
          </p>
        </div>
        <Link
          href="/signin"
          className="inline-flex min-h-[var(--spacing-2xl)] min-w-[var(--spacing-2xl)] items-center justify-center rounded-md bg-primary-600 px-[var(--spacing-md)] py-[var(--spacing-sm)] text-base font-medium text-neutral-50 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700"
        >
          Get started
        </Link>
      </div>
    </main>
  );
}
