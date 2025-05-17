import React from "react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import useGitStore from "@/store/gitStore";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const GitHistory: React.FC = () => {
  const { repository } = useGitStore();
  const { t } = useTranslation();
  
  // Get the active branch
  const activeBranch = repository.branches.find(b => b.isActive);
  
  // Get the commits in reverse chronological order (newest first)
  const sortedCommits = [...repository.commits].sort((a, b) => b.timestamp - a.timestamp);
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 rounded-full shadow-lg w-12 h-12 md:w-14 md:h-14"
          aria-label="View git history"
        >
          <History className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[540px] p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle className="text-xl font-semibold">{t('gitHistory.title')}</SheetTitle>
          <SheetDescription>
            {t('gitHistory.currentBranch')} <span className="font-semibold text-primary">{activeBranch?.name || "none"}</span>
          </SheetDescription>
        </SheetHeader>
        <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]">
          <div className="space-y-4">
            {sortedCommits.map((commit) => {
              // Find branches pointing to this commit
              const relatedBranches = repository.branches.filter(b => b.commitId === commit.id);
              
              return (
                <div 
                  key={commit.id} 
                  className={`border rounded-lg p-4 ${commit.id === repository.HEAD ? "border-primary" : "border-border"}`}
                >
                  {/* HEAD indicator */}
                  {commit.id === repository.HEAD && (
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full inline-block mb-2">
                      {t('gitHistory.head')}
                    </div>
                  )}
                  
                  {/* Branch tags */}
                  <div className="flex flex-wrap gap-2 mb-2">
                    {relatedBranches.map(branch => (
                      <span 
                        key={branch.name}
                        className={`text-xs px-2 py-1 rounded-full ${branch.isActive 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
                      >
                        {branch.name}
                      </span>
                    ))}
                  </div>
                  
                  {/* Commit details */}
                  <h3 className="text-sm font-medium">{commit.message}</h3>
                  <div className="text-xs text-muted-foreground mt-1">
                    <div>Commit: {commit.id.substring(0, 7)}</div>
                    <div>Date: {format(commit.timestamp, "MMM d, yyyy HH:mm:ss")}</div>
                    {commit.parentIds.length > 0 && (
                      <div>
                        Parents: {commit.parentIds.map(pid => pid.substring(0, 7)).join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GitHistory; 