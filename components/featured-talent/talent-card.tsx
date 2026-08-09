import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TALENT_STATUS_BADGE_VARIANT,
  TALENT_STATUS_LABELS,
  type TalentStatus,
} from "@/lib/talent-status";
import type { Tables } from "@/lib/supabase/types";

export function TalentCard({ talent }: { talent: Tables<"featured_talent"> }) {
  const status = (talent.status as TalentStatus) || "need_to_message";

  return (
    <Link href={`/featured-talent/${talent.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={talent.profile_photo_url ?? undefined} alt={talent.name} />
            <AvatarFallback className="text-xs">
              {talent.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{talent.name}</p>
            {talent.instagram_handle && (
              <p className="truncate text-xs text-muted-foreground">
                @{talent.instagram_handle.replace(/^@/, "")}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <Badge variant={TALENT_STATUS_BADGE_VARIANT[status]}>
            {TALENT_STATUS_LABELS[status] ?? talent.status}
          </Badge>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {talent.location && <p>{talent.location}</p>}
            {talent.employer_text && <p>{talent.employer_text}</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
