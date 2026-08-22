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

export function AddIndustryPartnerDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setAgencyName("");
    setContactName("");
    setEmail("");
    setDiscountCode("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyName.trim()) {
      setError("Agency name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("industry_partners").insert({
      agency_name: agencyName.trim(),
      contact_name: contactName.trim() || null,
      email: email.trim() || null,
      discount_code: discountCode.trim() || null,
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
        <Button size="icon" aria-label="Add industry partner">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add industry partner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agency-name">Agency name *</Label>
            <Input
              id="agency-name"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-name">Contact name</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip-email">Email</Label>
            <Input
              id="ip-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-code">Discount code</Label>
            <Input
              id="discount-code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
            />
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
