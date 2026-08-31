import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/600.css'
import '@fontsource/dm-sans/700.css'
import './index.css'
import './i18n'

import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import * as Sentry from '@sentry/react';
import { registerBrowserWebMCPTools } from './lib/webmcp.js';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

void registerBrowserWebMCPTools().catch((error) => {
  // WebMCP is optional; an unavailable or disabled implementation must not
  // prevent the learning app from starting.
  console.warn("Unable to register Game4Git WebMCP tools", error);
});

// Usar createRoot (no hydrateRoot): el prerender genera HTML estático con
// plantillas que no coincide con el árbol de React. hydrateRoot provocaría
// errores #418/#423. createRoot reemplaza el contenido (útil para SEO).
createRoot(rootElement).render(
  <ErrorBoundary>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </ErrorBoundary>
);
