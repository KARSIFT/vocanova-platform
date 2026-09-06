import type { ReactNode } from "react";

import { AppHeader } from "./_components/app-header";
import { BottomNav } from "./_components/bottom-nav";
import { IdentityProvider } from "./_components/identity-context";

export default function AppShellLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <IdentityProvider>
      <AppHeader />
      <main className="min-h-screen pb-16 pt-14">{children}</main>
      <BottomNav />
    </IdentityProvider>
  );
}
