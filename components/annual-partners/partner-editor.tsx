"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

export function PartnerEditor({ partner }: { partner: Tables<"annual_partners"> }) {
  const router = useRouter();
  const [renewalDate, setRenewalDate] = useState<Date | undefined>(
    partner.renewal_date ? new Date(partner.renewal_date + "T00:00:00") : undefined
  );
  const [packageTotal, setPackageTotal] = useState(partner.package_total);
  const [used, setUsed] = useState(partner.used);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    packageTotal !== partner.package_total ||
    used !== partner.used ||
    (renewalDate ? format(renewalDate, "yyyy-MM-dd") : null) !==
      partner.renewal_date;

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("annual_partners")
      .update({
        renewal_date: renewalDate ? format(renewalDate, "yyyy-MM-dd") : null,
        package_total: packageTotal,
        used: used,
      })
      .eq("id", partner.id);
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label>Renewal date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !renewalDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {renewalDate ? format(renewalDate, "PPP") : "No date set"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={renewalDate}
              onSelect={setRenewalDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="package_total">Package total (posts)</Label>
        <Input
          id="package_total"
          type="number"
          min={0}
          value={packageTotal}
          onChange={(e) => setPackageTotal(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="used">Used</Label>
        <Input
          id="used"
          type="number"
          min={0}
          value={used}
          onChange={(e) => setUsed(Number(e.target.value))}
        />
      </div>

      <div className="sm:col-span-3 flex items-center gap-3">
        <Button onClick={handleSave} disabled={!dirty || saving} size="sm">
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        {error && <span className="text-xs text-destructive">{error}</span>}
        <span className="ml-auto text-xs text-muted-foreground">
          Remaining: {Math.max(packageTotal - used, 0)}
        </span>
      </div>
    </div>
  );
}
