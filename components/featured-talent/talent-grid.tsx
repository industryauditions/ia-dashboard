"use client";

import { useMemo, useState } from "react";

import { TalentCard } from "@/components/featured-talent/talent-card";
import { AddTalentDialog } from "@/components/featured-talent/add-talent-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TALENT_STATUSES, TALENT_STATUS_LABELS } from "@/lib/talent-status";
import type { Tables } from "@/lib/supabase/types";

export function TalentGrid({ talent }: { talent: Tables<"featured_talent">[] }) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return talent;
    return talent.filter((t) => t.status === filter);
  }, [talent, filter]);

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AddTalentDialog />
        {filtered.map((t) => (
          <TalentCard key={t.id} talent={t} />
        ))}
      </div>
    </div>
  );
}
