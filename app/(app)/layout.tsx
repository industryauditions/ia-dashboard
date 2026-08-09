import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  CurrentUserProvider,
  type CurrentUserInfo,
} from "@/components/providers/role-provider";
import { AppShell } from "@/components/layout/app-shell";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .single();

  // Role check here is purely for UI/UX (hiding nav items, sections).
  // Real security is enforced by Postgres RLS policies.
  const currentUser: CurrentUserInfo = {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    displayName: profile?.display_name ?? null,
    role: profile?.role === "owner" ? "owner" : "team",
  };

  return (
    <CurrentUserProvider user={currentUser}>
      <AppShell>{children}</AppShell>
    </CurrentUserProvider>
  );
}
