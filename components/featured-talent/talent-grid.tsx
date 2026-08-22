"use client";

import { useMemo, useState } from "react";

import { TalentCard } from "@/components/featured-talent/talent-card";
import { AddTalentDialog } from "@/components/featured-talent/add-talent-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TALENT_STATUSES, TALENT_STATUS_LABELS } from "@/lib/talent-status";
import type { Tables } from "@/lib/supabase/types";

const SORT_OPTIONS = [
  { value: "date_added", label: "Date added" },
  { value: "name", label: "Name" },
  { value: "country", label: "Country" },
  { value: "followers", label: "Number of followers" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

function sortTalent(talent: Tables<"featured_talent">[], sortBy: SortOption) {
  const sorted = [...talent];
  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "country":
      return sorted.sort((a, b) => {
        if (!a.location && !b.location) return 0;
        if (!a.location) return 1;
        if (!b.location) return -1;
        return a.location.localeCompare(b.location);
      });
    case "followers":
      return sorted.sort((a, b) => {
        const av = a.follower_count ?? -1;
        const bv = b.follower_count ?? -1;
        return bv - av;
      });
    case "date_added":
    default:
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}

export function TalentGrid({ talent }: { talent: Tables<"featured_talent">[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("date_added");

  const filtered = useMemo(() => {
    if (filter === "all") return talent;
    return talent.filter((t) => t.status === filter);
  }, [talent, filter]);

  const sorted = useMemo(() => sortTalent(filtered, sortBy), [filtered, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AddTalentDialog />
        {sorted.map((t) => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </div>
  );
}
