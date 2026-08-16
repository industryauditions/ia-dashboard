import type { Tables } from "@/lib/supabase/types";

export type PartnerPackage = Tables<"partner_packages">;

/** The "current" package for a partner is the one with the highest package
 * number — e.g. Royal Caribbean's 3rd annual package supersedes their 1st
 * and 2nd, regardless of dates. */
export function currentPackage(
  packages: PartnerPackage[] | null | undefined
): PartnerPackage | null {
  if (!packages || packages.length === 0) return null;
  return packages.reduce<PartnerPackage | null>((latest, p) => {
    if (!latest || p.package_number > latest.package_number) return p;
    return latest;
  }, null);
}
