import type { Plugin } from 'vite';

/**
 * Custom resolve function for Vite to avoid Rollup native dependencies.
 * This is added to work around the issue with Vercel deployment.
 */
export default function customResolve(): Plugin {
  return {
    name: 'vite:disable-native-modules',
    resolveId(id) {
      // Skip native extensions that cause problems in Vercel environment
      if (id.includes('rollup-linux') || id.includes('rollup-darwin') || id.includes('rollup-win32')) {
        return { id: '@rollup/rollup-js', external: true };
      }
      return null;
    }
  };
} 