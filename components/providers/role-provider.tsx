"use client";

import { createContext, useContext } from "react";

export type UserRole = "owner" | "team";

export interface CurrentUserInfo {
  id: string;
  email: string;
  displayName: string | null;
  role: UserRole;
}

const CurrentUserContext = createContext<CurrentUserInfo | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUserInfo;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
