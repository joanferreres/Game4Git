type PageRow = {
  path: string;
  views: number;
  visitors: number;
};

type TopPagesTableProps = {
  pages: PageRow[];
  totalViews: number;
  emptyLabel: string;
  pathLabel: string;
  viewsLabel: string;
  visitorsLabel: string;
  shareLabel: string;
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function TopPagesTable({
  pages,
  totalViews,
  emptyLabel,
  pathLabel,
  viewsLabel,
  visitorsLabel,
  shareLabel,
}: TopPagesTableProps) {
  if (!pages.length) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  const maxViews = pages[0]?.views || 1;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-slate-500">
            <th className="pb-3 font-medium">{pathLabel}</th>
            <th className="pb-3 text-right font-medium">{viewsLabel}</th>
            <th className="pb-3 text-right font-medium">{visitorsLabel}</th>
            <th className="pb-3 text-right font-medium">{shareLabel}</th>
            <th className="w-28 pb-3 font-medium" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => {
            const share = totalViews ? (page.views / totalViews) * 100 : 0;
            const bar = Math.min(100, (page.views / maxViews) * 100);
            return (
              <tr key={page.path} className="border-b border-slate-50 last:border-0">
                <td className="max-w-[240px] truncate py-2.5 font-medium text-slate-900">
                  {page.path}
                </td>
                <td className="py-2.5 text-right tabular-nums text-slate-700">
                  {formatNumber(page.views)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-slate-700">
                  {formatNumber(page.visitors)}
                </td>
                <td className="py-2.5 text-right tabular-nums text-slate-500">
                  {share.toFixed(1)}%
                </td>
                <td className="py-2.5 pl-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#f05133]/80"
                      style={{ width: `${bar}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
