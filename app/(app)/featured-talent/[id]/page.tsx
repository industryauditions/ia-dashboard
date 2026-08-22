import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotesPanel, type NoteRow } from "@/components/notes/notes-panel";
import { StatusEditor } from "@/components/featured-talent/status-editor";
import { TalentFlagsEditor } from "@/components/featured-talent/talent-flags-editor";
import { formatCompactNumber } from "@/lib/format";
import type { TalentStatus } from "@/lib/talent-status";

export const dynamic = "force-dynamic";

export default async function TalentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: talent }, { data: notesRaw }] = await Promise.all([
    supabase.from("featured_talent").select("*").eq("id", params.id).single(),
    supabase
      .from("featured_talent_notes")
      .select("id, note, created_at, author_id, profiles(display_name, email)")
      .eq("talent_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  if (!talent) {
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
          href="/featured-talent"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Featured Talent
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Avatar className="h-14 w-14">
            <AvatarImage src={talent.profile_photo_url ?? undefined} alt={talent.name} />
            <AvatarFallback>{talent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{talent.name}</h1>
            <div className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              {talent.instagram_handle && <span>@{talent.instagram_handle.replace(/^@/, "")}</span>}
              {talent.follower_count !== null && (
                <span>{formatCompactNumber(talent.follower_count)} followers</span>
              )}
            </div>
          </div>
          {talent.instagram_url && (
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <a href={talent.instagram_url} target="_blank" rel="noopener noreferrer">
                Go to Instagram <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusEditor
            talentId={talent.id}
            status={(talent.status as TalentStatus) || "need_to_message"}
          />
          <TalentFlagsEditor
            talentId={talent.id}
            featuredOnInstagram={talent.featured_on_instagram}
            askedToCreateContent={talent.asked_to_create_content}
          />
          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            {talent.location && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Location
                </p>
                <p className="mt-1">{talent.location}</p>
              </div>
            )}
            {talent.employer_text && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Employer
                </p>
                <p className="mt-1">{talent.employer_text}</p>
              </div>
            )}
            {talent.bio && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Bio
                </p>
                <p className="mt-1 whitespace-pre-wrap">{talent.bio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <NotesPanel
            table="featured_talent_notes"
            parentIdField="talent_id"
            parentId={talent.id}
            initialNotes={notes}
          />
        </CardContent>
      </Card>
    </div>
  );
}
