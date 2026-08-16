"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import {
  ScheduleItemDialog,
  type PartnerOption,
} from "@/components/annual-partners/schedule-item-dialog";
import type { PostScheduleRow } from "@/components/annual-partners/post-schedule-table";

export function PartnerScheduleList({
  rows,
  partners,
  fallbackName,
}: {
  rows: PostScheduleRow[];
  partners: PartnerOption[];
  fallbackName: string;
}) {
  const [editingRow, setEditingRow] = useState<PostScheduleRow | null>(null);

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No post schedule entries for this partner yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {rows.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setEditingRow(s)}
            className="flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left text-sm transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{s.raw_company_text || fallbackName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {[
                  s.audition_date_text ? formatDate(s.audition_date_text) : null,
                  s.country,
                ]
                  .filter(Boolean)
                  .join(" · ") || "No schedule details"}
              </p>
            </div>
            {s.is_posted ? (
              <Badge variant="success" className="shrink-0">
                Posted
              </Badge>
            ) : (
              <Badge variant="outline" className="shrink-0">
                Not posted
              </Badge>
            )}
          </button>
        ))}
      </div>

      {editingRow && (
        <ScheduleItemDialog
          mode="edit"
          partners={partners}
          row={editingRow}
          open={!!editingRow}
          onOpenChange={(o) => {
            if (!o) setEditingRow(null);
          }}
        />
      )}
    </>
  );
}
