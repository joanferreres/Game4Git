import React, { useMemo } from "react";
import * as diffLib from "diff";
import useGitStore from "@/store/gitStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiffType } from "@/types/git";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface DiffViewerProps {
  oldContent: string;
  newContent: string;
  showConflicts?: boolean;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldContent, newContent, showConflicts = false }) => {
  const { t } = useTranslation();
  
  // Calculate the diff between the two contents
  const diffLines = useMemo(() => {
    // Handle conflict markers if present
    if (showConflicts && (
      newContent.includes('<<<<<<< HEAD') || 
      newContent.includes('=======') || 
      newContent.includes('>>>>>>>')
    )) {
      return parseConflictMarkers(newContent);
    }
    
    // Regular diff if no conflict markers
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
  }, [oldContent, newContent, showConflicts]);
  
  // Parse content with conflict markers into DiffType objects
  const parseConflictMarkers = (content: string): DiffType[] => {
    const lines = content.split("\n");
    const result: DiffType[] = [];
    
    let lineNumber = 0;
    let inConflict = false;
    let inOurSection = false;
    let inTheirSection = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      lineNumber++;
      
      if (line.startsWith('<<<<<<< HEAD')) {
        // Start of conflict section (our version)
        inConflict = true;
        inOurSection = true;
        result.push({
          type: "conflict",
          content: line,
          lineNumber,
          isResolved: false
        });
      } else if (line.startsWith('=======')) {
        // Middle of conflict section (change from our to their version)
        inOurSection = false;
        inTheirSection = true;
        result.push({
          type: "conflict",
          content: line,
          lineNumber,
          isResolved: false
        });
      } else if (line.startsWith('>>>>>>>')) {
        // End of conflict section
        inConflict = false;
        inTheirSection = false;
        result.push({
          type: "conflict",
          content: line,
          lineNumber,
          isResolved: false
        });
      } else if (inConflict) {
        // Content inside a conflict section
        if (inOurSection) {
          result.push({
            type: "remove", // Our version shown as remove
            content: line,
            lineNumber
          });
        } else if (inTheirSection) {
          result.push({
            type: "add", // Their version shown as add
            content: line,
            lineNumber
          });
        }
      } else {
        // Normal content outside conflict
        result.push({
          type: "unchanged",
          content: line,
          lineNumber
        });
      }
    }
    
    return result;
  };

  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="py-2 px-3 sm:px-4 flex flex-row justify-between items-center flex-shrink-0">
        <CardTitle className="text-xs sm:text-sm flex items-center">
          {showConflicts ? (
            <>
              <Badge variant="destructive" className="mr-2 py-0 px-1.5 h-5">
                {t('git.conflict', "Conflict")}
              </Badge>
              {t('git.conflictView', "Merge Conflict View")}
            </>
          ) : (
            t('git.codeDifferences', "Code Differences")
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto flex-grow">
        <pre className="font-mono text-xs sm:text-sm p-3 bg-git-editor text-white h-full w-full">
          {diffLines.map((line, index) => {
            let typeClass = "";
            let typeIndicator = "  ";
            
            if (line.type === "add") {
              typeClass = "diff-add";
              typeIndicator = "+ ";
            } else if (line.type === "remove") {
              typeClass = "diff-remove";
              typeIndicator = "- ";
            } else if (line.type === "conflict") {
              typeClass = "diff-conflict";
              typeIndicator = "! ";
            }
            
            return (
              <div 
                key={index}
                className={`${typeClass} flex hover:bg-opacity-80`}
              >
                <span className="line-number text-xs shrink-0">{line.lineNumber}</span>
                <span className={`${
                  line.type === "add" 
                    ? "text-git-add" 
                    : line.type === "remove" 
                      ? "text-git-delete" 
                      : line.type === "conflict"
                        ? "text-yellow-500"
                        : ""
                } shrink-0`}>{typeIndicator}</span>
                <span className="whitespace-pre-wrap break-all">{line.content}</span>
              </div>
            );
          })}
        </pre>
      </CardContent>
    </Card>
  );
};

export default DiffViewer;
