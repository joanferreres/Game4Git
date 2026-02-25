import type { Plugin } from 'vite';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Injects modulepreload for CodeEditor and GitExercises chunks to shorten the critical path.
 * These are dynamically imported by Index - without preload they load in sequence.
 */
export function preloadCriticalChunksPlugin(): Plugin {
  return {
    name: 'preload-critical-chunks',
    apply: 'build',
    closeBundle() {
      const distDir = join(process.cwd(), 'dist');
      const assetsDir = join(distDir, 'assets');
      try {
        const files = readdirSync(assetsDir);
        const codeEditor = files.find((f) => f.startsWith('CodeEditor.') && f.endsWith('.js'));
        const gitExercises = files.find((f) => f.startsWith('GitExercises.') && f.endsWith('.js'));
        if (!codeEditor || !gitExercises) return;

        const htmlPath = join(distDir, 'index.html');
        let html = readFileSync(htmlPath, 'utf-8');
        const preloads = [
          `<link rel="modulepreload" crossorigin href="/assets/${codeEditor}">`,
          `<link rel="modulepreload" crossorigin href="/assets/${gitExercises}">`,
        ].join('\n    ');
        // Inject after the first modulepreload (react) so critical chunks load in parallel
        html = html.replace(
          /(<link rel="modulepreload"[^>]+>)/,
          `$1\n    ${preloads}`
        );
        writeFileSync(htmlPath, html);
      } catch {
        // Ignore if dist doesn't exist yet
      }
    },
  };
}
