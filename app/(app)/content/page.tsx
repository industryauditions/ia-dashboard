import { createClient } from "@/lib/supabase/server";
import { TalentCard } from "@/components/featured-talent/talent-card";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const supabase = createClient();
  const { data: talent } = await supabase
    .from("featured_talent")
    .select("*")
    .eq("asked_to_create_content", true)
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content</h1>
        <p className="text-sm text-muted-foreground">
          Featured talent who&apos;ve been asked to create content for us. This
          list stays in sync with their Featured Talent card automatically —
          untick &quot;Asked to create content&quot; on their page to remove them.
        </p>
      </div>

      {talent && talent.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {talent.map((t) => (
            <TalentCard key={t.id} talent={t} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No one has been asked to create content yet. Check the box on a
            talent&apos;s page under Featured Talent to add them here.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
