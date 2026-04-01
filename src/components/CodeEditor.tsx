import React, { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import useGitStore from "@/store/gitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CodeEditorProps {
  readOnly?: boolean;
  content?: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ readOnly = false, content, language = "c" }) => {
  const { workingChanges, updateWorkingChanges } = useGitStore();
  const editorContent = content ?? workingChanges;

  const handleValueChange = (value: string) => {
    if (!readOnly) {
      updateWorkingChanges(value);
    }
  };

  const languageExtension = useMemo(() => {
    const normalized = language.toLowerCase();
    if (normalized === "c" || normalized === "cpp" || normalized === "c++") {
      return cpp();
    }
    return cpp();
  }, [language]);

  const editorExtensions = useMemo(
    () => [languageExtension, EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)],
    [languageExtension, readOnly]
  );

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
        <div className="h-full bg-[#282c34] text-[#f8f8f2] font-mono text-sm overflow-auto">
          <CodeMirror
            value={editorContent ?? ""}
            onChange={handleValueChange}
            theme={oneDark}
            extensions={editorExtensions}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              highlightSelectionMatches: true,
              searchKeymap: true,
            }}
            editable={!readOnly}
            height="100%"
            className="h-full"
            aria-label="Code editor for hello.c file"
          />
        </div>
      </CardContent>
      <style>{`
        .cm-editor {
          height: 100%;
          font-family: "Fira Code", "Fira Mono", "Consolas", "Monaco", monospace;
          font-size: 14px;
          line-height: 1.5;
        }
        .cm-scroller {
          min-height: 100%;
        }
      `}</style>
    </Card>
  );
};

export default CodeEditor;
