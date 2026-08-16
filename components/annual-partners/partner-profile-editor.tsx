"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Check, ImagePlus, PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { uploadPartnerLogo } from "@/lib/uploads";
import { daysUntil, formatDate } from "@/lib/format";
import { currentPackage } from "@/lib/partner-packages";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

type Partner = Tables<"annual_partners">;
type Package = Tables<"partner_packages">;

function DatePickerField({
  label,
  date,
  onChange,
}: {
  label: string;
  date: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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

export function PartnerProfileEditor({
  partner,
  packages,
}: {
  partner: Partner;
  packages: Package[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const current = currentPackage(packages);
  const history = [...packages]
    .filter((p) => p.id !== current?.id)
    .sort((a, b) => b.package_number - a.package_number);

  // --- Profile (name + logo) ---
  const [name, setName] = useState(partner.canonical_name);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(partner.logo_url);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSaveProfile() {
    const trimmed = name.trim();
    if (!trimmed) {
      setProfileError("Company name is required.");
      return;
    }
    setSavingProfile(true);
    setProfileError(null);
    const supabase = createClient();
    let logoUrl = partner.logo_url;
    if (logoFile) {
      try {
        logoUrl = await uploadPartnerLogo(supabase, partner.id, logoFile);
      } catch (e) {
        setProfileError(e instanceof Error ? e.message : "Logo upload failed.");
        setSavingProfile(false);
        return;
      }
    }
    const { error } = await supabase
      .from("annual_partners")
      .update({ canonical_name: trimmed, logo_url: logoUrl })
      .eq("id", partner.id);
    setSavingProfile(false);
    if (error) {
      setProfileError(error.message);
      return;
    }
    setProfileSaved(true);
    router.refresh();
    setTimeout(() => setProfileSaved(false), 2000);
  }

  // --- Current package edit ---
  const [pkgStart, setPkgStart] = useState<Date | undefined>(
    current?.start_date ? new Date(`${current.start_date}T00:00:00`) : undefined
  );
  const [pkgEnd, setPkgEnd] = useState<Date | undefined>(
    current?.end_date ? new Date(`${current.end_date}T00:00:00`) : undefined
  );
  const [pkgTotal, setPkgTotal] = useState<number>(current?.total_auditions ?? 0);
  const [pkgUsed, setPkgUsed] = useState<number>(current?.used_auditions ?? 0);
  const [savingPkg, setSavingPkg] = useState(false);
  const [pkgSaved, setPkgSaved] = useState(false);
  const [pkgError, setPkgError] = useState<string | null>(null);

  async function handleSavePackage() {
    if (!current) return;
    setSavingPkg(true);
    setPkgError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("partner_packages")
      .update({
        start_date: pkgStart ? format(pkgStart, "yyyy-MM-dd") : null,
        end_date: pkgEnd ? format(pkgEnd, "yyyy-MM-dd") : null,
        total_auditions: pkgTotal,
        used_auditions: pkgUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id);
    setSavingPkg(false);
    if (error) {
      setPkgError(error.message);
      return;
    }
    setPkgSaved(true);
    router.refresh();
    setTimeout(() => setPkgSaved(false), 2000);
  }

  // --- New package / renewal ---
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [renewStart, setRenewStart] = useState<Date | undefined>();
  const [renewEnd, setRenewEnd] = useState<Date | undefined>();
  const [renewTotal, setRenewTotal] = useState<number>(current?.total_auditions ?? 0);
  const [savingRenew, setSavingRenew] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  async function handleCreateRenewal() {
    setSavingRenew(true);
    setRenewError(null);
    const supabase = createClient();
    const nextNumber = (current?.package_number ?? 0) + 1;
    const { error } = await supabase.from("partner_packages").insert({
      partner_id: partner.id,
      package_number: nextNumber,
      start_date: renewStart ? format(renewStart, "yyyy-MM-dd") : null,
      end_date: renewEnd ? format(renewEnd, "yyyy-MM-dd") : null,
      total_auditions: renewTotal,
      used_auditions: 0,
    });
    setSavingRenew(false);
    if (error) {
      setRenewError(error.message);
      return;
    }
    setShowRenewForm(false);
    setRenewStart(undefined);
    setRenewEnd(undefined);
    router.refresh();
  }

  const days = current ? daysUntil(current.end_date) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed bg-muted/40 text-muted-foreground hover:bg-muted"
        >
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-1">
          <Label htmlFor="edit-partner-name">Company name</Label>
          <Input id="edit-partner-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex items-center gap-3">
        {profileError && <span className="text-xs text-destructive">{profileError}</span>}
        {profileSaved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        <Button size="sm" className="ml-auto" onClick={handleSaveProfile} disabled={savingProfile}>
          {savingProfile ? "Saving…" : "Save name & logo"}
        </Button>
      </div>

      <div className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {current ? `Package #${current.package_number} (current)` : "No package yet"}
          </p>
          {days !== null && (
            <Badge variant={days < 0 ? "destructive" : days <= 14 ? "warning" : "secondary"}>
              {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d until renewal`}
            </Badge>
          )}
        </div>

        {current ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePickerField label="Package start date" date={pkgStart} onChange={setPkgStart} />
              <DatePickerField
                label="Package expiry / renewal date"
                date={pkgEnd}
                onChange={setPkgEnd}
              />
              <div className="space-y-2">
                <Label htmlFor="pkg-total">Auditions in package</Label>
                <Input
                  id="pkg-total"
                  type="number"
                  min={0}
                  value={pkgTotal}
                  onChange={(e) => setPkgTotal(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-used">Auditions used</Label>
                <Input
                  id="pkg-used"
                  type="number"
                  min={0}
                  value={pkgUsed}
                  onChange={(e) => setPkgUsed(Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">
                  Updates automatically as posts are added to the schedule with this package
                  selected — adjust manually only to correct a mistake.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              {pkgError && <span className="text-xs text-destructive">{pkgError}</span>}
              {pkgSaved && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> Saved
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                Remaining: {Math.max(pkgTotal - pkgUsed, 0)}
              </span>
              <Button size="sm" className="ml-auto" onClick={handleSavePackage} disabled={savingPkg}>
                {savingPkg ? "Saving…" : "Save package"}
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            This partner has no package set up yet — start one below.
          </p>
        )}
      </div>

      <div className="border-t pt-4">
        {!showRenewForm ? (
          <Button variant="outline" size="sm" onClick={() => setShowRenewForm(true)}>
            <PlusCircle className="mr-1.5 h-4 w-4" />
            {current ? `Start package #${current.package_number + 1} (renewal)` : "Start a package"}
          </Button>
        ) : (
          <div className="space-y-3 rounded-md border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              New package #{(current?.package_number ?? 0) + 1}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePickerField label="Start date" date={renewStart} onChange={setRenewStart} />
              <DatePickerField label="Expiry / renewal date" date={renewEnd} onChange={setRenewEnd} />
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="renew-total">Auditions in package</Label>
                <Input
                  id="renew-total"
                  type="number"
                  min={0}
                  value={renewTotal}
                  onChange={(e) => setRenewTotal(Number(e.target.value))}
                />
              </div>
            </div>
            {renewError && <p className="text-xs text-destructive">{renewError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowRenewForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateRenewal} disabled={savingRenew}>
                {savingRenew ? "Creating…" : "Create package"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Package history
          </p>
          <div className="space-y-2">
            {history.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-md border p-2.5 text-xs text-muted-foreground"
              >
                <span>
                  Package #{p.package_number} · {formatDate(p.start_date)} – {formatDate(p.end_date)}
                </span>
                <span>
                  {p.used_auditions}/{p.total_auditions} used
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
