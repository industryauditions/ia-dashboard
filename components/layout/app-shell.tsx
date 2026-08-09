"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NavLinks } from "@/components/layout/nav-links";
import { UserFooter } from "@/components/layout/user-footer";

function BrandMark() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
        IA
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold">Industry Auditions</p>
        <p className="text-xs text-muted-foreground">Dashboard</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop fixed sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-background px-4 py-6 md:flex">
        <BrandMark />
        <div className="mt-8 flex-1 flex flex-col">
          <NavLinks />
          <UserFooter />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
        <BrandMark />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <SheetContent side="left" className="flex w-72 flex-col px-4 py-6">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <BrandMark />
            </SheetHeader>
            <div className="flex flex-1 flex-col">
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <UserFooter />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
