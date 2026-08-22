"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function AddTrainingPartnerDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collegeName, setCollegeName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setCollegeName("");
    setContactName("");
    setEmail("");
    setLocation("");
    setStatus("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!collegeName.trim()) {
      setError("College name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("training_partners").insert({
      college_name: collegeName.trim(),
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      location: location.trim() || null,
      status: status.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    resetForm();
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" aria-label="Add training partner">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add training partner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="college-name">College name *</Label>
            <Input
              id="college-name"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tp-contact-name">Contact name</Label>
            <Input
              id="tp-contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tp-email">Email</Label>
            <Input
              id="tp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tp-location">Location</Label>
            <Input
              id="tp-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tp-status">Status</Label>
            <Input id="tp-status" value={status} onChange={(e) => setStatus(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding…" : "Add partner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
