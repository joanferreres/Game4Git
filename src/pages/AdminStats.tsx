import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Shield, Eye, EyeOff, LogOut, RefreshCw, BarChart2, Users, Globe, MousePointer, ChevronLeft, Download, Activity } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LanguageSelector from '@/components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
type TimeRange = '24h' | '7d' | '30d' | '90d';

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
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
];

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
};

const COUNTRY_NAMES: Record<string, string> = {
  ES: 'Spain', US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France',
  IT: 'Italy', BR: 'Brazil', MX: 'Mexico', AR: 'Argentina', CO: 'Colombia',
  CL: 'Chile', PE: 'Peru', VE: 'Venezuela', EC: 'Ecuador', UY: 'Uruguay',
  CA: 'Canada', AU: 'Australia', JP: 'Japan', CN: 'China', IN: 'India',
  NL: 'Netherlands', BE: 'Belgium', CH: 'Switzerland', AT: 'Austria', PL: 'Poland',
  PT: 'Portugal', RO: 'Romania', CZ: 'Czech Republic', GR: 'Greece', HU: 'Hungary',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', IE: 'Ireland',
  NZ: 'New Zealand', ZA: 'South Africa', SG: 'Singapore', HK: 'Hong Kong', TW: 'Taiwan',
  KR: 'South Korea', MY: 'Malaysia', TH: 'Thailand', VN: 'Vietnam', PH: 'Philippines',
  ID: 'Indonesia', TR: 'Turkey', IL: 'Israel', AE: 'UAE', SA: 'Saudi Arabia',
  XX: 'Unknown',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getProgressWidth(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.min(100, (value / max) * 100);
}

const StatCard = ({ title, value, icon: Icon, trend, color = 'blue', description }: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  color?: string;
  description?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-violet-50 text-violet-700 border-violet-100',
    orange: 'bg-amber-50 text-amber-700 border-amber-100',
    red: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-950 mt-1">{value}</p>
            {trend && <p className={`text-xs mt-2 font-medium ${trend.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>{trend}</p>}
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BarChart = ({ data, labelKey, valueKey, maxValue, color = 'blue' }: {
  data: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
  maxValue: number;
  color?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    purple: 'bg-violet-600',
    orange: 'bg-amber-500',
    red: 'bg-red-600',
    cyan: 'bg-cyan-600',
    pink: 'bg-pink-600',
    yellow: 'bg-yellow-500',
  };

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 truncate pr-2 max-w-[150px]">
              {String(item[labelKey])}
            </span>
            <span className="text-gray-900 font-medium text-right min-w-[60px]">
              {formatNumber(Number(item[valueKey]))}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorClasses[color as keyof typeof colorClasses]} rounded-full transition-all duration-500`}
              style={{ width: `${getProgressWidth(Number(item[valueKey]), maxValue)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const TrendChart = ({ data }: { data: StatsData['timeline'] }) => {
  const values = data.map((point) => point.page_views);
  const max = Math.max(...values, 1);
  const points = data.length > 1
    ? data.map((point, index) => `${(index / (data.length - 1)) * 100},${100 - (point.page_views / max) * 86 - 7}`).join(' ')
    : '0,93 100,93';
  return (
    <div className="space-y-3">
      <div className="relative h-52 rounded-lg border border-gray-100 bg-gray-50/70 p-3">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">No data for this period</div>
        ) : (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" role="img" aria-label="Page views over time">
            <title>Page views over time</title>
            {[18, 43, 68, 93].map((y) => <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#e5e7eb" strokeWidth="0.6" />)}
            <polyline points={points} fill="none" stroke="#111827" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {data.length > 0 && <div className="flex justify-between text-xs text-gray-500"><span>{data[0]?.date}</span><span>{data[data.length - 1]?.date}</span></div>}
    </div>
  );
};

const formatDelta = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const AdminStats = () => {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSession = sessionStorage.getItem('admin_session') === '1';
    if (hasSession) {
      setIsAuthenticated(true);
      checkSession();
    }

    const storedLock = sessionStorage.getItem('admin_lock_until');
    if (storedLock) {
      const ts = parseInt(storedLock, 10);
      if (!Number.isNaN(ts)) {
        setLockUntil(ts);
      }
    }
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/check-session', {
        credentials: 'include',
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
        sessionStorage.removeItem('admin_session');
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/stats?range=${timeRange}`, {
        credentials: 'include',
      });
      if (res.status === 401) {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_session');
        toast.error(t('adminStats.sessionExpired'));
        return;
      }
      if (!res.ok) {
        throw new Error(`Stats request failed with ${res.status}`);
      }
      const data = await res.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError(t('adminStats.fetchError'));
      toast.error(t('adminStats.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [timeRange, t]);

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
        toast.error(`${t('adminStats.locked')} ~${mins} ${t('adminStats.minutes')}.`);
        return;
      }

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAttempts(0);
        sessionStorage.setItem('admin_session', '1');
        sessionStorage.removeItem('admin_lock_until');
        setLockUntil(null);
        setSessionExpiresAt(data.expiresAt);
        toast.success(t('adminStats.loginSuccess'));
      } else {
        const next = attempts + 1;
        setAttempts(next);
        toast.error(`${t('adminStats.wrongPassword')} ${next}/3`);
        if (next >= 3) {
          const until = now + 15 * 60 * 1000;
          sessionStorage.setItem('admin_lock_until', String(until));
          setLockUntil(until);
          toast.error(t('adminStats.tooManyAttempts'));
        }
        toast.error(data.error || t('adminStats.wrongPassword'));
      }
    } finally {
      setPassword("");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setStats(null);
      sessionStorage.removeItem('admin_session');
      toast.success(t('adminStats.loggedOut'));
    } catch {
      toast.error(t('adminStats.logoutError'));
    }
  };

  const handleRefresh = () => {
    fetchStats();
    toast.success(t('adminStats.refreshed'));
  };

  const remainingMs = lockUntil ? Math.max(0, lockUntil - Date.now()) : 0;
  const isLocked = remainingMs > 0;

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <Card className="w-full max-w-md bg-white border-gray-200 shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <BarChart2 className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle className="text-gray-950 text-xl">{t('adminStats.title')}</CardTitle>
            <CardDescription className="text-gray-500">
              {t('adminStats.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-800">
                {t('adminStats.authRequired')}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">{t('adminStats.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('adminStats.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  className="bg-white border-gray-200 text-gray-950 pr-10"
                  disabled={attempts >= 3 || isLocked}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-900"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-gray-950 hover:bg-gray-800 text-white"
              disabled={attempts >= 3 || isLocked || !password}
            >
              {isLocked ? t('adminStats.locked') : attempts >= 3 ? t('adminStats.locked') : t('adminStats.login')}
            </Button>

            {attempts > 0 && attempts < 3 && (
              <p className="text-red-400 text-sm text-center">
                {t('adminStats.attemptsRemaining', { count: 3 - attempts })}
              </p>
            )}
            {isLocked && (
              <p className="text-amber-700 text-sm text-center">
                {t('adminStats.blocked', { minutes: Math.ceil(remainingMs / 60000) })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxPathViews = stats?.paths[0]?.views || 1;
  const maxReferrerCount = stats?.referrers[0]?.count || 1;
  const maxUtmCount = stats?.utmSources[0]?.count || 1;
  const maxCountryCount = stats?.countries[0]?.count || 1;
  const maxDeviceCount = stats?.devices[0]?.count || 1;
  const maxBrowserCount = stats?.browsers[0]?.count || 1;
  const maxOsCount = stats?.os[0]?.count || 1;

  const sessionTimeLeft = sessionExpiresAt ? Math.max(0, sessionExpiresAt - Date.now()) : 0;
  const sessionHours = Math.floor(sessionTimeLeft / (1000 * 60 * 60));
  const sessionMinutes = Math.floor((sessionTimeLeft % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-gray-950">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-950 text-white flex items-center justify-center text-xs font-bold">G</div>
            <span className="font-semibold tracking-tight">Game4Git <span className="text-gray-400 font-normal">/ Analytics</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>
                {t('adminStats.sessionActive')} {sessionHours > 0 ? `${sessionHours}h ${sessionMinutes}m` : `${sessionMinutes}m`}
              </span>
            </div>
            <LanguageSelector />
            <Button variant="outline" size="sm" onClick={handleLogout} className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50">
              <LogOut className="w-4 h-4 mr-2" />
              {t('adminStats.logout')}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-950 mb-2">
                {t('adminStats.dashboardTitle')}
              </h1>
              <p className="text-gray-500">
                {t('adminStats.dashboardSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-900">
                  <SelectValue placeholder={t('adminStats.timeRange')} />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {TIME_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {lastUpdated && <span className="hidden sm:inline text-xs text-gray-500">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {t('adminStats.refresh')}
              </Button>
            </div>
          </div>
        </div>

        {error && <Alert className="mb-6 border-red-200 bg-red-50 text-red-800"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
        {!stats && loading && <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-xl border border-gray-200 bg-white animate-pulse" />)}</div>}
        {stats && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <StatCard title="Visitors" value={formatNumber(stats.overview.uniqueVisitors)} icon={Users} trend={formatDelta(stats.changes.uniqueVisitors)} description="Unique visitors" color="blue" />
              <StatCard title="Page views" value={formatNumber(stats.overview.pageViews)} icon={MousePointer} trend={formatDelta(stats.changes.pageViews)} description="Total page loads" color="green" />
              <StatCard title="Sessions" value={formatNumber(stats.overview.sessions)} icon={Globe} trend={formatDelta(stats.changes.sessions)} description="Estimated visits" color="purple" />
              <StatCard title="Active now" value={formatNumber(stats.overview.activeNow)} icon={Activity} trend="Last 5 minutes" description="Live visitors" color="orange" />
            </div>

            <Card className="bg-white border-gray-200 shadow-sm mb-6">
              <CardHeader className="pb-3"><CardTitle className="text-gray-950">Traffic overview</CardTitle><CardDescription>Page views compared with the previous period</CardDescription></CardHeader>
              <CardContent><TrendChart data={stats.timeline} /></CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
                <TabsList className="h-10 bg-gray-100 p-1"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="pages">Pages</TabsTrigger><TabsTrigger value="audience">Audience</TabsTrigger><TabsTrigger value="acquisition">Acquisition</TabsTrigger></TabsList>
                <Button variant="outline" size="sm" className="w-fit bg-white border-gray-200" onClick={() => {
                  const rows = activeTab === 'pages' ? [['Path', 'Views', 'Visitors'], ...stats.paths.map((p) => [p.path, p.views, p.visitors])] : [['Date', 'Page views', 'Visitors'], ...stats.timeline.map((p) => [p.date, p.page_views, p.unique_visitors])];
                  const csv = rows.map((row) => row.map((cell) => `"${String(cell).split('"').join('""')}"`).join(',')).join('\n');
                  const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = `game4git-${activeTab}-${timeRange}.csv`; link.click(); URL.revokeObjectURL(link.href);
                }}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
              </div>
              <TabsContent value="overview" className="mt-0"><div className="grid gap-6 lg:grid-cols-2"><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Top pages</CardTitle><CardDescription>Most visited routes in this period</CardDescription></CardHeader><CardContent><BarChart data={stats.paths.slice(0, 8)} labelKey="path" valueKey="views" maxValue={maxPathViews} color="blue" /></CardContent></Card><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Top referrers</CardTitle><CardDescription>Where visitors came from</CardDescription></CardHeader><CardContent><BarChart data={stats.referrers.slice(0, 8)} labelKey="referrer" valueKey="count" maxValue={maxReferrerCount} color="green" /></CardContent></Card></div></TabsContent>
              <TabsContent value="pages" className="mt-0"><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Pages</CardTitle><CardDescription>Route performance by page views and unique visitors</CardDescription></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100 text-left text-gray-500"><th className="pb-3 font-medium">Path</th><th className="pb-3 text-right font-medium">Views</th><th className="pb-3 text-right font-medium">Visitors</th><th className="pb-3 text-right font-medium">Share</th></tr></thead><tbody>{stats.paths.map((page) => <tr key={page.path} className="border-b border-gray-50 last:border-0"><td className="py-3 font-medium text-gray-900">{page.path}</td><td className="py-3 text-right text-gray-700">{formatNumber(page.views)}</td><td className="py-3 text-right text-gray-700">{formatNumber(page.visitors)}</td><td className="py-3 text-right text-gray-500">{stats.overview.pageViews ? `${((page.views / stats.overview.pageViews) * 100).toFixed(1)}%` : '0%'}</td></tr>)}</tbody></table></div></CardContent></Card></TabsContent>
              <TabsContent value="audience" className="mt-0"><div className="grid gap-6 md:grid-cols-2"><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Countries</CardTitle></CardHeader><CardContent><BarChart data={stats.countries.slice(0, 8).map(c => ({ ...c, country: COUNTRY_NAMES[c.country] || c.country }))} labelKey="country" valueKey="count" maxValue={maxCountryCount} color="orange" /></CardContent></Card><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Devices</CardTitle></CardHeader><CardContent><BarChart data={stats.devices.map(d => ({ ...d, device_type: DEVICE_LABELS[d.device_type] || d.device_type }))} labelKey="device_type" valueKey="count" maxValue={maxDeviceCount} color="cyan" /></CardContent></Card><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Browsers</CardTitle></CardHeader><CardContent><BarChart data={stats.browsers.slice(0, 8)} labelKey="browser" valueKey="count" maxValue={maxBrowserCount} color="purple" /></CardContent></Card><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Operating systems</CardTitle></CardHeader><CardContent><BarChart data={stats.os.slice(0, 8)} labelKey="os" valueKey="count" maxValue={maxOsCount} color="pink" /></CardContent></Card></div></TabsContent>
              <TabsContent value="acquisition" className="mt-0"><div className="grid gap-6 md:grid-cols-2"><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">Referrers</CardTitle><CardDescription>Traffic from external sites</CardDescription></CardHeader><CardContent><BarChart data={stats.referrers} labelKey="referrer" valueKey="count" maxValue={maxReferrerCount} color="green" /></CardContent></Card><Card className="bg-white border-gray-200 shadow-sm"><CardHeader><CardTitle className="text-gray-950">UTM sources</CardTitle><CardDescription>Campaign attribution</CardDescription></CardHeader><CardContent><BarChart data={stats.utmSources} labelKey="utm_source" valueKey="count" maxValue={maxUtmCount} color="purple" /></CardContent></Card></div></TabsContent>
            </Tabs>

            <Card className="bg-white border-gray-200 shadow-sm mt-6"><CardContent className="p-5"><div className="flex items-start gap-3"><Shield className="w-5 h-5 text-emerald-600 mt-0.5" /><div><p className="font-medium text-gray-900">Privacy-first analytics</p><p className="text-sm text-gray-500 mt-1">No IP addresses or personal data are stored. Admin traffic is excluded from these results.</p></div></div></CardContent></Card>
          </>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {t('adminStats.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
