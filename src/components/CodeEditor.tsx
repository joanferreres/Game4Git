import React, { useState, useEffect } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import useGitStore from "@/store/gitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import Prism languages and theme
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/themes/prism-dark.css";

interface CodeEditorProps {
  readOnly?: boolean;
  content?: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ readOnly = false, content, language = "c" }) => {
  const { workingChanges, updateWorkingChanges } = useGitStore();
  
  const editorContent = content ?? workingChanges;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleValueChange = (value: string) => {
    if (!readOnly) {
      updateWorkingChanges(value);
    }
  };

  // Get Prism language
  const getPrismLanguage = (): PrismLanguage => {
    switch (language.toLowerCase()) {
      case "c":
        return (languages.c as PrismLanguage) || (languages.text as PrismLanguage);
      case "cpp":
      case "c++":
        return (languages.cpp as PrismLanguage) || (languages.c as PrismLanguage) || (languages.text as PrismLanguage);
      default:
        return (languages.c as PrismLanguage) || (languages.text as PrismLanguage);
    }
  };

  const highlightCode = (code: string) => {
    const prismLang = getPrismLanguage();
    return highlight(code, prismLang, language);
  };

  if (!mounted) {
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
        <CardContent className="p-0 h-[calc(100%-48px)] flex items-center justify-center">
          <div className="text-sm text-muted-foreground">Cargando editor...</div>
        </CardContent>
      </Card>
    );
  }

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
        <div className="h-full bg-[#2d2d2d] text-[#f8f8f2] font-mono text-sm overflow-auto">
          <Editor
            value={editorContent || ""}
            onValueChange={handleValueChange}
            highlight={highlightCode}
            padding={16}
            readOnly={readOnly}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", "Consolas", "Monaco", monospace',
              fontSize: 14,
              lineHeight: 1.5,
              minHeight: "100%",
            }}
            textareaClassName="editor-textarea"
            preClassName="editor-pre"
            tabSize={4}
            insertSpaces={true}
            ignoreTabKey={readOnly}
          />
        </div>
      </CardContent>
      <style>{`
        .editor-textarea,
        .editor-pre {
          outline: none;
          border: none;
          background: transparent;
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          tab-size: 4;
        }
        .editor-textarea {
          resize: none;
          overflow: hidden;
        }
        .editor-pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </Card>
  );
};

export default CodeEditor;
