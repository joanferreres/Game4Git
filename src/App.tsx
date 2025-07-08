import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GdbLearning from "./pages/GdbLearning";
import ValgrindLearning from "./pages/ValgrindLearning";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

// Crear router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    errorElement: <NotFound />,
    hydrateFallbackElement: <div>Loading...</div>
  },
  {
    path: "/gdb",
    element: <GdbLearning />,
    errorElement: <NotFound />
  },
  {
    path: "/valgrind",
    element: <ValgrindLearning />,
    errorElement: <NotFound />
  },
  {
    path: "/admin",
    element: <Admin />,
    errorElement: <NotFound />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
        <SonnerToaster position="bottom-right" />
        <Analytics />
        <SpeedInsights debug={true} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
