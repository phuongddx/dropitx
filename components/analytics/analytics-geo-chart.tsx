"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import type { PieLabelRenderProps } from "recharts";
import type { GeoBreakdown } from "@/types/analytics";

const PIE_PALETTE_LIGHT = [
  'oklch(0.655 0.222 47)', 'oklch(0.623 0.178 155)', 'oklch(0.65 0.17 80)', 'oklch(0.55 0.19 300)',
  'oklch(0.60 0.15 200)', 'oklch(0.55 0.22 25)', 'oklch(0.68 0.16 85)', 'oklch(0.56 0.13 180)',
];

const PIE_PALETTE_DARK = [
  'oklch(0.72 0.18 47)', 'oklch(0.75 0.17 155)', 'oklch(0.75 0.17 80)', 'oklch(0.65 0.19 300)',
  'oklch(0.65 0.15 200)', 'oklch(0.65 0.2 25)', 'oklch(0.82 0.14 85)', 'oklch(0.7 0.13 180)',
];

interface AnalyticsGeoChartProps {
  data: GeoBreakdown[];
}

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
  JP: "Japan", KR: "South Korea", IN: "India", BR: "Brazil", CA: "Canada",
  AU: "Australia", NL: "Netherlands", SG: "Singapore", VN: "Vietnam",
  PH: "Philippines", MX: "Mexico", IT: "Italy", ES: "Spain",
};

function CustomTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ payload: GeoBreakdown }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const name = COUNTRY_NAMES[item.country_code] ?? item.country_code;
  return (
    <div className="rounded-md border border-border bg-popover p-3 text-sm">
      <p className="font-medium">{name}</p>
      <p className="text-muted-foreground">{item.views} views</p>
    </div>
  );
}

export function AnalyticsGeoChart({ data }: AnalyticsGeoChartProps) {
  const isDark = useTheme().theme === "dark";
  const palette = isDark ? PIE_PALETTE_DARK : PIE_PALETTE_LIGHT;

  // Bucket small countries into "Other"
  const top = data.slice(0, 8);
  const otherViews = data.slice(8).reduce((sum, d) => sum + d.views, 0);
  const chartData = otherViews > 0
    ? [...top, { country_code: "Other", views: otherViews }]
    : top;

  const total = chartData.reduce((sum, d) => sum + d.views, 0);

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="views"
            nameKey="country_code"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={(props: PieLabelRenderProps) => {
              const entry = props as PieLabelRenderProps & GeoBreakdown;
              const cc = entry.country_code ?? String(props.name ?? "");
              const views = entry.views ?? Number(props.value ?? 0);
              const pct = total > 0 ? Math.round((views / total) * 100) : 0;
              return `${cc} ${pct}%`;
            }}
            labelLine={false}
            fontSize={11}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
