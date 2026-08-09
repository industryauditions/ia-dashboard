import { createClient } from "@/lib/supabase/server";
import { TalentGrid } from "@/components/featured-talent/talent-grid";

export const dynamic = "force-dynamic";

export default async function FeaturedTalentPage() {
  const supabase = createClient();
  const { data: talent } = await supabase
    .from("featured_talent")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Featured Talent</h1>
        <p className="text-sm text-muted-foreground">
          Track outreach and app onboarding status for featured talent.
        </p>
      </div>

      <TalentGrid talent={talent ?? []} />
    </div>
  );
}
