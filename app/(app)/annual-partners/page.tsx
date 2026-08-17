import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PartnerCard } from "@/components/annual-partners/partner-card";
import { AddPartnerDialog } from "@/components/annual-partners/add-partner-dialog";
import {
  PostScheduleTable,
  type PostScheduleRow,
} from "@/components/annual-partners/post-schedule-table";
import { Card, CardContent } from "@/components/ui/card";
import { daysUntil } from "@/lib/format";
import { currentPackage } from "@/lib/partner-packages";
import type { Tables } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AnnualPartnersPage() {
  const supabase = createClient();

  const [{ data: partners }, { data: packages }, { data: postSchedule }] =
    await Promise.all([
      supabase
        .from("annual_partners")
        .select("*")
        .order("canonical_name", { ascending: true }),
      supabase
        .from("partner_packages")
        .select("*")
        .order("package_number", { ascending: true }),
      supabase
        .from("post_schedule")
        .select(
          "id, raw_company_text, audition_date_text, post_live_at, country, is_posted, notes, sort_order, partner_id, annual_partners(canonical_name)"
        )
        .order("created_at", { ascending: false }),
    ]);

  const packagesByPartner = new Map<string, Tables<"partner_packages">[]>();
  for (const pkg of packages ?? []) {
    const list = packagesByPartner.get(pkg.partner_id) ?? [];
    list.push(pkg);
    packagesByPartner.set(pkg.partner_id, list);
  }

  // Cards are ordered by days-until-renewal ascending (soonest renewal
  // first); partners with no package/renewal date yet sink to the bottom.
  // Inactive partners always sink below all active ones, regardless of
  // renewal date.
  const partnerCards = (partners ?? [])
    .map((partner) => {
      const partnerPackages = packagesByPartner.get(partner.id) ?? [];
      const current = currentPackage(partnerPackages);
      const days = current ? daysUntil(current.end_date) : null;
      return { partner, packages: partnerPackages, current, days };
    })
    .sort((a, b) => {
      if (a.partner.is_active !== b.partner.is_active) {
        return a.partner.is_active ? -1 : 1;
      }
      if (a.days === null && b.days === null) {
        return a.partner.canonical_name.localeCompare(b.partner.canonical_name);
      }
      if (a.days === null) return 1;
      if (b.days === null) return -1;
      return a.days - b.days;
    });

  const rows: PostScheduleRow[] = (postSchedule ?? []).map((r) => ({
    id: r.id,
    raw_company_text: r.raw_company_text,
    partner_id: r.partner_id,
    audition_date_text: r.audition_date_text,
    post_live_at: r.post_live_at,
    country: r.country,
    is_posted: r.is_posted,
    notes: r.notes,
    sort_order: r.sort_order,
    partner_name: (r as { annual_partners?: { canonical_name: string } | null })
      .annual_partners?.canonical_name ?? null,
  }));

  const partnerOptions = (partners ?? []).map((p) => ({
    id: p.id,
    canonical_name: p.canonical_name,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Annual Partners</h1>
          <p className="text-sm text-muted-foreground">
            Partner packages, renewals, and the shared post schedule.
          </p>
        </div>
        <AddPartnerDialog />
      </div>

      <Tabs defaultValue="partners">
        <TabsList>
          <TabsTrigger value="partners">Partners</TabsTrigger>
          <TabsTrigger value="schedule">Post Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="partners" className="mt-6">
          {partnerCards.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partnerCards.map(({ partner, current, days }) => (
                <PartnerCard key={partner.id} partner={partner} current={current} days={days} />
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
          <PostScheduleTable rows={rows} partners={partnerOptions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
