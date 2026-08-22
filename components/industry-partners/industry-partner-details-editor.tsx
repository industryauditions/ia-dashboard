"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

export function IndustryPartnerDetailsEditor({
  partner,
}: {
  partner: Tables<"industry_partners">;
}) {
  const router = useRouter();

  const [agencyName, setAgencyName] = useState(partner.agency_name);
  const [contactName, setContactName] = useState(partner.contact_name ?? "");
  const [email, setEmail] = useState(partner.email ?? "");
  const [discountCode, setDiscountCode] = useState(partner.discount_code ?? "");
  const [emailed, setEmailed] = useState(partner.emailed);
  const [dateSent, setDateSent] = useState<Date | undefined>(
    partner.date_sent ? new Date(`${partner.date_sent}T00:00:00`) : undefined
  );
  const [redemptions, setRedemptions] = useState(String(partner.redemptions ?? 0));
  const [alreadyUsingCount, setAlreadyUsingCount] = useState(
    String(partner.already_using_count ?? 0)
  );
  const [alreadyUsingNote, setAlreadyUsingNote] = useState(partner.already_using_note ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSave() {
    if (!agencyName.trim()) {
      setError("Agency name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("industry_partners")
      .update({
        agency_name: agencyName.trim(),
        contact_name: contactName.trim() || null,
        email: email.trim() || null,
        discount_code: discountCode.trim() || null,
        emailed,
        date_sent: dateSent ? format(dateSent, "yyyy-MM-dd") : null,
        redemptions: parseInt(redemptions, 10) || 0,
        already_using_count: parseInt(alreadyUsingCount, 10) || 0,
        already_using_note: alreadyUsingNote.trim() || null,
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

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);
    const supabase = createClient();
    const { error } = await supabase.from("industry_partners").delete().eq("id", partner.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    router.push("/industry-partner-program");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-agency-name">Agency name</Label>
          <Input
            id="edit-agency-name"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-contact-name">Contact name</Label>
          <Input
            id="edit-contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-ip-email">Email</Label>
          <Input id="edit-ip-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-discount-code">Discount code</Label>
          <Input
            id="edit-discount-code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-redemptions">Redemptions</Label>
          <Input
            id="edit-redemptions"
            type="number"
            min={0}
            value={redemptions}
            onChange={(e) => setRedemptions(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-already-using">Already using count</Label>
          <Input
            id="edit-already-using"
            type="number"
            min={0}
            value={alreadyUsingCount}
            onChange={(e) => setAlreadyUsingCount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Date sent</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateSent && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateSent ? format(dateSent, "PPP") : "No date set"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dateSent} onSelect={setDateSent} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-end pb-1">
          <button
            type="button"
            role="switch"
            aria-checked={emailed}
            onClick={() => setEmailed((v) => !v)}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                emailed ? "bg-emerald-600" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  emailed ? "translate-x-5" : "translate-x-0.5"
                )}
              />
            </span>
            <span className="text-sm font-medium">Emailed</span>
          </button>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-already-using-note">Already using note</Label>
          <Textarea
            id="edit-already-using-note"
            rows={3}
            value={alreadyUsingNote}
            onChange={(e) => setAlreadyUsingNote(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {error && <span className="text-xs text-destructive">{error}</span>}
        {saved && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
        <Button size="sm" className="ml-auto" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="border-t pt-4">
        {!confirmingDelete ? (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete partner
          </Button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span className="mr-auto whitespace-nowrap text-xs text-muted-foreground">
              Delete {partner.agency_name}? This can&apos;t be undone.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Confirm delete"}
            </Button>
          </div>
        )}
        {deleteError && <p className="mt-2 text-xs text-destructive">{deleteError}</p>}
      </div>
    </div>
  );
}
