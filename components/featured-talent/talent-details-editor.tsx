"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { parseInstagramUsername } from "@/lib/instagram";
import type { Tables } from "@/lib/supabase/types";

export function TalentDetailsEditor({ talent }: { talent: Tables<"featured_talent"> }) {
  const router = useRouter();

  const [name, setName] = useState(talent.name);
  const [instagramUrl, setInstagramUrl] = useState(talent.instagram_url ?? "");
  const [country, setCountry] = useState(talent.location ?? "");
  const [followerCount, setFollowerCount] = useState(
    talent.follower_count !== null && talent.follower_count !== undefined
      ? String(talent.follower_count)
      : ""
  );
  const [employer, setEmployer] = useState(talent.employer_text ?? "");
  const [bio, setBio] = useState(talent.bio ?? "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const url = instagramUrl.trim() || null;
    const handle = url ? parseInstagramUsername(url) : null;
    const followers = followerCount.trim()
      ? parseInt(followerCount.replace(/[^0-9]/g, ""), 10)
      : null;

    const { error } = await supabase
      .from("featured_talent")
      .update({
        name: name.trim(),
        instagram_url: url,
        instagram_handle: handle,
        location: country.trim() || null,
        follower_count: Number.isFinite(followers) ? followers : null,
        employer_text: employer.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", talent.id);

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
    const { error } = await supabase.from("featured_talent").delete().eq("id", talent.id);
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    router.push("/featured-talent");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Name</Label>
          <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-instagram-url">Instagram URL</Label>
          <Input
            id="edit-instagram-url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/janedoe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-country">Country</Label>
          <Input id="edit-country" value={country} onChange={(e) => setCountry(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-followers">Number of followers</Label>
          <Input
            id="edit-followers"
            inputMode="numeric"
            value={followerCount}
            onChange={(e) => setFollowerCount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-employer">Employer</Label>
          <Input id="edit-employer" value={employer} onChange={(e) => setEmployer(e.target.value)} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="edit-bio">Bio</Label>
          <Textarea id="edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
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
            Delete talent
          </Button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <span className="mr-auto whitespace-nowrap text-xs text-muted-foreground">
              Delete {talent.name}? This can&apos;t be undone.
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
