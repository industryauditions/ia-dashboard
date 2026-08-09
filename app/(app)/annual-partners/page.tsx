import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartnerCard } from "@/components/annual-partners/partner-card";
import {
  PostScheduleTable,
  type PostScheduleRow,
} from "@/components/annual-partners/post-schedule-table";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnnualPartnersPage() {
  const supabase = createClient();

  const [{ data: partners }, { data: postSchedule }] = await Promise.all([
    supabase
      .from("annual_partners")
      .select("*")
      .order("canonical_name", { ascending: true }),
    supabase
      .from("post_schedule")
      .select(
        "id, raw_company_text, audition_date_text, posting_time_text, country, is_posted, grid_prepped, story_prepped, partner_id, annual_partners(canonical_name)"
      )
      .order("created_at", { ascending: false }),
  ]);

  const rows: PostScheduleRow[] = (postSchedule ?? []).map((r) => ({
    id: r.id,
    raw_company_text: r.raw_company_text,
    audition_date_text: r.audition_date_text,
    posting_time_text: r.posting_time_text,
    country: r.country,
    is_posted: r.is_posted,
    grid_prepped: r.grid_prepped,
    story_prepped: r.story_prepped,
    partner_name: (r as { annual_partners?: { canonical_name: string } | null })
      .annual_partners?.canonical_name ?? null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Annual Partners</h1>
        <p className="text-sm text-muted-foreground">
          Partner packages, renewals, and the shared post schedule.
        </p>
      </div>

      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="schedule">Post Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-6">
          {partners && partners.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <PartnerCard key={p.id} partner={p} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No annual partners yet. Data will appear once the import
                finishes.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <PostScheduleTable rows={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
