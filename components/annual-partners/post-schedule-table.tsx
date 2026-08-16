"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  ScheduleItemDialog,
  type PartnerOption,
} from "@/components/annual-partners/schedule-item-dialog";

export interface PostScheduleRow {
  id: string;
  raw_company_text: string | null;
  partner_id: string | null;
  audition_date_text: string | null;
  post_live_at: string | null;
  country: string | null;
  is_posted: boolean;
  notes: string | null;
  sort_order: number | null;
  partner_name: string | null;
}

function SortableRow({
  row,
  onClick,
}: {
  row: PostScheduleRow;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className="cursor-pointer"
    >
      <TableCell className="w-8 px-2">
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">
        {row.partner_name || row.raw_company_text || "—"}
      </TableCell>
      <TableCell>
        {row.audition_date_text ? formatDate(row.audition_date_text) : "—"}
      </TableCell>
      <TableCell>{row.post_live_at ? formatDateTime(row.post_live_at) : "—"}</TableCell>
      <TableCell>{row.country || "—"}</TableCell>
      <TableCell>
        {row.is_posted ? (
          <Badge variant="success">Posted</Badge>
        ) : (
          <Badge variant="outline">Not posted</Badge>
        )}
      </TableCell>
    </TableRow>
  );
}

export function PostScheduleTable({
  rows,
  partners,
}: {
  rows: PostScheduleRow[];
  partners: PartnerOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [postedFilter, setPostedFilter] = useState<"all" | "posted" | "not_posted">(
    "all"
  );
  const [orderedRows, setOrderedRows] = useState(rows);
  const [editingRow, setEditingRow] = useState<PostScheduleRow | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  // Keep local drag state in sync whenever fresh server data arrives (e.g.
  // after router.refresh() from an add/edit or another team member's change).
  useEffect(() => {
    setOrderedRows(rows);
  }, [rows]);

  const sortedBase = useMemo(() => {
    return [...orderedRows].sort((a, b) => {
      if (a.is_posted !== b.is_posted) return a.is_posted ? 1 : -1;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });
  }, [orderedRows]);

  const filtered = useMemo(() => {
    let out = sortedBase;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) =>
        (r.partner_name || r.raw_company_text || "").toLowerCase().includes(q)
      );
    }
    if (postedFilter !== "all") {
      out = out.filter((r) =>
        postedFilter === "posted" ? r.is_posted : !r.is_posted
      );
    }
    return out;
  }, [sortedBase, search, postedFilter]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex((r) => r.id === active.id);
    const newIndex = filtered.findIndex((r) => r.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...filtered];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Only rows within the same posted/not-posted group are ever adjacent,
    // so re-numbering just the visible slice keeps everything consistent.
    const withNewOrder = reordered.map((r, i) => ({ ...r, sort_order: i * 10 }));
    const merged = sortedBase.map((r) => withNewOrder.find((w) => w.id === r.id) ?? r);
    setOrderedRows(merged);

    const supabase = createClient();
    await Promise.all(
      withNewOrder.map((r) =>
        supabase.from("post_schedule").update({ sort_order: r.sort_order }).eq("id", r.id)
      )
    );
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={postedFilter}
          onValueChange={(v) => setPostedFilter(v as typeof postedFilter)}
        >
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="not_posted">Not posted</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground sm:mr-auto">
          {filtered.length} of {rows.length} rows
        </p>
        <ScheduleItemDialog mode="create" partners={partners} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Company</TableHead>
              <TableHead>Audition Date</TableHead>
              <TableHead>Date Posted</TableHead>
              <TableHead>Audition City/Online</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                  No post schedule rows match your filters.
                </TableCell>
              </TableRow>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filtered.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {filtered.map((r) => (
                  <SortableRow key={r.id} row={r} onClick={() => setEditingRow(r)} />
                ))}
              </SortableContext>
            </DndContext>
          </TableBody>
        </Table>
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
    </div>
  );
}
