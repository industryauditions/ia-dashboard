import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PartnerProfileEditor } from "@/components/annual-partners/partner-profile-editor";
import { NotesPanel, type NoteRow } from "@/components/notes/notes-panel";
import { formatDate } from "@/lib/format";
import { currentPackage } from "@/lib/partner-packages";

export const dynamic = "force-dynamic";

export default async function PartnerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: partner }, { data: notesRaw }, { data: schedule }, { data: packages }] =
    await Promise.all([
      supabase.from("annual_partners").select("*").eq("id", params.id).single(),
      supabase
        .from("partner_notes")
        .select("id, note, created_at, author_id, profiles(display_name, email)")
        .eq("partner_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("post_schedule")
        .select(
          "id, raw_company_text, audition_date_text, posting_time_text, is_posted, country"
        )
        .eq("partner_id", params.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("partner_packages")
        .select("*")
        .eq("partner_id", params.id)
        .order("package_number", { ascending: true }),
    ]);

  if (!partner) {
    notFound();
  }

  const current = currentPackage(packages ?? []);

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
          href="/annual-partners"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Annual Partners
        </Link>
        <div className="mt-2 flex items-center gap-3">
          {partner.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={partner.logo_url}
              alt={partner.canonical_name}
              className="h-9 object-contain"
            />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              {partner.canonical_name}
            </h1>
          )}
          {current?.end_date && (
            <Badge variant="outline">Renews {formatDate(current.end_date)}</Badge>
          )}
        </div>
        {partner.status_note && (
          <p className="mt-1 text-sm text-muted-foreground">{partner.status_note}</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company & package details</CardTitle>
        </CardHeader>
        <CardContent>
          <PartnerProfileEditor partner={partner} packages={packages ?? []} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <NotesPanel
              table="partner_notes"
              parentIdField="partner_id"
              parentId={partner.id}
              initialNotes={notes}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Post schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {schedule && schedule.length > 0 ? (
              <div className="space-y-3">
                {schedule.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {s.raw_company_text || partner.canonical_name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[s.audition_date_text, s.posting_time_text, s.country]
                          .filter(Boolean)
                          .join(" · ") || "No schedule details"}
                      </p>
                    </div>
                    {s.is_posted ? (
                      <Badge variant="success" className="shrink-0">
                        Posted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Pending
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No post schedule entries for this partner yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
