import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/lib/supabase/types";

export function EventCard({ event }: { event: Tables<"events"> }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{event.title}</CardTitle>
            {event.confirmed ? (
              <Badge variant="success" className="shrink-0">
                Confirmed
              </Badge>
            ) : (
              <Badge variant="outline" className="shrink-0">
                Tentative
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm text-muted-foreground">{event.date_text}</p>
          {event.venue && (
            <p className="text-sm text-muted-foreground">{event.venue}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
