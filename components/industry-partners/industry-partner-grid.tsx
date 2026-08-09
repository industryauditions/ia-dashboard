"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import type { Tables } from "@/lib/supabase/types";

export function IndustryPartnerGrid({
  partners,
}: {
  partners: Tables<"industry_partners">[];
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return partners;
    const q = search.trim().toLowerCase();
    return partners.filter((p) => p.agency_name.toLowerCase().includes(q));
  }, [partners, search]);

  return (
    <div className="space-y-4">
      <div className="relative sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by agency name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {partners.length === 0
              ? "No industry partners yet. Data will appear once the import finishes."
              : "No partners match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <CardTitle className="text-base">{p.agency_name}</CardTitle>
                {p.emailed ? (
                  <Badge variant="success" className="shrink-0">
                    Emailed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    Not emailed
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {p.contact_name && (
                  <p className="text-muted-foreground">{p.contact_name}</p>
                )}
                {p.email && <p className="text-muted-foreground">{p.email}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-muted-foreground">
                  {p.discount_code && (
                    <span>
                      Code: <span className="font-medium text-foreground">{p.discount_code}</span>
                    </span>
                  )}
                  <span>Redemptions: {formatNumber(p.redemptions ?? 0)}</span>
                  <span>Already using: {formatNumber(p.already_using_count ?? 0)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
