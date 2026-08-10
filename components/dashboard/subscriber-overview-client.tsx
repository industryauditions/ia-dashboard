"use client";

import dynamic from "next/dynamic";
import type { OverviewMetric, SubscriberHistoryPoint } from "@/components/dashboard/subscriber-overview";

// Charting libraries can be finicky during server-side rendering (they
// measure DOM size, etc). Loading this client-only avoids any chance of
// that causing a server-side render exception — the server just sends a
// lightweight placeholder and the real chart mounts in the browser.
const SubscriberOverview = dynamic(
  () =>
    import("@/components/dashboard/subscriber-overview").then(
      (m) => m.SubscriberOverview
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[26rem] w-full animate-pulse rounded-xl border bg-muted/30" />
    ),
  }
);

export function SubscriberOverviewClient({
  metrics,
  history,
}: {
  metrics: OverviewMetric[];
  history: SubscriberHistoryPoint[];
}) {
  return <SubscriberOverview metrics={metrics} history={history} />;
}
