import React, { useEffect } from "react";
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

  useEffect(() => {
    const textarea = document.querySelector('.editor-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.setAttribute('aria-label', 'Code editor for hello.c file');
    }
  }, []);

  const handleValueChange = (value: string) => {
    if (!readOnly) {
      updateWorkingChanges(value);
    }
  };

  const highlightCode = (code: string) => {
    // Get the appropriate language grammar
    let langGrammar;
    switch (language.toLowerCase()) {
      case "c":
        langGrammar = languages.c;
        break;
      case "cpp":
      case "c++":
        langGrammar = languages.cpp || languages.c;
        break;
      default:
        langGrammar = languages.c;
    }
    
    // Fallback to plain text if language not found
    if (!langGrammar) {
      langGrammar = languages.text;
    }
    
    return highlight(code, langGrammar, language);
  };

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
