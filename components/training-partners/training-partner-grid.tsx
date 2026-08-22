"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";

export function TrainingPartnerGrid({
  partners,
}: {
  partners: Tables<"training_partners">[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return partners;
    const q = search.trim().toLowerCase();
    return partners.filter((p) => p.college_name.toLowerCase().includes(q));
  }, [partners, search]);

  return (
    <div className="space-y-4">
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by college name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {partners.length === 0
              ? "No training partners yet. Data will appear once the import finishes."
              : "No partners match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/training-partner-program/${p.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{p.college_name}</CardTitle>
                  {p.location && (
                    <p className="text-xs text-muted-foreground">{p.location}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-1.5 text-sm">
                  {p.contact_name && (
                    <p className="text-muted-foreground">{p.contact_name}</p>
                  )}
                  {p.email && <p className="text-muted-foreground">{p.email}</p>}
                  {p.status && (
                    <Badge variant="secondary" className="mt-1">
                      {p.status}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
