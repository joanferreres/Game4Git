import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  FileDiff,
  RefreshCw,
  RefreshCcw,
  Code,
  Plus,
  Terminal
} from "lucide-react";
import useGitStore from "@/store/gitStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import GitTerminal from "./GitTerminal";

const GitControls: React.FC = () => {
  const { 
    repository, 
    createCommit, 
    createBranch, 
    switchBranch, 
    resetWorkingChanges,
    selectedCommitId,
    selectCommit,
    stagedChanges,
    stageChanges,
    workingChanges,
    resetToInitialCommit,
    mergeBranch,
  } = useGitStore();
  
  const [commitMessage, setCommitMessage] = useState("");
  const [branchName, setBranchName] = useState("");
  const [sourceBranchToMerge, setSourceBranchToMerge] = useState<string | undefined>(undefined);
  const [targetBranchForMerge, setTargetBranchForMerge] = useState<string | undefined>(repository.branches.find(b => b.isActive)?.name);
  
  // Estado para controlar si se muestra la interfaz de terminal o botones
  const [useTerminal, setUseTerminal] = useState(false);
  
  // Get active branch
  const activeBranch = repository.branches.find(b => b.isActive);
  
  // Get active branch name for useEffect dependency
  const activeBranchName = activeBranch?.name;
  
  // Effect to update targetBranchForMerge when activeBranch changes, but only for initial setup
  useEffect(() => {
    // Solo establecer el valor inicial para targetBranchForMerge si está vacío
    if (activeBranchName && !targetBranchForMerge) {
      setTargetBranchForMerge(activeBranchName);
    }
  }, [activeBranchName, targetBranchForMerge]);
  
  // Handle staging changes (git add)
  const handleStageChanges = () => {
    stageChanges(workingChanges);
    toast.success("Changes staged for commit");
  };
  
  // Handle commit action
  const handleCommit = () => {
    if (!commitMessage.trim()) {
      toast.error("Please enter a commit message");
      return;
    }
    
    if (!stagedChanges) {
      toast.error("No changes have been staged for commit. Use Git Add first.");
      return;
    }
    
    createCommit(commitMessage);
    setCommitMessage("");
    toast.success("Changes committed successfully");
  };
  
  // Handle branch creation
  const handleCreateBranch = () => {
    if (!branchName.trim()) {
      toast.error("Please enter a branch name");
      return;
    }
    
    if (repository.branches.some(b => b.name === branchName)) {
      toast.error("Branch already exists");
      return;
    }
    
    createBranch(branchName);
    setBranchName("");
    toast.success(`Branch "${branchName}" created`);
  };
  
  // Handle branch switch
  const handleSwitchBranch = (value: string) => {
    switchBranch(value);
    toast.success(`Switched to branch "${value}"`);
  };
  
  // Handle reset working changes
  const handleReset = () => {
    resetWorkingChanges();
    toast.info("Changes reset to current HEAD");
  };
  
  // Handle clear selection and reset to initial commit
  const handleClearSelection = () => {
    // Clear the selected commit
    selectCommit(null);
    
    // Reset to the initial commit
    resetToInitialCommit();
    
    toast.info("Reset to initial commit");
  };
  
  // Handle merge action
  const handleMerge = () => {
    if (!sourceBranchToMerge) {
      toast.error("Please select a source branch to merge.");
      return;
    }
    if (!targetBranchForMerge) {
      toast.error("Please select a target branch to merge into.");
      return;
    }
    if (sourceBranchToMerge === targetBranchForMerge) {
      toast.error("Source and target branches cannot be the same.");
      return;
    }
    mergeBranch(sourceBranchToMerge, targetBranchForMerge);
    toast.success(`Merged branch "${sourceBranchToMerge}" into "${targetBranchForMerge}"`);
    setSourceBranchToMerge(undefined); // Reset selection
    // setTargetBranchForMerge(undefined); // Optionally reset target, or let it persist (current active branch)
  };

  const hasChangesToStage = workingChanges !== repository.commits.find(c => c.id === repository.HEAD)?.content;
  const hasStaged = stagedChanges !== null;

  // Toggle between UI modes
  const toggleTerminal = () => {
    setUseTerminal(!useTerminal);
  };

  // Contenido condicional basado en el modo de UI seleccionado
  const renderContent = () => {
    if (useTerminal) {
      return <GitTerminal />;
    }

    return (
      <CardContent className="space-y-4">
        {/* Commit Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Create Commit</h3>
          
          {/* Git Add step */}
          <div className="flex items-end gap-2 mb-2">
            <Button 
              onClick={handleStageChanges}
              disabled={!hasChangesToStage}
              className="bg-git-branch hover:bg-git-branch/80 w-full"
              size="sm"
            >
              <Plus className="mr-1 h-4 w-4" />
              Git Add (Stage Changes)
            </Button>
          </div>
          
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="Commit message"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCommit}
              disabled={!hasStaged}
              className="bg-git-commit hover:bg-git-commit/80"
            >
              <GitCommit className="mr-1 h-4 w-4" />
              Git Commit
            </Button>
          </div>
          
          {hasStaged && (
            <p className="text-xs text-muted-foreground">
              Changes staged and ready to commit
            </p>
          )}
          
          {!hasStaged && hasChangesToStage && (
            <p className="text-xs text-muted-foreground">
              You have unsaved changes. Use "Git Add" to stage them.
            </p>
          )}
        </div>
        
        <Separator />
        
        {/* Branch Section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Branches</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-xs mb-1">Current Branch</p>
              <div className="bg-muted/50 p-2 rounded-md text-sm flex items-center">
                <GitBranch className="mr-1 h-4 w-4" />
                {activeBranch?.name || "none"}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1">Switch Branch</p>
              <Select onValueChange={handleSwitchBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {repository.branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                placeholder="New branch name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleCreateBranch}
              className="bg-git-branch hover:bg-git-branch/80"
            >
              <GitBranch className="mr-1 h-4 w-4" />
              Create
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Merge Section */}
        {repository.branches.length > 1 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Merge Branches</h3>
            <div className="grid grid-cols-2 gap-2 items-end">
              <div>
                <label htmlFor="sourceBranchSelect" className="text-xs mb-1 block">Merge from:</label>
                <Select 
                  onValueChange={setSourceBranchToMerge} 
                  value={sourceBranchToMerge}
                >
                  <SelectTrigger id="sourceBranchSelect">
                    <SelectValue placeholder="Select source branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {repository.branches
                      .map((branch) => (
                        <SelectItem 
                          key={`source-${branch.name}`} 
                          value={branch.name}
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="targetBranchSelect" className="text-xs mb-1 block">Into branch:</label>
                <Select 
                  onValueChange={setTargetBranchForMerge} 
                  value={targetBranchForMerge || ""}
                >
                  <SelectTrigger id="targetBranchSelect">
                    <SelectValue placeholder="Select target branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {repository.branches
                      .map((branch) => (
                        <SelectItem 
                          key={`target-${branch.name}`} 
                          value={branch.name}
                        >
                          {branch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleMerge}
              disabled={!sourceBranchToMerge || !targetBranchForMerge || sourceBranchToMerge === targetBranchForMerge}
              className="w-full bg-git-merge hover:bg-git-merge/80 mt-2"
            >
              <GitMerge className="mr-1 h-4 w-4" />
              Merge Branches
            </Button>
            {sourceBranchToMerge === targetBranchForMerge && sourceBranchToMerge && targetBranchForMerge && (
              <p className="text-xs text-red-500">
                Source and target branches cannot be the same.
              </p>
            )}
            {sourceBranchToMerge && targetBranchForMerge && sourceBranchToMerge !== targetBranchForMerge && (
              <p className="text-xs text-muted-foreground">
                Attempting to merge branch "{sourceBranchToMerge}" into "{targetBranchForMerge}".
              </p>
            )}
          </div>
        )}
        
        <Separator />
        
        {/* Actions Section */}
        <div>
          <h3 className="text-sm font-medium mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleReset}
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Reset Changes
            </Button>
            

            <Button 
              variant="outline"
              size="sm"
              onClick={handleClearSelection}
            >
              <Code className="mr-1 h-4 w-4" />
              Clear Selection
            </Button>

            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="bg-red-50 hover:bg-red-100 text-red-600"
            >
              <RefreshCcw className="mr-1 h-4 w-4" />
              Reset All
            </Button>
          </div>
        </div>
      </CardContent>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Git Controls</span>
          <div className="flex items-center space-x-2">
            <Label htmlFor="terminal-mode" className={`text-xs ${useTerminal ? 'text-primary' : 'text-muted-foreground'}`}>
              Terminal Mode
            </Label>
            <Switch
              id="terminal-mode"
              checked={useTerminal}
              onCheckedChange={toggleTerminal}
            />
            <Terminal className={`h-4 w-4 ${useTerminal ? 'text-primary' : 'text-muted-foreground'}`} />
          </div>
        </CardTitle>
      </CardHeader>
      {renderContent()}
    </Card>
  );
};

export default GitControls;
