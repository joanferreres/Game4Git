import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TimelinePoint = {
  date: string;
  page_views: number;
  unique_visitors: number;
};

type DualTimelineChartProps = {
  data: TimelinePoint[];
  comparison?: TimelinePoint[];
  pageViewsLabel: string;
  visitorsLabel: string;
  previousPageViewsLabel?: string;
  previousVisitorsLabel?: string;
  emptyLabel: string;
};

const ACCENT = "#f05133";
const VISITORS = "#334155";
const PREV_VIEWS = "#94a3b8";
const PREV_VISITORS = "#cbd5e1";

function mergeSeries(current: TimelinePoint[], comparison?: TimelinePoint[]) {
  if (!comparison?.length) {
    return current.map((point) => ({
      ...point,
      label: point.date,
    }));
  }

  const len = Math.max(current.length, comparison.length);
  const rows: Array<Record<string, string | number>> = [];
  for (let i = 0; i < len; i += 1) {
    const cur = current[i];
    const prev = comparison[i];
    rows.push({
      label: cur?.date || prev?.date || String(i),
      date: cur?.date || "",
      page_views: cur?.page_views ?? 0,
      unique_visitors: cur?.unique_visitors ?? 0,
      prev_page_views: prev?.page_views ?? 0,
      prev_unique_visitors: prev?.unique_visitors ?? 0,
    });
  }
  return rows;
}

export function DualTimelineChart({
  data,
  comparison,
  pageViewsLabel,
  visitorsLabel,
  previousPageViewsLabel = `${pageViewsLabel} (prev)`,
  previousVisitorsLabel = `${visitorsLabel} (prev)`,
  emptyLabel,
}: DualTimelineChartProps) {
  const chartData = mergeSeries(data, comparison);
  const showComparison = Boolean(comparison?.length);

  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e2e8f0" }}
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area
            type="monotone"
            dataKey="page_views"
            name={pageViewsLabel}
            stroke={ACCENT}
            fill={ACCENT}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="unique_visitors"
            name={visitorsLabel}
            stroke={VISITORS}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
          {showComparison && (
            <Line
              type="monotone"
              dataKey="prev_page_views"
              name={previousPageViewsLabel}
              stroke={PREV_VIEWS}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
          {showComparison && (
            <Line
              type="monotone"
              dataKey="prev_unique_visitors"
              name={previousVisitorsLabel}
              stroke={PREV_VISITORS}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
