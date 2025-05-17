import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import CodeEditor from "@/components/CodeEditor";
import GitGraph from "@/components/GitGraph";
import DiffViewer from "@/components/DiffViewer";
import GitControls from "@/components/GitControls";
import GitHistory from "@/components/GitHistory";
import useGitStore from "@/store/gitStore";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

const GitGame: React.FC = () => {
  const [showDiff, setShowDiff] = useState(false);
  const { repository, workingChanges, selectedCommitId, stagedChanges } = useGitStore();
  
  // Get the selected commit if any
  const selectedCommit = selectedCommitId 
    ? repository.commits.find(c => c.id === selectedCommitId) 
    : null;
  
  // Get the current HEAD commit
  const headCommit = repository.commits.find(c => c.id === repository.HEAD);
  
  // Function to toggle diff view
  const toggleDiff = () => {
    setShowDiff(!showDiff);
  };
  
  // Listen for changes to stagedChanges
  useEffect(() => {
    if (stagedChanges) {
      setShowDiff(true); // Show diff when changes are staged
    }
  }, [stagedChanges]);
  
  return (
    <div className="container min-h-screen py-8 flex flex-col">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Git Game</h1>
       
        <p className="text-muted-foreground">
          Learn Git concepts visually with this interactive playground
        </p>
      </header>
      
      {/* Floating Action Button for Usage Guide Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed top-1/2 left-4 transform -translate-y-1/2 z-50 rounded-full shadow-lg w-12 h-12 md:w-14 md:h-14"
            aria-label="Open usage guide"
          >
            <Info className="h-6 w-6 md:h-7 md:w-7" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-[540px] p-0">
          <SheetHeader className="p-6 pb-4 border-b">
            <SheetTitle className="text-xl font-semibold">How to Use This Git Playground</SheetTitle>
            <SheetDescription>
              Follow these steps to learn Git concepts visually.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6 overflow-y-auto h-[calc(100vh-80px)]"> {/* Adjust height as needed */}
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>
                <strong>Switch/Select Branch</strong>: Use the 'Branches' section in 'Git Controls' (bottom panel) to switch to an existing branch or create a new one. Your file modifications and new commits will apply to this active branch.
              </li>
              <li>
                <strong>Edit Code</strong>: Modify the code in the 'Code Editor' on the left.
              </li>
              <li>
                <strong>Stage Changes (Git Add)</strong>: Once you've made changes, click 'Git Add (Stage Changes)' in 'Git Controls'. This prepares your modifications for the next commit on the active branch.
              </li>
              <li>
                <strong>Commit Changes</strong>: Enter a commit message and click 'Git Commit'. This saves a snapshot of your staged changes on the current active branch. The Git Graph will update.
              </li>
              <li>
                <strong>Create New Branch</strong>: In 'Git Controls', type a new branch name under the 'Branches' section and click 'Create'. This creates a new branch from the current commit (HEAD).
              </li>
              <li>
                <strong>Merge Branches</strong>:
                <ul className="list-disc list-inside pl-6 space-y-1.5 mt-1.5">
                  <li>In 'Git Controls', under 'Merge Branches', select the branch you want to merge from (source) and the branch you want to merge into (target).</li>
                  <li>Click 'Merge Branches'. A new merge commit will be created on the target branch, and the graph will update. The target branch becomes active.</li>
                </ul>
              </li>
              <li>
                <strong>View History & Commits</strong>: The 'Git Graph' (middle panel) visualizes your commit history. Click on any commit node in the graph to see its details and content in the right panel.
              </li>
              <li>
                <strong>View Changes (Diff)</strong>: When you stage changes using 'Git Add', a diff view will automatically appear in the right panel showing the differences between your changes and the HEAD commit.
              </li>
              <li>
                <strong>Experiment</strong>: Try different sequences of commands to see how the Git history and file states change!
              </li>
            </ol>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Floating Action Button for Git History Sheet */}
      <GitHistory />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 mb-6">
        {/* Left Column - Code Editor */}
        <div className="h-[500px]">
          <CodeEditor />
        </div>
        
        {/* Middle Column - Git Graph */}
        <div className="h-[500px]">
          <GitGraph />
        </div>
        
        {/* Right Column - Diff or Selected Commit View */}
        <div className="h-[500px]">
          {selectedCommit ? (
            <CodeEditor 
              readOnly={true} 
              content={selectedCommit.content} 
            />
          ) : showDiff && headCommit ? (
            <DiffViewer 
              oldContent={headCommit.content} 
              newContent={stagedChanges || workingChanges} 
            />
          ) : (
            <Card className="w-full h-full flex items-center justify-center">
              <CardContent className="text-center p-6">
                <h3 className="text-lg font-medium mb-2">Git Visualization</h3>
                <p className="text-muted-foreground">
                  Select a commit from the graph to view its contents, or use "Git Add" to stage changes and see the differences with the current HEAD commit.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Bottom Control Panel */}
      <div>
        <GitControls />
      </div>
      
      {/* Footer */}
      <footer className="mt-8 py-4 border-t border-border text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Git Game Logo" className="h-6 w-6" />
            <p className="font-medium">Git Game</p>
          </div>
          <p>&copy; {new Date().getFullYear()} Joan Ferreres Vivero. All rights reserved.</p>
          <p>Built with React, TypeScript and TailwindCSS. Learn Git concepts visually.</p>
        </div>
      </footer>
    </div>
  );
};

export default GitGame;
