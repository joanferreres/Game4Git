import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const PALETTE = ["#f05133", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

export type BreakdownItem = {
  name: string;
  value: number;
};

type BreakdownDonutProps = {
  data: BreakdownItem[];
  emptyLabel: string;
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function BreakdownDonut({ data, emptyLabel }: BreakdownDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const max = data[0]?.value || 1;

  if (!data.length || total === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-[140px_1fr] sm:items-center">
      <div className="mx-auto h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={64}
              paddingAngle={1.5}
              stroke="#fff"
              strokeWidth={1}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatNumber(Number(value ?? 0))}
              contentStyle={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-600">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: PALETTE[index % PALETTE.length] }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 font-medium tabular-nums text-slate-900">
                {formatNumber(item.value)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-400"
                style={{
                  width: `${Math.min(100, (item.value / max) * 100)}%`,
                  background: PALETTE[index % PALETTE.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
