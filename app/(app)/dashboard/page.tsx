import {
  Users,
  TrendingUp,
  DollarSign,
  Wallet,
  Lock,
  History,
  Landmark,
  CreditCard,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { SubscriberOverviewClient } from "@/components/dashboard/subscriber-overview-client";
import type {
  OverviewMetric,
  SubscriberHistoryPoint,
} from "@/components/dashboard/subscriber-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
  formatDate,
} from "@/lib/format";

export const dynamic = "force-dynamic";

function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export default async function DashboardPage() {
  const supabase = createClient();

  const [
    { data: subscriberHistoryRaw },
    { data: currentFySnapshot },
    { data: priorFySnapshot },
    { data: allTimeSnapshot },
  ] = await Promise.all([
    supabase
      .from("subscriber_snapshots")
      .select(
        "active_subscriptions, revenuecat_active_subscriptions, stripe_active_subscriptions, mrr, revenue_28d, currency, fetched_at"
      )
      .order("fetched_at", { ascending: false })
      .limit(200),
    supabase
      .from("financial_snapshots")
      .select(
        "period_start, period_end, total_income, total_expenses, net_profit, currency, fetched_at"
      )
      .eq("period_type", "current_fy")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("financial_snapshots")
      .select(
        "period_start, period_end, total_income, total_expenses, net_profit, currency, fetched_at"
      )
      .eq("period_type", "prior_fy")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("financial_snapshots")
      .select("period_start, period_end, total_income, currency, fetched_at")
      .eq("period_type", "all_time")
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const subscriberHistory = (subscriberHistoryRaw ?? [])
    .slice()
    .reverse(); // ascending order for the chart

  const latest = subscriberHistory[subscriberHistory.length - 1];

  // Find the snapshot closest to 7 days before the latest one, for the
  // period-over-period delta badges. Falls back to null (shown as "—")
  // until enough sync history has accumulated.
  let weekAgo: typeof latest | undefined;
  if (latest) {
    const target = new Date(latest.fetched_at).getTime() - 7 * 24 * 60 * 60 * 1000;
    let best: typeof latest | undefined;
    let bestDiff = Infinity;
    for (const row of subscriberHistory) {
      const diff = Math.abs(new Date(row.fetched_at).getTime() - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = row;
      }
    }
    // Only use it if it's actually roughly a week old (within 2 days),
    // otherwise there isn't enough history yet to call it a "7 day" delta.
    if (best && best !== latest && bestDiff < 2 * 24 * 60 * 60 * 1000) {
      weekAgo = best;
    }
  }

  const metrics: OverviewMetric[] = latest
    ? [
        {
          label: "Subscriber count",
          value: formatNumber(latest.active_subscriptions),
          icon: Users,
          deltaPct: weekAgo
            ? pctChange(latest.active_subscriptions, weekAgo.active_subscriptions)
            : null,
        },
        {
          label: "Revenue (28d)",
          value: formatCurrency(latest.revenue_28d, latest.currency),
          icon: DollarSign,
          deltaPct:
            weekAgo && weekAgo.revenue_28d
              ? pctChange(latest.revenue_28d ?? 0, weekAgo.revenue_28d)
              : null,
        },
        {
          label: "Stripe",
          value: formatNumber(latest.stripe_active_subscriptions),
          icon: CreditCard,
          deltaPct:
            weekAgo && weekAgo.stripe_active_subscriptions
              ? pctChange(
                  latest.stripe_active_subscriptions ?? 0,
                  weekAgo.stripe_active_subscriptions
                )
              : null,
        },
        {
          label: "MRR",
          value: formatCurrency(latest.mrr, latest.currency),
          icon: TrendingUp,
          deltaPct: weekAgo ? pctChange(latest.mrr, weekAgo.mrr) : null,
        },
      ]
    : [];

  const chartHistory: SubscriberHistoryPoint[] = subscriberHistory.map((row) => ({
    date: row.fetched_at,
    label: formatDate(row.fetched_at),
    subscribers: row.active_subscriptions,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of subscribers and revenue.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Subscribers
        </h2>
        {latest ? (
          <SubscriberOverviewClient metrics={metrics} history={chartHistory} />
        ) : (
          <EmptyStateCard message="No subscriber data yet. It will appear once the sync process runs." />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Annual Company Revenue
          {currentFySnapshot && (
            <span className="ml-2 normal-case font-normal text-muted-foreground/70">
              (FY to date: {formatDate(currentFySnapshot.period_start)} –{" "}
              {formatDate(currentFySnapshot.period_end)})
            </span>
          )}
        </h2>
        {currentFySnapshot ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total income"
              value={formatCurrency(
                currentFySnapshot.total_income,
                currentFySnapshot.currency
              )}
              icon={DollarSign}
              hint={`${formatDateTime(currentFySnapshot.fetched_at)}`}
            />
            <StatCard
              label="Net profit"
              value={formatCurrency(
                currentFySnapshot.net_profit,
                currentFySnapshot.currency
              )}
              icon={Wallet}
              hint={`${formatDateTime(currentFySnapshot.fetched_at)}`}
            />
          </div>
        ) : (
          <Card className="border-dashed">
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Financial data — owner only
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Financial data is either not available yet or is restricted to
                the account owner.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {priorFySnapshot && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Last Financial Year
            <span className="ml-2 normal-case font-normal text-muted-foreground/70">
              ({formatDate(priorFySnapshot.period_start)} –{" "}
              {formatDate(priorFySnapshot.period_end)})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total income"
              value={formatCurrency(
                priorFySnapshot.total_income,
                priorFySnapshot.currency
              )}
              icon={History}
              hint="What we're aiming to match and beat this FY"
            />
            <StatCard
              label="Net profit"
              value={formatCurrency(
                priorFySnapshot.net_profit,
                priorFySnapshot.currency
              )}
              icon={History}
              hint="What we're aiming to match and beat this FY"
            />
          </div>
        </section>
      )}

      {allTimeSnapshot && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            All Time Revenue
            <span className="ml-2 normal-case font-normal text-muted-foreground/70">
              (since {formatDate(allTimeSnapshot.period_start)})
            </span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total revenue"
              value={formatCurrency(
                allTimeSnapshot.total_income,
                allTimeSnapshot.currency
              )}
              icon={Landmark}
              hint={`As of ${formatDateTime(allTimeSnapshot.fetched_at)}`}
            />
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyStateCard({ message }: { message: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center text-sm text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  );
}
