import type { Config } from "tailwindcss";
import baseConfig from "./tailwind.config";

const playgroundFiles = [
  "./src/pages/Index.tsx",
  "./src/components/CodeEditor.tsx",
  "./src/components/DiffViewer.tsx",
  "./src/components/GitGraph.tsx",
  "./src/components/GitTerminal.tsx",
  "./src/components/GitControls.tsx",
  "./src/components/GitExercises.tsx",
  "./src/components/GitHistory.tsx",
  "./src/components/ConflictResolver.tsx",
  "./src/components/GitCommitNode.tsx",
  "./src/components/WelcomeBanner.tsx",
  "./src/components/LanguageSelector.tsx",
  "./src/components/ui/**/*.{ts,tsx}",
];

export default {
  ...baseConfig,
  content: playgroundFiles,
} satisfies Config;
