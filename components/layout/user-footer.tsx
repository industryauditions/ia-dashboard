"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/components/providers/role-provider";
import { createClient } from "@/lib/supabase/client";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserFooter() {
  const user = useCurrentUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const label = user.displayName || user.email;

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mt-auto">
      <Separator className="mb-3" />
      <div className="flex items-center gap-3 px-1">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {initials(label)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium leading-none">{label}</p>
          <p className="truncate text-xs text-muted-foreground mt-1">
            {user.role === "owner" ? "Owner" : "Team"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={loading}
          onClick={handleSignOut}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
