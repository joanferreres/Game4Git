import type { Plugin } from 'vite';

export function cssPreloadPlugin(): Plugin {
  return {
    name: 'css-preload',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // Find CSS link tags and add preload hints
        return html.replace(
          /<link[^>]*rel=["']stylesheet["'][^>]*>/g,
          (match) => {
            // Extract href from link tag
            const hrefMatch = match.match(/href=["']([^"']+)["']/);
            if (!hrefMatch) return match;
            
            const href = hrefMatch[1];
            // Only preload CSS from our own domain
            if (!href.startsWith('/assets/') && !href.startsWith('./assets/')) {
              return match;
            }
            
            // Add preload link before stylesheet link
            const preloadLink = `<link rel="preload" href="${href}" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`;
            return preloadLink + '\n    ' + match;
          }
        );
      }
    }
  };
}

