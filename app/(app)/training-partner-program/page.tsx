import { createClient } from "@/lib/supabase/server";
import { TrainingPartnerGrid } from "@/components/training-partners/training-partner-grid";

export const dynamic = "force-dynamic";

export default async function TrainingPartnerProgramPage() {
  const supabase = createClient();
  const { data: partners } = await supabase
    .from("training_partners")
    .select("*")
    .order("college_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Training Partner Program
        </h1>
        <p className="text-sm text-muted-foreground">
          Colleges and training programs partnered with Industry Auditions.
        </p>
      </div>
      <TrainingPartnerGrid partners={partners ?? []} />
    </div>
  );
}
