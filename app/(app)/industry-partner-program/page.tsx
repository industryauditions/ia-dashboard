import { createClient } from "@/lib/supabase/server";
import { IndustryPartnerGrid } from "@/components/industry-partners/industry-partner-grid";

export const dynamic = "force-dynamic";

export default async function IndustryPartnerProgramPage() {
  const supabase = createClient();
  const { data: partners } = await supabase
    .from("industry_partners")
    .select("*")
    .order("agency_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Industry Partner Program
        </h1>
        <p className="text-sm text-muted-foreground">
          Talent agencies and industry partners in the referral program.
        </p>
      </div>
      <IndustryPartnerGrid partners={partners ?? []} />
    </div>
  );
}
