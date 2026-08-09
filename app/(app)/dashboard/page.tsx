import { Users, TrendingUp, DollarSign, Wallet, Lock, History } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
  formatDate,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [
    { data: subscriberSnapshot },
    { data: currentFySnapshot },
    { data: priorFySnapshot },
  ] = await Promise.all([
    supabase
      .from("subscriber_snapshots")
      .select(
        "active_subscriptions, revenuecat_active_subscriptions, stripe_active_subscriptions, mrr, revenue_28d, currency, fetched_at"
      )
      .order("fetched_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
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
  ]);

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
        {subscriberSnapshot ? (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="Active subscriptions"
                value={formatNumber(subscriberSnapshot.active_subscriptions)}
                icon={Users}
                hint={`As of ${formatDateTime(subscriberSnapshot.fetched_at)}`}
              />
              <StatCard
                label="Subscription MRR"
                value={formatCurrency(
                  subscriberSnapshot.mrr,
                  subscriberSnapshot.currency
                )}
                icon={TrendingUp}
                hint={`As of ${formatDateTime(subscriberSnapshot.fetched_at)}`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                label="RevenueCat subscribers"
                value={formatNumber(
                  subscriberSnapshot.revenuecat_active_subscriptions
                )}
                className="border-dashed"
              />
              <StatCard
                label="Stripe subscribers"
                value={formatNumber(
                  subscriberSnapshot.stripe_active_subscriptions
                )}
                className="border-dashed"
              />
            </div>
          </div>
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
