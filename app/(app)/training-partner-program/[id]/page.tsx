import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotesPanel, type NoteRow } from "@/components/notes/notes-panel";
import { TrainingPartnerDetailsEditor } from "@/components/training-partners/training-partner-details-editor";

export const dynamic = "force-dynamic";

export default async function TrainingPartnerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: partner }, { data: notesRaw }] = await Promise.all([
    supabase.from("training_partners").select("*").eq("id", params.id).single(),
    supabase
      .from("training_partner_notes")
      .select("id, note, created_at, author_id, profiles(display_name, email)")
      .eq("training_partner_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!partner) {
    notFound();
  }

  const notes: NoteRow[] = (notesRaw ?? []).map((n) => {
    const profile = (
      n as unknown as {
        profiles?: { display_name: string | null; email: string } | null;
      }
    ).profiles;
    return {
      id: n.id,
      note: n.note,
      created_at: n.created_at,
      author_id: n.author_id,
      author_label: profile?.display_name || profile?.email || null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/training-partner-program"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Training Partner Program
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{partner.college_name}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingPartnerDetailsEditor partner={partner} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesPanel
            table="training_partner_notes"
            parentIdField="training_partner_id"
            parentId={partner.id}
            initialNotes={notes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
