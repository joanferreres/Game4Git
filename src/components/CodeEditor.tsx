
import React, { useEffect } from "react";
import Editor, { loader } from "@monaco-editor/react";
import useGitStore from "@/store/gitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Configure Monaco to only load essential features
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs'
  }
});

interface CodeEditorProps {
  readOnly?: boolean;
  content?: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ readOnly = false, content, language = "c" }) => {
  const { workingChanges, updateWorkingChanges } = useGitStore();
  
  const editorContent = content ?? workingChanges;
  
  const handleEditorChange = (value: string | undefined) => {
    if (value && !readOnly) {
      updateWorkingChanges(value);
    }
  };

  // Force the editor to be mounted only on client-side
  const [mounted, setMounted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<Error | null>(null);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-git-editor"></div>
            hello.c
          </div>
          {readOnly && <span className="text-xs text-muted-foreground">(Read Only)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-48px)]">
        {mounted && (
          <Editor
            height="100%"
            defaultLanguage={language}
            value={editorContent}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              readOnly,
              fontFamily: "monospace",
              fontSize: 14,
              theme: "vs-dark",
              automaticLayout: true,
              // Performance optimizations
              renderWhitespace: 'none',
              renderLineHighlight: 'none',
              smoothScrolling: false,
              cursorBlinking: 'solid',
              // Reduce forced reflows
              disableLayerHinting: true,
              // Disable unused features to reduce bundle size
              quickSuggestions: false,
              parameterHints: { enabled: false },
              suggestOnTriggerCharacters: false,
              acceptSuggestionOnEnter: 'off',
              tabCompletion: 'off',
              wordBasedSuggestions: false,
              // Reduce rendering overhead
              renderIndentGuides: false,
              renderFinalNewline: false,
              scrollbar: {
                vertical: 'auto',
                horizontal: 'auto',
                useShadows: false
              }
            }}
            className="border-t"
            loading={<div className="flex items-center justify-center h-full">Cargando editor de código...</div>}
            onMount={() => setIsLoading(false)}
            onValidate={() => {}}
          />
        )}
        {loadError && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-red-500">
            <p>Error cargando el editor: {loadError.message}</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-white rounded"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
