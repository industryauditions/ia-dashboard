import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/events/event-card";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const TODAY = new Date("2026-08-09T00:00:00");

function bucketEvent(event: Tables<"events">): "upcoming" | "past" {
  const dateStr = event.end_date || event.start_date;
  const parsed = dateStr
    ? new Date(dateStr + "T00:00:00")
    : new Date(event.created_at);
  if (Number.isNaN(parsed.getTime())) return "upcoming"; // no parseable date -> default to Upcoming
  return parsed >= TODAY ? "upcoming" : "past";
}

export default async function EventsPage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true, nullsFirst: false });

  const all = events ?? [];
  const upcoming = all.filter((e) => bucketEvent(e) === "upcoming");
  const past = all.filter((e) => bucketEvent(e) === "past");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
        <p className="text-sm text-muted-foreground">
          Upcoming and past Industry Auditions events.
        </p>
      </div>

      {all.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No events yet. Data will appear once the import finishes.
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Upcoming ({upcoming.length})
            </h2>
            {upcoming.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Past ({past.length})
            </h2>
            {past.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {past.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No past events.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
