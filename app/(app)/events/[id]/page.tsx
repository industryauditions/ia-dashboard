import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const [{ data: event }, { data: sessions }] = await Promise.all([
    supabase.from("events").select("*").eq("id", params.id).single(),
    supabase
      .from("event_sessions")
      .select("id, time_slot, attendee_org, confirmed")
      .eq("event_id", params.id)
      .order("time_slot", { ascending: true }),
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Events
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{event.title}</h1>
          {event.confirmed ? (
            <Badge variant="success">Confirmed</Badge>
          ) : (
            <Badge variant="outline">Tentative</Badge>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.date_text}
          {event.venue ? ` · ${event.venue}` : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Ticket price
              </p>
              <p className="mt-1">{event.ticket_price || "—"}</p>
            </div>
            {event.tickets_on_sale_text && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Tickets on sale
                </p>
                <p className="mt-1">{event.tickets_on_sale_text}</p>
              </div>
            )}
            <Separator />
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Booking notes
              </p>
              <p className="mt-1 whitespace-pre-wrap">
                {event.booking_notes || "No booking notes."}
              </p>
            </div>
            {event.notes && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {s.time_slot || "No time set"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.attendee_org || "No attendee organization set"}
                      </p>
                    </div>
                    {s.confirmed ? (
                      <Badge variant="success" className="shrink-0">
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        Tentative
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sessions scheduled for this event yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
