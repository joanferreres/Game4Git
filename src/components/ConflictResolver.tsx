import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useGitStore from "@/store/gitStore";
import { toast } from "sonner";
import { AlertTriangle, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const ConflictResolver: React.FC = () => {
  const { repository, hasPendingConflict, resolveConflict, abortMerge, workingChanges, updateWorkingChanges } = useGitStore();
  const { t } = useTranslation();
  const [editedContent, setEditedContent] = useState("");
  const [conflictSections, setConflictSections] = useState<{ start: number; middle: number; end: number }[]>([]);
  
  // Parse conflict markers
  useEffect(() => {
    if (workingChanges && hasPendingConflict()) {
      setEditedContent(workingChanges);
      
      // Find all conflict sections in the content
      const lines = workingChanges.split('\n');
      const sections: { start: number; middle: number; end: number }[] = [];
      
      let currentStart = -1;
      let currentMiddle = -1;
      
      lines.forEach((line, index) => {
        if (line.startsWith('<<<<<<< HEAD')) {
          currentStart = index;
        } else if (line.startsWith('=======')) {
          currentMiddle = index;
        } else if (line.startsWith('>>>>>>>')) {
          if (currentStart !== -1 && currentMiddle !== -1) {
            sections.push({
              start: currentStart,
              middle: currentMiddle,
              end: index
            });
          }
          currentStart = -1;
          currentMiddle = -1;
        }
      });
      
      setConflictSections(sections);
    }
  }, [workingChanges, hasPendingConflict]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    updateWorkingChanges(e.target.value);
  };
  
  const handleResolve = () => {
    if (!editedContent) {
      toast.error("Cannot resolve with empty content");
      return;
    }
    
    // Check if there are still conflict markers in the content
    if (editedContent.includes('<<<<<<< HEAD') || 
        editedContent.includes('=======') || 
        editedContent.includes('>>>>>>>')) {
      toast.error("Please resolve all conflicts before continuing");
      return;
    }
    
    resolveConflict(editedContent);
  };
  
  if (!hasPendingConflict()) {
    return null;
  }
  
  const conflictInfo = repository.pendingMergeConflict;
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-2 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-red-500 text-sm sm:text-base">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          {t('git.mergeConflict', "Merge Conflict")}
        </CardTitle>
        <div className="text-xs sm:text-sm text-muted-foreground">
          {t('git.resolvingConflict', "Resolving conflict between")} 
          <span className="font-medium"> {conflictInfo?.sourceBranch}</span> {t('git.and', "and")} 
          <span className="font-medium"> {conflictInfo?.targetBranch}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 overflow-hidden flex-grow flex flex-col">
        <div className="p-2 sm:p-3 pb-0 flex-shrink-0">
          
          
          <div className="border rounded-md overflow-hidden">
            <div className="px-2 sm:px-3 py-1 sm:py-2 bg-muted/50">
              <div className="text-xs sm:text-sm font-medium">
                {t('git.resolveConflicts', "Edit to resolve conflicts")}
              </div>
            </div>
          </div>
        </div>
        
        {/* Editor takes remaining space with full height */}
        <div className="flex-grow p-2 sm:p-3 pt-0 flex flex-col overflow-hidden">
          <textarea
            value={editedContent}
            onChange={handleContentChange}
            className="w-full flex-grow p-3 font-mono text-xs sm:text-sm bg-git-editor text-white resize-none rounded-b-md"
            spellCheck={false}
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 px-3 sm:px-4 pb-2 sm:pb-3 flex-shrink-0 gap-2">
        <Button
          variant="outline"
          onClick={abortMerge}
          className="text-red-500 text-xs sm:text-sm h-8 sm:h-9"
        >
          <X className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          {t('git.abortMerge', "Abort Merge")}
        </Button>
        <Button
          onClick={handleResolve}
          className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm h-8 sm:h-9"
        >
          <Check className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
          {t('git.completeResolve', "Complete Merge")}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConflictResolver; 