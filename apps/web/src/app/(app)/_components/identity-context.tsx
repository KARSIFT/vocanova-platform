"use client";
import { createContext, useContext, type ReactNode } from "react";
const IdentityContext = createContext<string | undefined>(undefined);
export function IdentityProvider({
  userId,
  children,
}: {
  userId?: string;
  children: ReactNode;
}) {
  return (
    <IdentityContext.Provider value={userId}>
      {children}
    </IdentityContext.Provider>
  );
}
export function useAuthenticatedUserId() {
  return useContext(IdentityContext);
}
