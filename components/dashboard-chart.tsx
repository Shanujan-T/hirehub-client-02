"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardPanel } from "@/components/stat-card";

export type ChartDatum = { name: string; count: number };

type GradientPreset = "blue" | "brand";

const GRADIENTS: Record<
  GradientPreset,
  { id: string; top: string; bottom: string; cursor: string }
> = {
  blue: {
    id: "dashboard-bar-blue",
    top: "#38bdf8",
    bottom: "#08308b",
    cursor: "color-mix(in srgb, #007acd 10%, transparent)",
  },
  brand: {
    id: "dashboard-bar-brand",
    top: "#a855f7",
    bottom: "#4d2bd8",
    cursor: "color-mix(in srgb, #7d07db 10%, transparent)",
  },
};

const tooltipStyle = {
  backgroundColor: "var(--color-card)",
  border: "1px solid color-mix(in srgb, var(--color-border) 80%, transparent)",
  borderRadius: "0.75rem",
  color: "var(--color-foreground)",
  fontSize: "12px",
  boxShadow: "0 10px 30px color-mix(in srgb, var(--color-secondary) 12%, transparent)",
};

function truncateAxisLabel(value: string, max = 12) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const count = payload[0]?.value ?? 0;
  return (
    <div style={tooltipStyle} className="px-3 py-2">
      <p className="font-bold text-foreground">{label}</p>
      <p className="mt-0.5 text-muted">
        <span className="font-semibold text-foreground">{count}</span> total
      </p>
    </div>
  );
}

export function DashboardBarChart({
  title,
  data,
  emptyMessage = "No data yet",
  gradient = "blue",
}: {
  title: string;
  data: ChartDatum[];
  emptyMessage?: string;
  /** Visual palette — blue/teal for category charts, brand purple for status charts */
  gradient?: GradientPreset;
}) {
  const palette = GRADIENTS[gradient];

  return (
    <DashboardPanel title={title}>
      {data.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="rounded-xl border border-border/50 bg-background/40 p-3 dark:bg-background/20">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 4 }}>
              <defs>
                <linearGradient id={palette.id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.top} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={palette.bottom} stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="color-mix(in srgb, var(--color-border) 45%, transparent)"
                strokeDasharray="4 7"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-38}
                textAnchor="end"
                height={78}
                tickFormatter={(value: string) => truncateAxisLabel(value)}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: palette.cursor }}
                content={<ChartTooltip />}
              />
              <Bar dataKey="count" fill={`url(#${palette.id})`} radius={[10, 10, 0, 0]} maxBarSize={52}>
                {data.map((entry) => (
                  <Cell key={entry.name} fill={`url(#${palette.id})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardPanel>
  );
}

export function DashboardChartGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}
