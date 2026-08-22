"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function FlagRow({
  label,
  description,
  checked,
  saving,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  saving: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={saving}
      className="flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-60"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" />}
      </span>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

export function TalentFlagsEditor({
  talentId,
  featuredOnInstagram,
  askedToCreateContent,
}: {
  talentId: string;
  featuredOnInstagram: boolean;
  askedToCreateContent: boolean;
}) {
  const router = useRouter();
  const [featured, setFeatured] = useState(featuredOnInstagram);
  const [askedContent, setAskedContent] = useState(askedToCreateContent);
  const [savingFeatured, setSavingFeatured] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  async function toggleFeatured() {
    const next = !featured;
    setFeatured(next);
    setSavingFeatured(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("featured_talent")
      .update({ featured_on_instagram: next })
      .eq("id", talentId);
    setSavingFeatured(false);
    if (error) {
      setFeatured(!next);
      return;
    }
    router.refresh();
  }

  async function toggleAskedContent() {
    const next = !askedContent;
    setAskedContent(next);
    setSavingContent(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("featured_talent")
      .update({ asked_to_create_content: next })
      .eq("id", talentId);
    setSavingContent(false);
    if (error) {
      setAskedContent(!next);
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FlagRow
        label="Featured on Instagram"
        description="Shows a badge on their card once we've posted about them."
        checked={featured}
        saving={savingFeatured}
        onToggle={toggleFeatured}
      />
      <FlagRow
        label="Asked to create content"
        description="Adds their card to the Content tab for tracking."
        checked={askedContent}
        saving={savingContent}
        onToggle={toggleAskedContent}
      />
    </div>
  );
}
