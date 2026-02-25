import { lazy, Suspense } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Home page: static import so Vite adds modulepreload, shortening the critical path
import Index from "./pages/Index";
const NotFound = lazy(() => import("./pages/NotFound"));
const GdbLearning = lazy(() => import("./pages/GdbLearning"));
const ValgrindLearning = lazy(() => import("./pages/ValgrindLearning"));
const Admin = lazy(() => import("./pages/Admin"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>
);

// Crear router with lazy-loaded pages
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <Suspense fallback={<PageLoader />}><NotFound /></Suspense>,
    hydrateFallbackElement: <PageLoader />
  },
  {
    path: "/gdb",
    element: <Suspense fallback={<PageLoader />}><GdbLearning /></Suspense>,
    errorElement: <Suspense fallback={<PageLoader />}><NotFound /></Suspense>
  },
  {
    path: "/valgrind",
    element: <Suspense fallback={<PageLoader />}><ValgrindLearning /></Suspense>,
    errorElement: <Suspense fallback={<PageLoader />}><NotFound /></Suspense>
  },
  {
    path: "/admin",
    element: <Suspense fallback={<PageLoader />}><Admin /></Suspense>,
    errorElement: <Suspense fallback={<PageLoader />}><NotFound /></Suspense>
  },
  {
    path: "*",
    element: <Suspense fallback={<PageLoader />}><NotFound /></Suspense>
  }
]);

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
