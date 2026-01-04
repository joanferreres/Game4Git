import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// SEO helpers: update only hreflang links on language changes
const updateHreflangLinks = () => {
  try {
    const baseUrl = 'https://game4git.games';
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const currentLng = searchParams.get('lng');

    // Update alternate links
    const locales = ['en', 'es', 'ca', 'fr'];
    const altNodes = document.querySelectorAll('link[rel="alternate"][data-i18n-alt]');
    altNodes.forEach((node) => {
      const hreflang = node.getAttribute('hreflang');
      if (!hreflang) return;

      // For pages with lng parameter, include it in hreflang links
      // For pages without lng parameter, use clean URLs
      if (hreflang === 'x-default') {
        node.setAttribute('href', `${baseUrl}${path}`);
      } else if (locales.includes(hreflang)) {
        // Only add lng param if this page has lng parameter
        const href = currentLng ? `${baseUrl}${path}?lng=${hreflang}` : `${baseUrl}${path}`;
        node.setAttribute('href', href);
      }
    });
  } catch (_) {
    // noop
  }
};

window.addEventListener('popstate', updateHreflangLinks);
window.addEventListener('load', updateHreflangLinks);
// Many routers dispatch a navigation event; as a fallback, poll shortly after mount
setTimeout(updateHreflangLinks, 0);
