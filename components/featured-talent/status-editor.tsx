"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { TALENT_STATUSES, TALENT_STATUS_LABELS, type TalentStatus } from "@/lib/talent-status";

export function StatusEditor({
  talentId,
  status,
}: {
  talentId: string;
  status: TalentStatus;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<TalentStatus>(status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleChange(value: string) {
    const next = value as TalentStatus;
    setCurrent(next);
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("featured_talent")
      .update({ status: next })
      .eq("id", talentId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={current} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger className="w-56">
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
      {saved && <Check className="h-4 w-4 text-emerald-600" />}
    </div>
  );
}
