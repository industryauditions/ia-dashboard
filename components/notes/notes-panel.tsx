"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/components/providers/role-provider";
import { createClient } from "@/lib/supabase/client";
import { formatDateTime } from "@/lib/format";

export interface NoteRow {
  id: string;
  note: string;
  created_at: string;
  author_id: string | null;
  author_label?: string | null;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function NotesPanel({
  table,
  parentIdField,
  parentId,
  initialNotes,
}: {
  table:
    | "partner_notes"
    | "featured_talent_notes"
    | "industry_partner_notes"
    | "training_partner_notes";
  parentIdField: "partner_id" | "talent_id" | "industry_partner_id" | "training_partner_id";
  parentId: string;
  initialNotes: NoteRow[];
}) {
  const user = useCurrentUser();
  const [notes, setNotes] = useState<NoteRow[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddNote() {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .insert({
        note: text,
        author_id: user.id,
        [parentIdField]: parentId,
      } as never)
      .select("id, note, created_at, author_id")
      .single();
    setSubmitting(false);
    if (error || !data) {
      setError(error?.message ?? "Failed to add note.");
      return;
    }
    setNotes((prev) => [
      {
        id: data.id,
        note: data.note,
        created_at: data.created_at,
        author_id: data.author_id,
        author_label: user.displayName || user.email,
      },
      ...prev,
    ]);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
        />
        <div className="flex items-center justify-between">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            size="sm"
            className="ml-auto"
            disabled={submitting || !draft.trim()}
            onClick={handleAddNote}
          >
            {submitting ? "Adding…" : "Add note"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notes.length === 0 && (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
        {notes.map((n) => (
          <div key={n.id} className="flex gap-3 rounded-md border p-3">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {initials(n.author_label || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium">
                  {n.author_label || "Unknown"}
                </span>
                <span className="text-[11px] text-muted-foreground shrink-0">
                  {formatDateTime(n.created_at)}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{n.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
