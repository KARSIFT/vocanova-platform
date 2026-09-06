import type { ReactNode } from "react";

import { AppHeader } from "./_components/app-header";
import { BottomNav } from "./_components/bottom-nav";

export default function AppShellLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-[var(--spacing-md)] focus:top-[var(--spacing-md)] focus:z-20 focus:inline-flex focus:min-h-11 focus:min-w-11 focus:items-center focus:justify-center focus:rounded-md focus:bg-white focus:px-[var(--spacing-md)] focus:py-[var(--spacing-sm)] focus:text-base focus:font-medium focus:text-neutral-900 focus:shadow-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-primary-700"
      >
        Skip to main content
      </a>
      <AppHeader />
      <main
        id="main-content"
        tabIndex={-1}
        className="min-h-screen pb-16 pt-14"
      >
        {children}
      </main>
      <BottomNav />
    </>
  );
}
