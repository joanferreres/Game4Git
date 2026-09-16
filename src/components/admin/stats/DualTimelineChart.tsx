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

const HOUR_BUCKET_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:00:00Z$/;
const DAY_BUCKET_RE = /^\d{4}-\d{2}-\d{2}$/;

function indexByDate(points: TimelinePoint[]): Map<string, TimelinePoint> {
  const map = new Map<string, TimelinePoint>();
  for (const point of points) {
    map.set(point.date, point);
  }
  return map;
}

/** Contiguous bucket keys from first→last sample (hour or day), so sparse SQL gaps become zeros. */
function completeBucketKeys(dates: string[]): string[] {
  if (!dates.length) return [];
  const sorted = [...dates].sort();
  const start = sorted[0];
  const end = sorted[sorted.length - 1];

  if (HOUR_BUCKET_RE.test(start) && HOUR_BUCKET_RE.test(end)) {
    const keys: string[] = [];
    const cursor = new Date(start);
    const last = new Date(end);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return sorted;
    while (cursor.getTime() <= last.getTime()) {
      const y = cursor.getUTCFullYear();
      const m = String(cursor.getUTCMonth() + 1).padStart(2, "0");
      const d = String(cursor.getUTCDate()).padStart(2, "0");
      const h = String(cursor.getUTCHours()).padStart(2, "0");
      keys.push(`${y}-${m}-${d}T${h}:00:00Z`);
      cursor.setUTCHours(cursor.getUTCHours() + 1);
    }
    return keys;
  }

  if (DAY_BUCKET_RE.test(start) && DAY_BUCKET_RE.test(end)) {
    const keys: string[] = [];
    const cursor = new Date(`${start}T00:00:00Z`);
    const last = new Date(`${end}T00:00:00Z`);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime())) return sorted;
    while (cursor.getTime() <= last.getTime()) {
      keys.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return keys;
  }

  return sorted;
}

function mergeSeries(current: TimelinePoint[], comparison?: TimelinePoint[]) {
  const currentByDate = indexByDate(current);
  const currentKeys = completeBucketKeys(current.map((p) => p.date));

  if (!comparison?.length) {
    return currentKeys.map((date) => {
      const point = currentByDate.get(date);
      return {
        label: date,
        date,
        page_views: point?.page_views ?? 0,
        unique_visitors: point?.unique_visitors ?? 0,
      };
    });
  }

  const prevByDate = indexByDate(comparison);
  const prevKeys = completeBucketKeys(comparison.map((p) => p.date));
  const len = Math.max(currentKeys.length, prevKeys.length);
  const rows: Array<Record<string, string | number>> = [];

  for (let i = 0; i < len; i += 1) {
    const date = currentKeys[i] ?? prevKeys[i] ?? String(i);
    const cur = date ? currentByDate.get(date) : undefined;
    const prevKey = prevKeys[i];
    const prev = prevKey ? prevByDate.get(prevKey) : undefined;
    rows.push({
      label: date,
      date: currentKeys[i] || "",
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
