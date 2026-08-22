"use client";

import { useMemo, useState } from "react";

import { TalentCard } from "@/components/featured-talent/talent-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TALENT_STATUSES, TALENT_STATUS_LABELS } from "@/lib/talent-status";
import { TALENT_SORT_OPTIONS, sortTalent, type TalentSortOption } from "@/lib/talent-sort";
import type { Tables } from "@/lib/supabase/types";

export function ContentGrid({ talent }: { talent: Tables<"featured_talent">[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<TalentSortOption>("date_added");

  const filtered = useMemo(() => {
    if (filter === "all") return talent;
    return talent.filter((t) => t.status === filter);
  }, [talent, filter]);

  const sorted = useMemo(() => sortTalent(filtered, sortBy), [filtered, sortBy]);

  if (talent.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No one has been asked to create content yet. Check the box on a
          talent&apos;s page under Featured Talent to add them here.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-secondary data-[state=active]:shadow-none bg-muted"
            >
              All ({talent.length})
            </TabsTrigger>
            {TALENT_STATUSES.map((status) => {
              const count = talent.filter((t) => t.status === status).length;
              return (
                <TabsTrigger
                  key={status}
                  value={status}
                  className="data-[state=active]:bg-secondary data-[state=active]:shadow-none bg-muted"
                >
                  {TALENT_STATUS_LABELS[status]} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as TalentSortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TALENT_SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((t) => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </div>
  );
}
