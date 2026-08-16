"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { PostScheduleRow } from "@/components/annual-partners/post-schedule-table";

export interface PartnerOption {
  id: string;
  canonical_name: string;
}

const NONE = "__none__";

function parseDateOnly(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function splitTimestamp(value: string | null): { date: Date | undefined; time: string } {
  if (!value) return { date: undefined, time: "09:00" };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { date: undefined, time: "09:00" };
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return { date: d, time: `${hh}:${mm}` };
}

function combineDateAndTime(date: Date | undefined, time: string): string | null {
  if (!date) return null;
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  const combined = new Date(date);
  combined.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return combined.toISOString();
}

function StatusPill({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-full border p-0.5">
      <button
        type="button"
        onClick={() => onChange(false)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          !value ? "bg-foreground text-background" : "text-muted-foreground"
        )}
      >
        Not Posted
      </button>
      <button
        type="button"
        onClick={() => onChange(true)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          value ? "bg-emerald-600 text-white" : "text-muted-foreground"
        )}
      >
        Posted
      </button>
    </div>
  );
}

function DatePickerField({
  label,
  date,
  onChange,
  required,
}: {
  label: string;
  date: Date | undefined;
  onChange: (d: Date | undefined) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : "No date set"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ScheduleItemDialog({
  mode,
  partners,
  row,
  open,
  onOpenChange,
}: {
  mode: "create" | "edit";
  partners: PartnerOption[];
  row?: PostScheduleRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [partnerId, setPartnerId] = useState<string>(row?.partner_id ?? NONE);
  const [company, setCompany] = useState(row?.raw_company_text ?? "");
  const [auditionDate, setAuditionDate] = useState<Date | undefined>(
    parseDateOnly(row?.audition_date_text ?? null)
  );
  const [city, setCity] = useState(row?.country ?? "");
  const initialLive = splitTimestamp(row?.post_live_at ?? null);
  const [liveDate, setLiveDate] = useState<Date | undefined>(initialLive.date);
  const [liveTime, setLiveTime] = useState<string>(initialLive.time);
  const [isPosted, setIsPosted] = useState<boolean>(row?.is_posted ?? false);
  const [notes, setNotes] = useState(row?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Re-sync form fields whenever a different row is opened for editing.
  useEffect(() => {
    if (!dialogOpen) return;
    setPartnerId(row?.partner_id ?? NONE);
    setCompany(row?.raw_company_text ?? "");
    setAuditionDate(parseDateOnly(row?.audition_date_text ?? null));
    setCity(row?.country ?? "");
    const live = splitTimestamp(row?.post_live_at ?? null);
    setLiveDate(live.date);
    setLiveTime(live.time);
    setIsPosted(row?.is_posted ?? false);
    setNotes(row?.notes ?? "");
    setError(null);
    setConfirmingDelete(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen, row?.id]);

  async function handleDelete() {
    if (!row) return;
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("post_schedule").delete().eq("id", row.id);
    setDeleting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDialogOpen(false);
    router.refresh();
  }

  function handlePartnerChange(value: string) {
    setPartnerId(value);
    if (value !== NONE && !company.trim()) {
      const p = partners.find((p) => p.id === value);
      if (p) setCompany(p.canonical_name);
    }
  }

  async function handleSave() {
    if (!company.trim()) {
      setError("Company is required.");
      return;
    }
    if (!auditionDate) {
      setError("Audition date is required.");
      return;
    }
    if (!city.trim()) {
      setError("Audition city / online is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      partner_id: partnerId === NONE ? null : partnerId,
      raw_company_text: company.trim(),
      audition_date_text: format(auditionDate, "yyyy-MM-dd"),
      country: city.trim(),
      post_live_at: combineDateAndTime(liveDate, liveTime),
      is_posted: isPosted,
      notes: notes.trim() || null,
    };

    if (mode === "create") {
      const { error } = await supabase.from("post_schedule").insert({
        ...payload,
        sort_order: Date.now(),
      });
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      setPartnerId(NONE);
      setCompany("");
      setAuditionDate(undefined);
      setCity("");
      setLiveDate(undefined);
      setLiveTime("09:00");
      setIsPosted(false);
      setNotes("");
      setDialogOpen(false);
      router.refresh();
    } else if (row) {
      const { error } = await supabase
        .from("post_schedule")
        .update(payload)
        .eq("id", row.id);
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
      setDialogOpen(false);
      router.refresh();
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {mode === "create" && (
        <DialogTrigger asChild>
          <Button size="icon" aria-label="Add post schedule item">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add audition" : "Edit audition"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Package</Label>
              <Select value={partnerId} onValueChange={handlePartnerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="No partner package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No partner package</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.canonical_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Leave blank for non-partner posts. The correct package (and its
                remaining count) is matched automatically from the go-live date.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule-company">
                Company<span className="text-destructive">*</span>
              </Label>
              <Input
                id="schedule-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Royal Caribbean"
              />
            </div>

            <DatePickerField
              label="Audition date"
              date={auditionDate}
              onChange={setAuditionDate}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="schedule-city">
                Audition city / online<span className="text-destructive">*</span>
              </Label>
              <Input
                id="schedule-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Sydney or Online"
              />
            </div>

            <DatePickerField
              label="Date post will go live"
              date={liveDate}
              onChange={setLiveDate}
            />

            <div className="space-y-2">
              <Label htmlFor="schedule-live-time">Time post will go live</Label>
              <Input
                id="schedule-live-time"
                type="time"
                value={liveTime}
                onChange={(e) => setLiveTime(e.target.value)}
                disabled={!liveDate}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              <StatusPill value={isPosted} onChange={setIsPosted} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-notes">Notes</Label>
            <Textarea
              id="schedule-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter className={mode === "edit" ? "sm:justify-between" : undefined}>
          {mode === "edit" &&
            (confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Delete this audition?</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Confirm delete"}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmingDelete(true)}
                disabled={saving}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            ))}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Add audition" : "Save changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
