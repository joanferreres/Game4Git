const SUPPORTED_LOCALES = new Set(["en", "es", "ca", "fr"]);

const GUIDE_PATHS = {
  "git-practice-game": "/git-practice-game/",
  "branch-practice": "/git-branch-practice/",
  "merge-conflicts": "/git-merge-conflicts/",
  "remote-workflow": "/git-remote-workflow/",
  "reset-guide": "/git-reset-guide/",
};

const localizePath = (pathname, locale) => {
  const resolvedLocale = SUPPORTED_LOCALES.has(locale) ? locale : "en";
  return resolvedLocale === "en" ? pathname : `/${resolvedLocale}${pathname}`;
};

/**
 * Registers only actions that Game4Git can perform locally in the browser.
 * The native WebMCP API is intentionally feature-detected by the caller so
 * unsupported browsers continue to work without a polyfill.
 */
export async function registerGame4GitTools({ modelContext, navigate }) {
  await Promise.all([
    modelContext.registerTool({
      name: "open-game4git-playground",
      description: "Open Game4Git's interactive Git playground in the requested language.",
      inputSchema: {
        type: "object",
        properties: {
          locale: {
            type: "string",
            enum: ["en", "es", "ca", "fr"],
            description: "Language for the learning interface. Defaults to English.",
          },
        },
        additionalProperties: false,
      },
      async execute({ locale = "en" } = {}) {
        navigate(localizePath("/playground/", locale));
        return { content: [{ type: "text", text: "Opened the Game4Git interactive playground." }] };
      },
    }),
    modelContext.registerTool({
      name: "open-game4git-guide",
      description: "Open a Game4Git guided practice page for Git workflows.",
      inputSchema: {
        type: "object",
        properties: {
          guide: {
            type: "string",
            enum: Object.keys(GUIDE_PATHS),
            description: "The guided practice to open.",
          },
          locale: {
            type: "string",
            enum: ["en", "es", "ca", "fr"],
            description: "Language for the learning interface. Defaults to English.",
          },
        },
        required: ["guide"],
        additionalProperties: false,
      },
      async execute({ guide, locale = "en" } = {}) {
        const pathname = GUIDE_PATHS[guide];
        if (!pathname) {
          throw new Error(`Unknown guide: ${guide}`);
        }

        navigate(localizePath(pathname, locale));
        return { content: [{ type: "text", text: `Opened the ${guide} Game4Git guide.` }] };
      },
    }),
  ]);
}

export function registerBrowserWebMCPTools() {
  const modelContext = document.modelContext;
  if (!modelContext?.registerTool) {
    return Promise.resolve();
  }

  return registerGame4GitTools({
    modelContext,
    navigate: (pathname) => window.location.assign(pathname),
  });
}
