"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, CheckCircle2, Circle } from "lucide-react";

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

export interface PostScheduleRow {
  id: string;
  raw_company_text: string | null;
  audition_date_text: string | null;
  posting_time_text: string | null;
  country: string | null;
  is_posted: boolean;
  grid_prepped: boolean | null;
  story_prepped: boolean | null;
  partner_name: string | null;
}

type SortKey = "company" | "date" | "country";

export function PostScheduleTable({ rows }: { rows: PostScheduleRow[] }) {
  const [search, setSearch] = useState("");
  const [postedFilter, setPostedFilter] = useState<"all" | "posted" | "not_posted">(
    "all"
  );
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<1 | -1>(1);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(1);
    }
  }

  const filtered = useMemo(() => {
    let out = rows;
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
    const sorted = [...out].sort((a, b) => {
      let av = "";
      let bv = "";
      if (sortKey === "company") {
        av = a.partner_name || a.raw_company_text || "";
        bv = b.partner_name || b.raw_company_text || "";
      } else if (sortKey === "date") {
        av = a.audition_date_text || "";
        bv = b.audition_date_text || "";
      } else {
        av = a.country || "";
        bv = b.country || "";
      }
      return av.localeCompare(bv) * sortDir;
    });
    return sorted;
  }, [rows, search, postedFilter, sortKey, sortDir]);

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
            <SelectValue placeholder="Posted status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
            <SelectItem value="not_posted">Not posted</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground sm:ml-auto">
          {filtered.length} of {rows.length} rows
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton label="Company" onClick={() => toggleSort("company")} />
              </TableHead>
              <TableHead>
                <SortButton label="Date" onClick={() => toggleSort("date")} />
              </TableHead>
              <TableHead>Time</TableHead>
              <TableHead>
                <SortButton label="Country" onClick={() => toggleSort("country")} />
              </TableHead>
              <TableHead>Posted</TableHead>
              <TableHead>Grid</TableHead>
              <TableHead>Story</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                  No post schedule rows match your filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.partner_name || r.raw_company_text || "—"}
                </TableCell>
                <TableCell>{r.audition_date_text || "—"}</TableCell>
                <TableCell>{r.posting_time_text || "—"}</TableCell>
                <TableCell>{r.country || "—"}</TableCell>
                <TableCell>
                  {r.is_posted ? (
                    <Badge variant="success">Posted</Badge>
                  ) : (
                    <Badge variant="outline">Not posted</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <BoolIcon value={r.grid_prepped} />
                </TableCell>
                <TableCell>
                  <BoolIcon value={r.story_prepped} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SortButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}

function BoolIcon({ value }: { value: boolean | null }) {
  return value ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  ) : (
    <Circle className="h-4 w-4 text-muted-foreground/40" />
  );
}
