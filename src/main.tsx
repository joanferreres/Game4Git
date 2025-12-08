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

// SEO helpers: update canonical and hreflang on route/language changes
const updateSeoLinks = () => {
  try {
    const baseUrl = 'https://game4git.games';
    const path = window.location.pathname;

    // Canonical without query params except lng for i18n pages
    const canonical = document.querySelector('link[rel="canonical"][data-dynamic-canonical="true"]');
    if (canonical) {
      const canonicalUrl = path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`;
      canonical.setAttribute('href', canonicalUrl);
    }

    // Update alternate links
    const locales = ['en', 'es', 'ca', 'fr'];
    const altNodes = document.querySelectorAll('link[rel="alternate"][data-i18n-alt]');
    altNodes.forEach((node) => {
      const hreflang = node.getAttribute('hreflang');
      if (!hreflang) return;
      if (hreflang === 'x-default') {
        node.setAttribute('href', `${baseUrl}${path}`);
      } else if (locales.includes(hreflang)) {
        node.setAttribute('href', `${baseUrl}${path}?lng=${hreflang}`);
      }
    });
  } catch (_) {
    // noop
  }
};

window.addEventListener('popstate', updateSeoLinks);
window.addEventListener('load', updateSeoLinks);
// Many routers dispatch a navigation event; as a fallback, poll shortly after mount
setTimeout(updateSeoLinks, 0);
