"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

export function TrainingPartnerDetailsEditor({
  partner,
}: {
  partner: Tables<"training_partners">;
}) {
  const router = useRouter();

  const [collegeName, setCollegeName] = useState(partner.college_name);
  const [contactName, setContactName] = useState(partner.contact_name ?? "");
  const [email, setEmail] = useState(partner.email ?? "");
  const [location, setLocation] = useState(partner.location ?? "");
  const [status, setStatus] = useState(partner.status ?? "");
  const [legacyNotes, setLegacyNotes] = useState(partner.notes ?? "");
  const [notesUrl, setNotesUrl] = useState(partner.notes_url ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSave() {
    if (!collegeName.trim()) {
      setError("College name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("training_partners")
      .update({
        college_name: collegeName.trim(),
        contact_name: contactName.trim() || null,
        email: email.trim() || null,
        location: location.trim() || null,
        status: status.trim() || null,
        notes: legacyNotes.trim() || null,
        notes_url: notesUrl.trim() || null,
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
    const { error } = await supabase.from("training_partners").delete().eq("id", partner.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    router.push("/training-partner-program");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-college-name">College name</Label>
          <Input
            id="edit-college-name"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-tp-contact-name">Contact name</Label>
          <Input
            id="edit-tp-contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-tp-email">Email</Label>
          <Input id="edit-tp-email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-tp-location">Location</Label>
          <Input
            id="edit-tp-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-tp-status">Status</Label>
          <Input id="edit-tp-status" value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-tp-notes-url">Notes URL</Label>
          <Input
            id="edit-tp-notes-url"
            value={notesUrl}
            onChange={(e) => setNotesUrl(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-tp-legacy-notes">Notes</Label>
          <Textarea
            id="edit-tp-legacy-notes"
            rows={3}
            value={legacyNotes}
            onChange={(e) => setLegacyNotes(e.target.value)}
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
              Delete {partner.college_name}? This can&apos;t be undone.
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
