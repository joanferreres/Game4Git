import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
    },
    fs: {
      strict: true, // Enhanced security for production
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: mode === 'development',
    minify: mode !== 'development' ? 'terser' : false,
    cssMinify: mode !== 'development',
    target: 'esnext',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      }
    },
    rollupOptions: {
      // Disable native plugins to avoid platform-specific dependencies
      context: 'globalThis',
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          reactflow: ['@xyflow/react'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-popover'],
          store: ['zustand'],
          utils: ['date-fns', 'clsx', 'tailwind-merge']
        },
        chunkFileNames: mode === 'production' ? 'assets/[name].[hash].js' : 'assets/[name].js',
        entryFileNames: mode === 'production' ? 'assets/[name].[hash].js' : 'assets/[name].js'
      }
    }
  },
}));
