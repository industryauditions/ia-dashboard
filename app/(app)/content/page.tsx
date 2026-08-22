import { createClient } from "@/lib/supabase/server";
import { ContentGrid } from "@/components/featured-talent/content-grid";

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

      <ContentGrid talent={talent ?? []} />
    </div>
  );
}
