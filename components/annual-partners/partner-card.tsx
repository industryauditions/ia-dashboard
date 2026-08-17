import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Tables } from "@/lib/supabase/types";

export function PartnerCard({
  partner,
  current,
  days,
}: {
  partner: Tables<"annual_partners">;
  current: Tables<"partner_packages"> | null;
  days: number | null;
}) {
  const total = current?.total_auditions ?? 0;
  const used = current?.used_auditions ?? 0;
  const remaining = Math.max(total - used, 0);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const inactive = !partner.is_active;

  return (
    <Link href={`/annual-partners/${partner.id}`} className="block h-full">
      <Card
        className={cn(
          "h-full transition-shadow hover:shadow-md",
          inactive && "bg-muted/40 grayscale"
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            {partner.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={partner.logo_url}
                alt={partner.canonical_name}
                title={partner.canonical_name}
                className={cn(
                  "h-10 max-w-[65%] object-contain object-left",
                  inactive && "opacity-50"
                )}
              />
            ) : (
              <CardTitle
                className={cn(
                  "truncate text-base",
                  inactive && "text-muted-foreground"
                )}
              >
                {partner.canonical_name}
              </CardTitle>
            )}
            {inactive ? (
              <Badge variant="outline" className="shrink-0 whitespace-nowrap text-muted-foreground">
                Inactive
              </Badge>
            ) : (
              days !== null && (
                <Badge
                  variant={days < 0 ? "destructive" : days <= 14 ? "warning" : "secondary"}
                  className="shrink-0 whitespace-nowrap"
                >
                  {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d until renewal`}
                </Badge>
              )
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {current
              ? `Package #${current.package_number} · Renews ${formatDate(current.end_date)}`
              : "No package set up yet"}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {used} / {total} auditions used
            </span>
            <span>{remaining} remaining</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full",
                inactive ? "bg-muted-foreground/40" : "bg-primary"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
