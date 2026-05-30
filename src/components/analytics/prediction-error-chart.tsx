"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsTrendPoint } from "@/services/analytics/dashboard-analytics.service";

type PredictionErrorChartProps = {
  data: AnalyticsTrendPoint[];
};

export function PredictionErrorChart({ data }: PredictionErrorChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        A precisão histórica aparece quando houver prazos reais registrados.
      </div>
    );
  }

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -18, right: 12, top: 12, bottom: 0 }}>
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
            width={42}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            contentStyle={{
              borderRadius: 16,
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-soft)",
            }}
            formatter={(value) => [`${value}%`, "Erro"]}
            labelFormatter={(_, payload) =>
              payload[0]?.payload.projectName ?? "Projeto"
            }
          />
          <Bar
            dataKey="errorPercent"
            fill="var(--ring)"
            radius={[12, 12, 4, 4]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
