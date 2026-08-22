import { createClient } from "@/lib/supabase/server";
import { TrainingPartnerGrid } from "@/components/training-partners/training-partner-grid";
import { AddTrainingPartnerDialog } from "@/components/training-partners/add-training-partner-dialog";

export const dynamic = "force-dynamic";

export default async function TrainingPartnerProgramPage() {
  const supabase = createClient();
  const { data: partners } = await supabase
    .from("training_partners")
    .select("*")
    .order("college_name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Training Partner Program
          </h1>
          <p className="text-sm text-muted-foreground">
            Colleges and training programs partnered with Industry Auditions.
          </p>
        </div>
        <AddTrainingPartnerDialog />
      </div>
      <TrainingPartnerGrid partners={partners ?? []} />
    </div>
  );
}
