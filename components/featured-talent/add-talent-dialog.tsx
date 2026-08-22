"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { parseInstagramUsername, normalizeInstagramUrl } from "@/lib/instagram";
import {
  TALENT_STATUSES,
  TALENT_STATUS_LABELS,
  type TalentStatus,
} from "@/lib/talent-status";

export function AddTalentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [name, setName] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<TalentStatus>("need_to_message");
  const [looking, setLooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  async function handleUrlBlur() {
    const handle = parseInstagramUsername(instagramUrl);
    if (!handle || name.trim()) return;
    setLooking(true);
    setLookupNote(null);
    try {
      const res = await fetch("/api/talent/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const data = await res.json();
      if (data.found) {
        if (data.displayName) setName(data.displayName);
        if (data.photoUrl) setPhotoUrl(data.photoUrl);
        setLookupNote("Found a public profile — feel free to adjust the name.");
      } else {
        setLookupNote("Couldn't auto-fetch a profile — enter the name manually.");
      }
    } catch {
      setLookupNote("Couldn't auto-fetch a profile — enter the name manually.");
    } finally {
      setLooking(false);
    }
  }

  function resetForm() {
    setInstagramUrl("");
    setName("");
    setFollowerCount("");
    setNotes("");
    setStatus("need_to_message");
    setPhotoUrl(null);
    setLookupNote(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const url = normalizeInstagramUrl(instagramUrl);
    if (!url) {
      setError("Instagram URL is required.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    const handle = parseInstagramUsername(instagramUrl);
    const followers = followerCount.trim()
      ? parseInt(followerCount.replace(/[^0-9]/g, ""), 10)
      : null;

    const { data: inserted, error: insertError } = await supabase
      .from("featured_talent")
      .insert({
        instagram_url: url,
        instagram_handle: handle,
        name: name.trim(),
        follower_count: Number.isFinite(followers) ? followers : null,
        profile_photo_url: photoUrl,
        status,
      })
      .select("id")
      .single();

    if (insertError) {
      setSubmitting(false);
      setError(insertError.message);
      return;
    }

    if (notes.trim() && inserted) {
      const { data: userRes } = await supabase.auth.getUser();
      await supabase.from("featured_talent_notes").insert({
        talent_id: inserted.id,
        note: notes.trim(),
        author_id: userRes?.user?.id ?? null,
      });
    }

    setSubmitting(false);
    setOpen(false);
    resetForm();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="flex h-full min-h-[150px] cursor-pointer items-center justify-center border-dashed transition-colors hover:bg-muted/50">
          <CardContent className="flex flex-col items-center gap-2 py-6 text-muted-foreground">
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Add talent</span>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add featured talent</DialogTitle>
          <DialogDescription>
            Paste their Instagram profile link — we&apos;ll try to pull their
            name and photo automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instagram-url">Instagram URL *</Label>
            <Input
              id="instagram-url"
              placeholder="https://www.instagram.com/janedoe"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              onBlur={handleUrlBlur}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">Name *</Label>
            <Input
              id="display-name"
              placeholder={looking ? "Looking up…" : "Jane Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={looking}
              required
            />
            {lookupNote && (
              <p className="text-xs text-muted-foreground">{lookupNote}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="follower-count">Number of followers</Label>
            <Input
              id="follower-count"
              inputMode="numeric"
              placeholder="e.g. 12400"
              value={followerCount}
              onChange={(e) => setFollowerCount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TalentStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TALENT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TALENT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="talent-notes">Notes</Label>
            <Textarea
              id="talent-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional — added as the first note on their page"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add talent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
