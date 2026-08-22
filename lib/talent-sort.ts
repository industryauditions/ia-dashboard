import type { Tables } from "@/lib/supabase/types";

export const TALENT_SORT_OPTIONS = [
  { value: "date_added", label: "Date added" },
  { value: "name", label: "Name" },
  { value: "country", label: "Country" },
  { value: "followers", label: "Number of followers" },
] as const;

export type TalentSortOption = (typeof TALENT_SORT_OPTIONS)[number]["value"];

export function sortTalent(
  talent: Tables<"featured_talent">[],
  sortBy: TalentSortOption
) {
  const sorted = [...talent];
  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "country":
      return sorted.sort((a, b) => {
        if (!a.location && !b.location) return 0;
        if (!a.location) return 1;
        if (!b.location) return -1;
        return a.location.localeCompare(b.location);
      });
    case "followers":
      return sorted.sort((a, b) => {
        const av = a.follower_count ?? -1;
        const bv = b.follower_count ?? -1;
        return bv - av;
      });
    case "date_added":
    default:
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }
}
