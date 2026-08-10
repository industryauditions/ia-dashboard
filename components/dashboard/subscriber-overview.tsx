"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type OverviewMetric = {
  label: string;
  value: string;
  icon: LucideIcon;
  /** percentage change vs ~7 days ago, or null if not enough history yet */
  deltaPct: number | null;
};

export type SubscriberHistoryPoint = {
  /** ISO date string */
  date: string;
  /** short label for the x-axis, e.g. "Apr 5" */
  label: string;
  subscribers: number;
};

function DeltaBadge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
        —
      </span>
    );
  }
  const isUp = value >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        isUp
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700"
      )}
    >
      {isUp ? (
        <ArrowUp className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-foreground/60" />
        Subscribers
        <span className="font-semibold text-foreground">
          {payload[0].value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export function SubscriberOverview({
  metrics,
  history,
}: {
  metrics: OverviewMetric[];
  history: SubscriberHistoryPoint[];
}) {
  const hasEnoughHistory = history.length >= 2;

  const yDomain = useMemo(() => {
    if (history.length === 0) return [0, 10];
    const values = history.map((h) => h.subscribers);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = Math.max(5, Math.round((max - min) * 0.15));
    return [Math.max(0, min - pad), max + pad];
  }, [history]);

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid grid-cols-2 divide-y divide-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
        {metrics.map((m) => (
          <div key={m.label} className="p-5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <m.icon className="h-4 w-4" />
              {m.label}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {m.value}
              </span>
              <DeltaBadge value={m.deltaPct} />
            </div>
          </div>
        ))}
      </div>

      <div className="border-t p-5">
        {hasEnoughHistory ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="subscriberFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  minTickGap={24}
                />
                <YAxis
                  domain={yDomain}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  width={48}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="subscribers"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  fill="url(#subscriberFill)"
                  className="text-foreground"
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-72 w-full items-center justify-center rounded-md border border-dashed">
            <p className="max-w-xs text-center text-sm text-muted-foreground">
              Not enough history yet to chart a trend — this fills in
              automatically as the background sync runs every 6 hours.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
