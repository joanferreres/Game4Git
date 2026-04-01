// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    fs: {
      strict: true,
    },
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 100
    },
    cors: true,
    proxy: {
      '^/api/.*': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '^/__vite_ping': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '^/sockjs-node/.*': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "connect-src 'self' ws: http: https: ws://localhost:24678 http://localhost:24678",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.gpteng.co https://cdn.jsdelivr.net https://va.vercel-scripts.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
        "img-src 'self' data: blob:",
        "font-src 'self' data: https://cdn.jsdelivr.net",
        "worker-src 'self' blob:",
        "frame-src 'self'",
        "object-src 'none'"
      ].join('; ')
    }
  },
  preview: {
    // Ensure SPA fallback in preview too
    port: 4173,
    strictPort: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    minify: "terser" as const,
    terserOptions: {
      compress: {
        passes: 2,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
    },
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/gsap") || id.includes("node_modules/@gsap")) {
            return "gsap";
          }
          if (
            id.includes("node_modules/@codemirror") ||
            id.includes("node_modules/@lezer") ||
            id.includes("node_modules/@marijn") ||
            id.includes("node_modules/@uiw/react-codemirror") ||
            id.includes("node_modules/codemirror/")
          ) {
            return "codemirror";
          }
          if (id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react/') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/router') ||
              id.includes('node_modules/scheduler')) {
            return 'react';
          }
          // ScrollArea solo se usa en GitTerminal (lazy) - chunk separado para no cargar en carga inicial
          if (id.includes('node_modules/@radix-ui/react-scroll-area')) {
            return 'ui-scroll';
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'ui';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          if (id.includes('node_modules/zustand')) {
            return 'store';
          }
          if (id.includes('node_modules/clsx') || id.includes('node_modules/tailwind-merge')) {
            return 'utils';
          }
          // Do NOT chunk i18n separately: react-i18next uses React.createContext and needs React loaded first
          if (id.includes('node_modules/@xyflow') || id.includes('node_modules/d3-')) {
            return 'graph';
          }
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
});
