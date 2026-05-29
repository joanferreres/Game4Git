import { lazy, Suspense, useEffect, type ComponentType, type ReactNode } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  createBrowserRouter,
  RouterProvider,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { DeferredVercelMetrics } from "@/components/DeferredVercelMetrics";
import { useTranslation } from "react-i18next";
import {
  getLocaleFromPathname,
  getLocalizedPath,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/localizedRoutes";

// Lazy load pages to reduce initial bundle size
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const GdbLearning = lazy(() => import("./pages/GdbLearning"));
const ValgrindLearning = lazy(() => import("./pages/ValgrindLearning"));
const GitPracticeGame = lazy(() => import("./pages/GitPracticeGame"));
const GitBranchPractice = lazy(() => import("./pages/GitBranchPractice"));
const GitMergeConflicts = lazy(() => import("./pages/GitMergeConflicts"));
const ValgrindMemoryLeaks = lazy(() => import("./pages/ValgrindMemoryLeaks"));
const Admin = lazy(() => import("./pages/Admin"));
const Landing = lazy(() => import("./pages/Landing"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

const LocaleSync = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { i18n } = useTranslation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const legacyLocale = searchParams.get("lng");

    if (isSupportedLocale(legacyLocale)) {
      searchParams.delete("lng");
      const nextPathname = getLocalizedPath(location.pathname, legacyLocale);
      const nextSearch = searchParams.toString();
      const nextUrl = `${nextPathname}${nextSearch ? `?${nextSearch}` : ""}${location.hash}`;
      const currentUrl = `${location.pathname}${location.search}${location.hash}`;

      if (nextUrl !== currentUrl) {
        navigate(nextUrl, { replace: true });
        return;
      }
    }

    const locale = getLocaleFromPathname(location.pathname);

    if (i18n.resolvedLanguage !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [i18n, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (location.hash || navigationType === "POP") {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.hash, location.pathname, location.search, navigationType]);

  return <>{children}</>;
};

const renderPage = (PageComponent: ComponentType) => (
  <LocaleSync>
    <Suspense fallback={<PageLoader />}>
      <PageComponent />
    </Suspense>
  </LocaleSync>
);

const localizedPageDefinitions = [
  { path: "/", component: Landing },
  { path: "/playground", component: Index },
  { path: "/gdb", component: GdbLearning },
  { path: "/valgrind", component: ValgrindLearning },
  { path: "/git-practice-game", component: GitPracticeGame },
  { path: "/git-branch-practice", component: GitBranchPractice },
  { path: "/git-merge-conflicts", component: GitMergeConflicts },
  { path: "/valgrind-memory-leaks", component: ValgrindMemoryLeaks },
];

const publicRoutes = [
  ...localizedPageDefinitions.flatMap(({ path, component }) =>
    SUPPORTED_LOCALES.map((locale) => ({
      path: getLocalizedPath(path, locale),
      element: renderPage(component),
      errorElement: renderPage(NotFound),
    }))
  ),
  {
    path: "/admin",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Admin />
      </Suspense>
    ),
    errorElement: renderPage(NotFound),
  },
  {
    path: "*",
    element: renderPage(NotFound),
  },
];

const router = createBrowserRouter(publicRoutes);

const App = () => {
  const { t } = useTranslation();

  return (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[99999] inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md outline-none ring-offset-2 transition-transform duration-200 -translate-y-[150%] focus:translate-y-0 focus-visible:ring-2 focus-visible:ring-ring"
      >
        {t("common.skipToMain", "Skip to main content")}
      </a>
      <RouterProvider router={router} />
      <SonnerToaster position="bottom-right" />
      <DeferredVercelMetrics />
    </TooltipProvider>
  </ThemeProvider>
  );
};

export default App;
