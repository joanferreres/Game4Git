
import React, { useMemo } from "react";
import * as diffLib from "diff";
import useGitStore from "@/store/gitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiffType } from "@/types/git";

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldContent, newContent }) => {
  // Calculate the diff between the two contents
  const diffLines = useMemo(() => {
    // Split both contents into lines
    const oldLines = oldContent.split("\n");
    const newLines = newContent.split("\n");
    
    // Use diff library to get the changes
    const changes = diffLib.diffLines(oldContent, newContent);
    
    // Convert to our DiffType format with line numbers
    let oldLineNumber = 0;
    let newLineNumber = 0;
    
    const diffResult: DiffType[] = [];
    
    changes.forEach(change => {
      const lines = change.value.split("\n");
      // Remove trailing empty line
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }
      
      lines.forEach(line => {
        if (change.added) {
          newLineNumber++;
          diffResult.push({
            type: "add",
            content: line,
            lineNumber: newLineNumber
          });
        } else if (change.removed) {
          oldLineNumber++;
          diffResult.push({
            type: "remove",
            content: line,
            lineNumber: oldLineNumber
          });
        } else {
          oldLineNumber++;
          newLineNumber++;
          diffResult.push({
            type: "unchanged",
            content: line,
            lineNumber: newLineNumber
          });
        }
      });
    });
    
    return diffResult;
  }, [oldContent, newContent]);

  return (
    <Card className="w-full h-full overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Code Differences</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto h-[calc(100%-48px)]">
        <pre className="font-mono text-sm p-4 bg-git-editor text-white h-full w-full">
          {diffLines.map((line, index) => (
            <div 
              key={index}
              className={`${
                line.type === "add" 
                  ? "diff-add" 
                  : line.type === "remove" 
                    ? "diff-remove" 
                    : ""
              }`}
            >
              <span className="line-number">{line.lineNumber}</span>
              {line.type === "add" && <span className="text-git-add">+ </span>}
              {line.type === "remove" && <span className="text-git-delete">- </span>}
              {line.type === "unchanged" && <span>  </span>}
              {line.content}
            </div>
          ))}
        </pre>
      </CardContent>
    </Card>
  );
};

export default DiffViewer;
