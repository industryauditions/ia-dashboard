"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, ImagePlus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { uploadPartnerLogo } from "@/lib/uploads";
import { cn } from "@/lib/utils";

export function AddPartnerDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [totalAuditions, setTotalAuditions] = useState<number>(0);
  const [used, setUsed] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setLogoFile(null);
    setLogoPreview(null);
    setStartDate(undefined);
    setEndDate(undefined);
    setTotalAuditions(0);
    setUsed(0);
    setError(null);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Company name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { data: partner, error: insertError } = await supabase
      .from("annual_partners")
      .insert({ canonical_name: trimmed })
      .select("*")
      .single();

    if (insertError || !partner) {
      setError(insertError?.message ?? "Failed to create partner.");
      setSaving(false);
      return;
    }

    if (logoFile) {
      try {
        const logoUrl = await uploadPartnerLogo(supabase, partner.id, logoFile);
        await supabase
          .from("annual_partners")
          .update({ logo_url: logoUrl })
          .eq("id", partner.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Logo upload failed.");
        // Partner was still created — keep going, they can add a logo later.
      }
    }

    const { error: pkgError } = await supabase.from("partner_packages").insert({
      partner_id: partner.id,
      package_number: 1,
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : null,
      total_auditions: totalAuditions,
      used_auditions: used,
    });

    setSaving(false);
    if (pkgError) {
      setError(pkgError.message);
      return;
    }

    reset();
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" aria-label="Add annual partner">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add annual partner</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed bg-muted/40 text-muted-foreground hover:bg-muted"
            >
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
            </button>
            <div className="min-w-0 flex-1 space-y-1">
              <Label htmlFor="new-partner-name">Company name</Label>
              <Input
                id="new-partner-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Royal Caribbean"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="rounded-md border p-3">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              First package
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Package start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "No date set"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Package expiry / renewal date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "No date set"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-partner-total">Auditions in package</Label>
                <Input
                  id="new-partner-total"
                  type="number"
                  min={0}
                  value={totalAuditions}
                  onChange={(e) => setTotalAuditions(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-partner-used">Auditions already used</Label>
                <Input
                  id="new-partner-used"
                  type="number"
                  min={0}
                  value={used}
                  onChange={(e) => setUsed(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving || !name.trim()}>
            {saving ? "Adding…" : "Add partner"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
