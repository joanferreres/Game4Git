// https://vitejs.dev/config/
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { cssPreloadPlugin } from './vite-plugin-css-preload';

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
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      clientPort: 24678,
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
  plugins: [react(), cssPreloadPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: 'esbuild' as const,
    sourcemap: true,
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          monaco: ['@monaco-editor/react', '@monaco-editor/loader'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
          store: ['zustand'],
          form: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  }
});
