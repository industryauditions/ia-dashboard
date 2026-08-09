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
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export function AddTalentDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [name, setName] = useState("");
  const [looking, setLooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupNote, setLookupNote] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  async function handleHandleBlur() {
    const clean = handle.trim().replace(/^@/, "");
    if (!clean || name.trim()) return;
    setLooking(true);
    setLookupNote(null);
    try {
      const res = await fetch("/api/talent/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: clean }),
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanHandle = handle.trim().replace(/^@/, "");
    if (!cleanHandle) {
      setError("Instagram handle is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("featured_talent").insert({
      instagram_handle: cleanHandle,
      name: name.trim() || cleanHandle,
      profile_photo_url: photoUrl,
      status: "need_to_message",
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    setHandle("");
    setName("");
    setPhotoUrl(null);
    setLookupNote(null);
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
            Enter their Instagram handle — we&apos;ll try to pull their name and
            photo automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handle">Instagram handle *</Label>
            <Input
              id="handle"
              placeholder="janedoe"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onBlur={handleHandleBlur}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              placeholder={looking ? "Looking up…" : "Jane Doe"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={looking}
            />
            {lookupNote && (
              <p className="text-xs text-muted-foreground">{lookupNote}</p>
            )}
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
