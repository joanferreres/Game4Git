import type { Plugin } from 'vite';

export function cssPreloadPlugin(): Plugin {
  return {
    name: 'css-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        // Convert CSS link tags to non-blocking using media="print" trick
        // This allows the page to render without waiting for CSS
        return html.replace(
          /<link([^>]*?)rel=["']stylesheet["']([^>]*?)href=["']([^"']+\.css[^"']*)["']([^>]*)>/g,
          (match, before, middle, href, after) => {
            // Only apply to our assets, not external CSS
            if (!href.includes('/assets/')) {
              return match;
            }
            
            // Create non-blocking CSS load with fallback
            return `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"${before}${middle}${after}>
    <noscript><link rel="stylesheet" href="${href}"></noscript>`;
          }
        );
      }
    }
  };
}
