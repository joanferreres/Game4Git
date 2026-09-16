import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Shield, Eye, EyeOff, LogOut, RefreshCw, BarChart2, Users, Globe, MousePointer, ChevronLeft, Download, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { DualTimelineChart } from "@/components/admin/stats/DualTimelineChart";
import { BreakdownDonut } from "@/components/admin/stats/BreakdownDonut";
import { CountryChoropleth } from "@/components/admin/stats/CountryChoropleth";
import { WeeklyHeatmap } from "@/components/admin/stats/WeeklyHeatmap";
import { TopPagesTable } from "@/components/admin/stats/TopPagesTable";

type TimeRange = "24h" | "7d" | "30d" | "90d";

interface StatsData {
  range: TimeRange;
  overview: {
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    activeNow: number;
  };
  previous: { uniqueVisitors: number; pageViews: number; sessions: number };
  changes: { uniqueVisitors: number; pageViews: number; sessions: number };
  timeline: Array<{ date: string; page_views: number; unique_visitors: number }>;
  paths: Array<{ path: string; views: number; visitors: number }>;
  referrers: Array<{ referrer: string; count: number }>;
  utmSources: Array<{ utm_source: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  devices: Array<{ device_type: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  os: Array<{ os: string; count: number }>;
  verification: { verifiedEvents: number; totalEvents: number; verifiedRate: number };
  heatmap: Array<{ dow: number; hour: number; count: number }>;
  comparison?: {
    overview: { uniqueVisitors: number; pageViews: number; sessions: number };
    timeline: Array<{ date: string; page_views: number; unique_visitors: number }>;
  };
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "90d", label: "90d" },
];

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

const COUNTRY_NAMES: Record<string, string> = {
  ES: "Spain", US: "United States", GB: "United Kingdom", DE: "Germany", FR: "France",
  IT: "Italy", BR: "Brazil", MX: "Mexico", AR: "Argentina", CO: "Colombia",
  CL: "Chile", PE: "Peru", VE: "Venezuela", EC: "Ecuador", UY: "Uruguay",
  CA: "Canada", AU: "Australia", JP: "Japan", CN: "China", IN: "India",
  NL: "Netherlands", BE: "Belgium", CH: "Switzerland", AT: "Austria", PL: "Poland",
  PT: "Portugal", RO: "Romania", CZ: "Czech Republic", GR: "Greece", HU: "Hungary",
  SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland", IE: "Ireland",
  NZ: "New Zealand", ZA: "South Africa", SG: "Singapore", HK: "Hong Kong", TW: "Taiwan",
  KR: "South Korea", MY: "Malaysia", TH: "Thailand", VN: "Vietnam", PH: "Philippines",
  ID: "Indonesia", TR: "Turkey", IL: "Israel", AE: "UAE", SA: "Saudi Arabia",
  XX: "Unknown",
};

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function getProgressWidth(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, (value / max) * 100);
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  description?: string;
}) => (
  <Card className="border-slate-200 bg-white shadow-none">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-slate-950">{value}</p>
          {trend && (
            <p className={`mt-1.5 text-xs font-medium ${trend.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>
              {trend}
            </p>
          )}
          {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RankedBars = ({
  data,
  labelKey,
  valueKey,
  maxValue,
}: {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  maxValue: number;
}) => (
  <div className="space-y-2.5">
    {data.map((item, index) => (
      <div key={index} className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="max-w-[160px] truncate pr-2 text-slate-600">{String(item[labelKey])}</span>
          <span className="min-w-[48px] text-right font-medium tabular-nums text-slate-900">
            {formatNumber(Number(item[valueKey]))}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-500 transition-all duration-500"
            style={{ width: `${getProgressWidth(Number(item[valueKey]), maxValue)}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const formatDelta = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const AdminStats = () => {
  const { t, i18n } = useTranslation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [includeUnverified, setIncludeUnverified] = useState(false);
  const [pathFilter, setPathFilter] = useState("");
  const [pathDraft, setPathDraft] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [compare, setCompare] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasSession = sessionStorage.getItem("admin_session") === "1";
    if (hasSession) {
      setIsAuthenticated(true);
      checkSession();
    }

    const storedLock = sessionStorage.getItem("admin_lock_until");
    if (storedLock) {
      const ts = parseInt(storedLock, 10);
      if (!Number.isNaN(ts)) {
        setLockUntil(ts);
      }
    }
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/admin/check-session", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Stats request failed with ${res.status}`);
      }
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setSessionExpiresAt(data.expiresAt);
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_session");
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ range: timeRange });
      if (includeUnverified) qs.set("includeUnverified", "1");
      if (pathFilter) qs.set("path", pathFilter);
      if (countryFilter) qs.set("country", countryFilter);
      if (compare) qs.set("compare", "1");
      const res = await fetch(`/api/admin/stats?${qs}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("admin_session");
        toast.error(t("adminStats.sessionExpired"));
        return;
      }
      if (!res.ok) {
        throw new Error(`Stats request failed with ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError(t("adminStats.fetchError"));
      toast.error(t("adminStats.fetchError"));
    } finally {
      setLoading(false);
    }
  }, [timeRange, includeUnverified, pathFilter, countryFilter, compare, t]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, fetchStats]);

  const handleLogin = async () => {
    try {
      const now = Date.now();
      if (lockUntil && now < lockUntil) {
        const remaining = Math.max(0, lockUntil - now);
        const mins = Math.ceil(remaining / 60000);
        toast.error(`${t("adminStats.locked")} ~${mins} ${t("adminStats.minutes")}.`);
        return;
      }

      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAttempts(0);
        sessionStorage.setItem("admin_session", "1");
        sessionStorage.removeItem("admin_lock_until");
        setLockUntil(null);
        setSessionExpiresAt(data.expiresAt);
        toast.success(t("adminStats.loginSuccess"));
      } else {
        const next = attempts + 1;
        setAttempts(next);
        toast.error(`${t("adminStats.wrongPassword")} ${next}/3`);
        if (next >= 3) {
          const until = now + 15 * 60 * 1000;
          sessionStorage.setItem("admin_lock_until", String(until));
          setLockUntil(until);
          toast.error(t("adminStats.tooManyAttempts"));
        }
        toast.error(data.error || t("adminStats.wrongPassword"));
      }
    } finally {
      setPassword("");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setStats(null);
      sessionStorage.removeItem("admin_session");
      toast.success(t("adminStats.loggedOut"));
    } catch {
      toast.error(t("adminStats.logoutError"));
    }
  };

  const handleRefresh = () => {
    fetchStats();
    toast.success(t("adminStats.refreshed"));
  };

  const applyPathFilter = () => {
    setPathFilter(pathDraft.trim());
  };

  const remainingMs = lockUntil ? Math.max(0, lockUntil - Date.now()) : 0;
  const isLocked = remainingMs > 0;

  const dayLabels = (() => {
    const locale = i18n.language || "en";
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // Sunday=0 … Saturday=6 to match SQLite strftime('%w')
    return Array.from({ length: 7 }, (_, dow) => {
      const d = new Date(Date.UTC(2024, 0, 7 + dow));
      return formatter.format(d);
    });
  })();

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="absolute right-4 top-4">
          <LanguageSelector />
        </div>
        <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <BarChart2 className="h-6 w-6 text-slate-700" />
            </div>
            <CardTitle className="text-xl text-slate-950">{t("adminStats.title")}</CardTitle>
            <CardDescription className="text-slate-500">{t("adminStats.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-800">{t("adminStats.authRequired")}</AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">{t("adminStats.password")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("adminStats.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="border-slate-200 bg-white pr-10 text-slate-950"
                  disabled={attempts >= 3 || isLocked}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-900"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-slate-950 text-white hover:bg-slate-800"
              disabled={attempts >= 3 || isLocked || !password}
            >
              {isLocked || attempts >= 3 ? t("adminStats.locked") : t("adminStats.login")}
            </Button>

            {attempts > 0 && attempts < 3 && (
              <p className="text-center text-sm text-red-500">
                {t("adminStats.attemptsRemaining", { count: 3 - attempts })}
              </p>
            )}
            {isLocked && (
              <p className="text-center text-sm text-amber-700">
                {t("adminStats.blocked", { minutes: Math.ceil(remainingMs / 60000) })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxReferrerCount = stats?.referrers[0]?.count || 1;
  const maxUtmCount = stats?.utmSources[0]?.count || 1;

  const sessionTimeLeft = sessionExpiresAt ? Math.max(0, sessionExpiresAt - Date.now()) : 0;
  const sessionHours = Math.floor(sessionTimeLeft / (1000 * 60 * 60));
  const sessionMinutes = Math.floor((sessionTimeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const verifiedOnly = !includeUnverified;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-950 text-xs font-bold text-white">G</div>
            <span className="font-semibold tracking-tight">
              Game4Git <span className="font-normal text-slate-400">/ Analytics</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 text-sm font-medium text-emerald-600 md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>
                {t("adminStats.sessionActive")}{" "}
                {sessionHours > 0 ? `${sessionHours}h ${sessionMinutes}m` : `${sessionMinutes}m`}
              </span>
            </div>
            <LanguageSelector />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("adminStats.logout")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {t("adminStats.dashboardTitle")}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{t("adminStats.dashboardSubtitle")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {stats?.verification && (
                <Badge
                  variant="outline"
                  className="border-slate-200 bg-white font-medium tabular-nums text-slate-700"
                >
                  {t("adminStats.verifiedRate")}: {stats.verification.verifiedRate}%
                </Badge>
              )}
              {lastUpdated && (
                <span className="hidden text-xs text-slate-500 sm:inline">
                  {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {t("adminStats.refresh")}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="h-9 w-[110px] border-slate-200 bg-white text-slate-900">
                <SelectValue placeholder={t("adminStats.timeRange")} />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white">
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              <Switch
                id="verified-only"
                checked={verifiedOnly}
                onCheckedChange={(checked) => setIncludeUnverified(!checked)}
              />
              <Label htmlFor="verified-only" className="cursor-pointer text-sm text-slate-700">
                {t("adminStats.verifiedOnly")}
              </Label>
            </div>

            <div className="flex items-center gap-2 border-l border-slate-100 pl-3">
              <Switch id="compare-period" checked={compare} onCheckedChange={setCompare} />
              <Label htmlFor="compare-period" className="cursor-pointer text-sm text-slate-700">
                {t("adminStats.comparePeriod")}
              </Label>
            </div>

            <div className="flex min-w-[180px] flex-1 items-center gap-2">
              <Input
                value={pathDraft}
                onChange={(e) => setPathDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyPathFilter()}
                onBlur={applyPathFilter}
                placeholder={t("adminStats.filterPath")}
                className="h-9 border-slate-200 bg-white text-sm"
              />
            </div>

            <Select
              value={countryFilter || "__all__"}
              onValueChange={(value) => setCountryFilter(value === "__all__" ? "" : value)}
            >
              <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-slate-900">
                <SelectValue placeholder={t("adminStats.filterCountry")} />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white">
                <SelectItem value="__all__">{t("adminStats.filterCountry")}</SelectItem>
                {(stats?.countries || []).map((c) => (
                  <SelectItem key={c.country} value={c.country}>
                    {COUNTRY_NAMES[c.country] || c.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!stats && loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
            ))}
          </div>
        )}

        {stats && (
          <>
            <div className="mb-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title={t("adminStats.uniqueVisitors")}
                value={formatNumber(stats.overview.uniqueVisitors)}
                icon={Users}
                trend={formatDelta(stats.changes.uniqueVisitors)}
              />
              <StatCard
                title={t("adminStats.pageViews")}
                value={formatNumber(stats.overview.pageViews)}
                icon={MousePointer}
                trend={formatDelta(stats.changes.pageViews)}
              />
              <StatCard
                title={t("adminStats.sessions")}
                value={formatNumber(stats.overview.sessions)}
                icon={Globe}
                trend={formatDelta(stats.changes.sessions)}
              />
              <StatCard
                title={t("adminStats.activeNow")}
                value={formatNumber(stats.overview.activeNow)}
                icon={Activity}
                description={t("adminStats.last5min")}
              />
            </div>

            <Card className="mb-6 border-slate-200 bg-white shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-slate-950">Traffic overview</CardTitle>
                <CardDescription>
                  {compare
                    ? t("adminStats.comparePeriod")
                    : t("adminStats.pageViewsSeries")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DualTimelineChart
                  data={stats.timeline}
                  comparison={compare ? stats.comparison?.timeline : undefined}
                  pageViewsLabel={t("adminStats.pageViewsSeries")}
                  visitorsLabel={t("adminStats.visitorsSeries")}
                  emptyLabel={t("adminStats.noData")}
                />
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <TabsList className="h-10 bg-slate-100 p-1">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="pages">Pages</TabsTrigger>
                  <TabsTrigger value="audience">Audience</TabsTrigger>
                  <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
                </TabsList>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit border-slate-200 bg-white"
                  onClick={() => {
                    const rows =
                      activeTab === "pages"
                        ? [["Path", "Views", "Visitors"], ...stats.paths.map((p) => [p.path, p.views, p.visitors])]
                        : [
                            ["Date", "Page views", "Visitors"],
                            ...stats.timeline.map((p) => [p.date, p.page_views, p.unique_visitors]),
                          ];
                    const csv = rows
                      .map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(","))
                      .join("\n");
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
                    link.download = `game4git-${activeTab}-${timeRange}.csv`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.topPaths")}</CardTitle>
                      <CardDescription>{t("adminStats.topPathsDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TopPagesTable
                        pages={stats.paths.slice(0, 8)}
                        totalViews={stats.overview.pageViews}
                        emptyLabel={t("adminStats.noData")}
                        pathLabel="Path"
                        viewsLabel={t("adminStats.pageViews")}
                        visitorsLabel={t("adminStats.uniqueVisitors")}
                        shareLabel="%"
                      />
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.referrers")}</CardTitle>
                      <CardDescription>{t("adminStats.referrersDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.referrers.length ? (
                        <RankedBars
                          data={stats.referrers.slice(0, 8)}
                          labelKey="referrer"
                          valueKey="count"
                          maxValue={maxReferrerCount}
                        />
                      ) : (
                        <p className="py-8 text-center text-sm text-slate-500">{t("adminStats.noData")}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-950">{t("adminStats.heatmap")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WeeklyHeatmap
                      data={stats.heatmap || []}
                      emptyLabel={t("adminStats.noData")}
                      dayLabels={dayLabels}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pages" className="mt-0">
                <Card className="border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-950">{t("adminStats.topPaths")}</CardTitle>
                    <CardDescription>{t("adminStats.topPathsDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TopPagesTable
                      pages={stats.paths}
                      totalViews={stats.overview.pageViews}
                      emptyLabel={t("adminStats.noData")}
                      pathLabel="Path"
                      viewsLabel={t("adminStats.pageViews")}
                      visitorsLabel={t("adminStats.uniqueVisitors")}
                      shareLabel="%"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audience" className="mt-0 space-y-6">
                <Card className="border-slate-200 bg-white shadow-none">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-950">{t("adminStats.map")}</CardTitle>
                    <CardDescription>{t("adminStats.countriesDesc")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CountryChoropleth
                      countries={stats.countries}
                      selected={countryFilter}
                      onSelectCountry={setCountryFilter}
                      emptyLabel={t("adminStats.noData")}
                      unknownLabel={COUNTRY_NAMES.XX || "Unknown"}
                      countryNames={COUNTRY_NAMES}
                    />
                  </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.devices")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BreakdownDonut
                        data={stats.devices.map((d) => ({
                          name: DEVICE_LABELS[d.device_type] || d.device_type,
                          value: d.count,
                        }))}
                        emptyLabel={t("adminStats.noData")}
                      />
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.browsers")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BreakdownDonut
                        data={stats.browsers.slice(0, 6).map((b) => ({
                          name: b.browser,
                          value: b.count,
                        }))}
                        emptyLabel={t("adminStats.noData")}
                      />
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.operatingSystems")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <BreakdownDonut
                        data={stats.os.slice(0, 6).map((o) => ({
                          name: o.os,
                          value: o.count,
                        }))}
                        emptyLabel={t("adminStats.noData")}
                      />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="acquisition" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.referrers")}</CardTitle>
                      <CardDescription>{t("adminStats.referrersDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.referrers.length ? (
                        <RankedBars
                          data={stats.referrers}
                          labelKey="referrer"
                          valueKey="count"
                          maxValue={maxReferrerCount}
                        />
                      ) : (
                        <p className="py-8 text-center text-sm text-slate-500">{t("adminStats.noData")}</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border-slate-200 bg-white shadow-none">
                    <CardHeader>
                      <CardTitle className="text-base text-slate-950">{t("adminStats.utmSources")}</CardTitle>
                      <CardDescription>{t("adminStats.utmSourcesDesc")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.utmSources.length ? (
                        <RankedBars
                          data={stats.utmSources}
                          labelKey="utm_source"
                          valueKey="count"
                          maxValue={maxUtmCount}
                        />
                      ) : (
                        <p className="py-8 text-center text-sm text-slate-500">{t("adminStats.noData")}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            <Card className="mt-6 border-slate-200 bg-white shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-slate-900">{t("adminStats.privacyNotice")}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t("adminStats.privacyNoPersonalData")}. {t("adminStats.privacyAdminExcluded")}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/";
            }}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("adminStats.backToHome")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
