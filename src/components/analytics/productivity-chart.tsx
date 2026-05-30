"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsTrendPoint } from "@/services/analytics/dashboard-analytics.service";

type ProductivityChartProps = {
  data: AnalyticsTrendPoint[];
};

export function ProductivityChart({ data }: ProductivityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        A evolução de produtividade aparece após projetos concluídos.
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 12, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="productivityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.22} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border)"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={48}
            unit=" m²/d"
          />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-soft)",
            }}
            formatter={(value) => [`${value} m²/dia`, "Produtividade"]}
            labelFormatter={(_, payload) =>
              payload[0]?.payload.projectName ?? "Projeto"
            }
          />
          <Area
            type="monotone"
            dataKey="productivity"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#productivityGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
