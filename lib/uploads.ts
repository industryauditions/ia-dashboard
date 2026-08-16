import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/** Uploads a logo file to the public `partner-logos` bucket, scoped under
 * the partner's id, and returns its public URL. */
export async function uploadPartnerLogo(
  supabase: SupabaseClient<Database>,
  partnerId: string,
  file: File
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${partnerId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("partner-logos")
    .upload(path, file, { upsert: true, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from("partner-logos").getPublicUrl(path);
  return data.publicUrl;
}
