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
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useTranslation } from "react-i18next";
import {
  getLocaleFromPathname,
  getLocalizedPath,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from "@/lib/localizedRoutes";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GdbLearning from "./pages/GdbLearning";
import ValgrindLearning from "./pages/ValgrindLearning";
import GitPracticeGame from "./pages/GitPracticeGame";
import GitBranchPractice from "./pages/GitBranchPractice";
import GitMergeConflicts from "./pages/GitMergeConflicts";
import ValgrindMemoryLeaks from "./pages/ValgrindMemoryLeaks";

const Admin = lazy(() => import("./pages/Admin"));

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
    <PageComponent />
  </LocaleSync>
);

const localizedPageDefinitions = [
  { path: "/", component: Index },
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

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
    <TooltipProvider>
      <RouterProvider router={router} />
      <SonnerToaster position="bottom-right" />
      <Analytics />
      <SpeedInsights />
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
