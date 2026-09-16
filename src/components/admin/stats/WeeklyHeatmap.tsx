import { useMemo, useState } from "react";

export type HeatmapCell = {
  dow: number;
  hour: number;
  count: number;
};

type WeeklyHeatmapProps = {
  data: HeatmapCell[];
  emptyLabel: string;
  dayLabels: string[];
};

function intensity(count: number, max: number): string {
  if (max <= 0 || count <= 0) return "#f8fafc";
  const t = Math.min(1, count / max);
  // slate → accent #f05133
  const r = Math.round(248 - t * (248 - 240));
  const g = Math.round(250 - t * (250 - 81));
  const b = Math.round(252 - t * (252 - 51));
  return `rgb(${r},${g},${b})`;
}

export function WeeklyHeatmap({ data, emptyLabel, dayLabels }: WeeklyHeatmapProps) {
  const [hover, setHover] = useState<{
    dow: number;
    hour: number;
    count: number;
  } | null>(null);

  const { grid, max } = useMemo(() => {
    const map = new Map<string, number>();
    let localMax = 0;
    for (const cell of data) {
      const key = `${cell.dow}-${cell.hour}`;
      const count = Number(cell.count) || 0;
      map.set(key, count);
      if (count > localMax) localMax = count;
    }
    const rows: number[][] = [];
    for (let dow = 0; dow < 7; dow += 1) {
      const row: number[] = [];
      for (let hour = 0; hour < 24; hour += 1) {
        row.push(map.get(`${dow}-${hour}`) || 0);
      }
      rows.push(row);
    }
    return { grid: rows, max: localMax };
  }, [data]);

  if (!data.length || max === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <div className="inline-grid min-w-full gap-0.5" style={{ gridTemplateColumns: "48px repeat(24, minmax(14px, 1fr))" }}>
          <div />
          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={`h-${hour}`}
              className="pb-1 text-center text-[10px] tabular-nums text-slate-400"
            >
              {hour % 3 === 0 ? hour : ""}
            </div>
          ))}
          {grid.map((row, dow) => (
            <div key={`row-${dow}`} className="contents">
              <div className="flex items-center pr-2 text-[11px] text-slate-500">
                {dayLabels[dow] || dow}
              </div>
              {row.map((count, hour) => (
                <button
                  key={`${dow}-${hour}`}
                  type="button"
                  title={`${dayLabels[dow] || dow} ${String(hour).padStart(2, "0")}:00 — ${count}`}
                  className="aspect-square rounded-[2px] border border-slate-100/80 transition-opacity hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-[#f05133]/40"
                  style={{ background: intensity(count, max) }}
                  onMouseEnter={() => setHover({ dow, hour, count })}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover({ dow, hour, count })}
                  onBlur={() => setHover(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {hover
            ? `${dayLabels[hover.dow] || hover.dow} · ${String(hover.hour).padStart(2, "0")}:00 — ${hover.count}`
            : "\u00a0"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400">0</span>
          <span className="h-2 w-16 rounded-sm bg-gradient-to-r from-slate-50 to-[#f05133]" />
          <span className="tabular-nums text-slate-400">{max}</span>
        </span>
      </div>
    </div>
  );
}
