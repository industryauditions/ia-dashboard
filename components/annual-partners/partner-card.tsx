import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import type { Tables } from "@/lib/supabase/types";

export function PartnerCard({ partner }: { partner: Tables<"annual_partners"> }) {
  const total = partner.package_total || 0;
  const used = partner.used || 0;
  const remaining = partner.remaining ?? Math.max(total - used, 0);
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <Link href={`/annual-partners/${partner.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{partner.canonical_name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Renews {formatDate(partner.renewal_date)}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {used} / {total} posts used
            </span>
            <span>{remaining} remaining</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
