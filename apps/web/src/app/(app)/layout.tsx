import type { ReactNode } from "react";

import { AppHeader } from "./_components/app-header";
import { BottomNav } from "./_components/bottom-nav";
import { IdentityProvider } from "./_components/identity-context";
import { createServerApiClient } from "@/lib/api-server";

export default function AppShellLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  let userId: string | undefined;
  try {
    userId = await(await createServerApiClient()).getCurrentUser({
      cache: "no-store",
    }).data.userId;
  } catch {
    /* recovery fails closed; route auth stays unchanged */
  }
  return (
    <IdentityProvider userId={userId}>
      <AppHeader />
      <main className="min-h-screen pb-16 pt-14">{children}</main>
      <BottomNav />
    </IdentityProvider>
  );
}
