import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

import { HelmetProvider } from 'react-helmet-async';

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Usar createRoot (no hydrateRoot): el prerender genera HTML estático con
// plantillas que no coincide con el árbol de React. hydrateRoot provocaría
// errores #418/#423. createRoot reemplaza el contenido (útil para SEO).
createRoot(rootElement).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
