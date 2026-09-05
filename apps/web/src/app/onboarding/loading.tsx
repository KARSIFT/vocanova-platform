export default function OnboardingLoading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Loading onboarding"
      className="grid min-h-screen place-items-center bg-neutral-50 p-6"
    >
      <div className="h-64 w-full max-w-[36rem] animate-pulse rounded-xl border border-neutral-200 bg-white p-[var(--spacing-lg)]" />
    </main>
  );
}
