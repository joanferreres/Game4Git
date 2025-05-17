import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGitStore from "@/store/gitStore";
import { toast } from "sonner";
import { HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface TerminalLine {
  type: "input" | "output" | "error";
  content: string;
}

interface CommandExample {
  command: string;
  description: string;
}

const GitTerminal: React.FC = () => {
  const { t } = useTranslation();
  
  // Use useMemo to recreate these arrays when t (translation function) changes
  const gitCommands = React.useMemo<CommandExample[]>(() => [
    { command: "git add .", description: t("gitCommands.stageAll") },
    { command: "git add hello.c", description: t("gitCommands.stageFile") },
    { command: "git commit -m \"message\"", description: t("gitCommands.commit") },
    { command: "git branch", description: t("gitCommands.listBranches") },
    { command: "git branch <n>", description: t("gitCommands.createBranch") },
    { command: "git checkout <branch>", description: t("gitCommands.switchBranch") },
    { command: "git checkout -b <branch>", description: t("gitCommands.createAndSwitch") },
    { command: "git merge <branch>", description: t("gitCommands.merge") },
    { command: "git fetch", description: t("gitCommands.fetch") },
    { command: "git pull", description: t("gitCommands.pull") },
    { command: "git push", description: t("gitCommands.push") },
    { command: "git reset --hard", description: t("gitCommands.reset") },
    { command: "git status", description: t("gitCommands.status") },
  ], [t]);

  const otherCommands = React.useMemo<CommandExample[]>(() => [
    { command: "clear", description: t("gitCommands.clear") },
    { command: "help", description: t("gitCommands.help") },
  ], [t]);
  
  const { 
    repository, 
    createCommit, 
    createBranch, 
    switchBranch, 
    resetWorkingChanges,
    stageChanges,
    workingChanges,
    resetToInitialCommit,
    mergeBranch,
    stagedChanges,
    fetchRemote,
    pullRemote,
    pushToRemote
  } = useGitStore();
  
  const [command, setCommand] = useState("");
  // Store raw history keys for i18n
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: "output", content: t("terminal.help") },
    { type: "output", content: `${t("terminal.currentBranch")} ${repository.branches.find(b => b.isActive)?.name || "none"}` }
  ]);
  
  // Effect to update the initial history when language changes
  useEffect(() => {
    setHistory([
      { type: "output", content: t("terminal.help") },
      { type: "output", content: `${t("terminal.currentBranch")} ${repository.branches.find(b => b.isActive)?.name || "none"}` }
    ]);
  }, [t, repository.branches]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Focus input when terminal mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Scroll to bottom when history changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);
  
  // Function to insert command from dropdown
  const insertCommand = (cmdText: string) => {
    // Replace placeholder text with actual values in some common cases
    let processedCmd = cmdText;
    processedCmd = processedCmd.replace("<n>", "feature-branch");
    processedCmd = processedCmd.replace("<branch>", repository.branches[0]?.name || "master");
    
    setCommand(processedCmd);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const addToHistory = (line: TerminalLine) => {
    setHistory(prev => [...prev, line]);
  };
  
  const parseCommand = (cmd: string) => {
    const parts = cmd.trim().split(/\s+/);
    const mainCommand = parts[0].toLowerCase();
    
    // Handle git commands
    if (mainCommand === "git" && parts.length > 1) {
      const gitSubCommand = parts[1].toLowerCase();
      
      switch (gitSubCommand) {
        case "add":
          if (parts.length === 2) {
            // Git add (stage all changes)
            stageChanges(workingChanges);
            addToHistory({ type: "output", content: "Changes staged for commit" });
            return;
          } else {
            // We're simplifying - only support "git add ." for now
            if (parts[2] === "." || parts[2] === "hello.c") {
              stageChanges(workingChanges);
              addToHistory({ type: "output", content: "Changes staged for commit" });
              return;
            }
          }
          break;
          
        case "commit":
          // Parse commit message from args (-m "message")
          const mIndex = parts.indexOf("-m");
          if (mIndex !== -1 && mIndex + 1 < parts.length) {
            // Extract message, handling potential quotes
            let message = parts.slice(mIndex + 1).join(" ");
            if (message.startsWith('"') && message.endsWith('"')) {
              message = message.slice(1, -1);
            }
            
            try {
              createCommit(message);
              addToHistory({ type: "output", content: `[${repository.branches.find(b => b.isActive)?.name || "HEAD"}] ${message}` });
              return;
            } catch (err) {
              addToHistory({ type: "error", content: "Error: You must stage changes before committing. Use 'git add' first." });
              return;
            }
          } else {
            addToHistory({ type: "error", content: "Error: Commit message required. Use 'git commit -m \"your message\"'." });
            return;
          }
          
        case "branch":
          if (parts.length === 2) {
            // List branches
            const branches = repository.branches.map(b => 
              b.isActive ? `* ${b.name}` : `  ${b.name}`
            );
            addToHistory({ type: "output", content: branches.join("\\n") });
            return;
          } else if (parts.length === 3) {
            // Create branch
            const branchName = parts[2];
            if (repository.branches.some(b => b.name === branchName)) {
              addToHistory({ type: "error", content: `Error: Branch '${branchName}' already exists.` });
            } else {
              createBranch(branchName);
              addToHistory({ type: "output", content: `Created branch '${branchName}'.` });
            }
            return;
          }
          break;
          
        case "checkout":
          if (parts.length === 3 && parts[2] === "-b") {
            addToHistory({ type: "error", content: "Error: Missing branch name. Use 'git checkout -b <branch-name>'." });
            return;
          } else if (parts.length === 4 && parts[2] === "-b") {
            // Create and checkout branch
            const branchName = parts[3];
            if (repository.branches.some(b => b.name === branchName)) {
              addToHistory({ type: "error", content: `Error: Branch '${branchName}' already exists.` });
            } else {
              createBranch(branchName);
              switchBranch(branchName);
              addToHistory({ type: "output", content: `Created and switched to branch '${branchName}'.` });
            }
            return;
          } else if (parts.length === 3) {
            // Checkout existing branch
            const branchName = parts[2];
            const branch = repository.branches.find(b => b.name === branchName);
            if (!branch) {
              addToHistory({ type: "error", content: `Error: Branch '${branchName}' does not exist.` });
            } else {
              switchBranch(branchName);
              addToHistory({ type: "output", content: `Switched to branch '${branchName}'.` });
            }
            return;
          }
          break;
          
        case "merge":
          if (parts.length === 3) {
            const sourceBranch = parts[2];
            const targetBranch = repository.branches.find(b => b.isActive)?.name;
            
            if (!targetBranch) {
              addToHistory({ type: "error", content: "Error: No active branch to merge into." });
              return;
            }
            
            if (!repository.branches.some(b => b.name === sourceBranch)) {
              addToHistory({ type: "error", content: `Error: Branch '${sourceBranch}' does not exist.` });
              return;
            }
            
            if (sourceBranch === targetBranch) {
              addToHistory({ type: "error", content: "Error: Cannot merge a branch into itself." });
              return;
            }
            
            try {
              mergeBranch(sourceBranch, targetBranch);
              addToHistory({ type: "output", content: `Merged branch '${sourceBranch}' into '${targetBranch}'.` });
              return;
            } catch (err) {
              addToHistory({ type: "error", content: "Error merging branches." });
              return;
            }
          } else {
            addToHistory({ type: "error", content: "Error: Specify which branch to merge. Use 'git merge <branch-name>'." });
            return;
          }
          
        case "reset":
          if (parts.length >= 3 && parts[2] === "--hard") {
            if (parts.length === 3) {
              // Reset to HEAD
              resetWorkingChanges();
              addToHistory({ type: "output", content: "Reset working directory to HEAD." });
              return;
            } else if (parts[3].toLowerCase() === "head") {
              resetWorkingChanges();
              addToHistory({ type: "output", content: "Reset working directory to HEAD." });
              return;
            }
          } 
          
          if (parts.length === 2) {
            // Simple reset (unstage)
            resetWorkingChanges();
            addToHistory({ type: "output", content: "Reset working directory to HEAD." });
            return;
          }
          break;
          
        case "status":
          const activeBranch = repository.branches.find(b => b.isActive);
          let status = `On branch ${activeBranch?.name || "unknown"}\n`;
          
          // Check for staged changes
          const hasStaged = !!stagedChanges;
          if (hasStaged) {
            status += "\nChanges staged for commit:\n  (use \"git commit\" to commit)\n\n";
          }
          
          // Check for unstaged changes
          const currentContent = repository.commits.find(c => c.id === repository.HEAD)?.content || "";
          const hasUnstagedChanges = workingChanges !== currentContent;
          
          if (hasUnstagedChanges && !hasStaged) {
            status += "\nChanges not staged for commit:\n  (use \"git add\" to stage)\n\n";
          }
          
          if (!hasStaged && !hasUnstagedChanges) {
            status += "\nNothing to commit, working tree clean";
          }
          
          // Add remote tracking info
          const remoteBranch = repository.remoteReferences.find(
            ref => ref.name === `${repository.remoteName}/${activeBranch?.name || ''}`
          );
          
          if (remoteBranch) {
            const isUpToDate = remoteBranch.commitId === activeBranch?.commitId;
            if (isUpToDate) {
              status += `\n\nYour branch is up to date with '${remoteBranch.name}'.`;
            } else {
              status += `\n\nYour branch is not in sync with '${remoteBranch.name}'.`;
              status += "\n  (use \"git pull\" to update your local branch)";
            }
          }
          
          addToHistory({ type: "output", content: status });
          return;
          
        case "fetch":
          toast.info(
            t("git.gitFetch"), 
            { 
              description: t("explanations.gitFetch"),
              duration: 5000
            }
          );
          addToHistory({ type: "output", content: t("explanations.simulationFetch") });
          return;
          
        case "pull":
          toast.info(
            t("git.gitPull"), 
            { 
              description: t("explanations.gitPull"),
              duration: 5000
            }
          );
          
          const currentBranch = repository.branches.find(b => b.isActive)?.name;
          addToHistory({ type: "output", content: t("explanations.simulationPull").replace('current', currentBranch || '') });
          return;
          
        case "push":
          toast.info(
            t("git.gitPush"), 
            { 
              description: t("explanations.gitPush"),
              duration: 5000
            }
          );
          
          const pushBranch = repository.branches.find(b => b.isActive)?.name;
          addToHistory({ type: "output", content: t("explanations.simulationPush").replace('branch', pushBranch || '') });
          return;
          
        default:
          addToHistory({ type: "error", content: `Error: Unknown git command '${gitSubCommand}'` });
          return;
      }
    } else if (mainCommand === "clear") {
      // Clear terminal with current language
      setHistory([
        { type: "output", content: t("terminal.help") },
        { type: "output", content: `${t("terminal.currentBranch")} ${repository.branches.find(b => b.isActive)?.name || "none"}` }
      ]);
      return;
    } else if (mainCommand === "help") {
      // Show help using current language translations
      const help = `
${t("terminal.availableCommandsTitle")}:
  git add [.]                  - ${t("gitCommands.stageAll")}
  git add hello.c              - ${t("gitCommands.stageFile")}
  git commit -m "message"      - ${t("gitCommands.commit")}
  git branch                   - ${t("gitCommands.listBranches")}
  git branch <n>               - ${t("gitCommands.createBranch")}
  git checkout <branch>        - ${t("gitCommands.switchBranch")}
  git checkout -b <branch>     - ${t("gitCommands.createAndSwitch")}
  git merge <branch>           - ${t("gitCommands.merge")}
  git fetch                    - ${t("gitCommands.fetch")}
  git pull                     - ${t("gitCommands.pull")}
  git push                     - ${t("gitCommands.push")}
  git reset [--hard]           - ${t("gitCommands.reset")}
  git status                   - ${t("gitCommands.status")}
  clear                        - ${t("gitCommands.clear")}
  help                         - ${t("gitCommands.help")}
      `;
      addToHistory({ type: "output", content: help.trim() });
      return;
    }
    
    // If we get here, command wasn't recognized
    addToHistory({ type: "error", content: `${t("terminal.commandNotRecognized")} '${cmd}'` });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (command.trim()) {
      // Add command to history
      addToHistory({ type: "input", content: `$ ${command}` });
      
      // Parse and execute command
      parseCommand(command);
      
      // Clear input
      setCommand("");
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>{t("git.terminal")}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                <HelpCircle className="h-4 w-4 mr-1" />
                <span>{t("terminal.availableCommands")}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              <DropdownMenuLabel>{t("terminal.availableCommands")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {gitCommands.map((cmd, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    className="flex flex-col items-start cursor-pointer"
                    onClick={() => insertCommand(cmd.command)}
                  >
                    <span className="font-medium">{cmd.command}</span>
                    <span className="text-xs text-muted-foreground">{cmd.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("git.actions")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                {otherCommands.map((cmd, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    className="flex flex-col items-start cursor-pointer"
                    onClick={() => insertCommand(cmd.command)}
                  >
                    <span className="font-medium">{cmd.command}</span>
                    <span className="text-xs text-muted-foreground">{cmd.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100%-48px)] flex flex-col">
          <ScrollArea className="flex-1 p-4 font-mono text-sm bg-black text-green-400" ref={scrollAreaRef}>
            {history.map((line, index) => (
              <div key={index} className={`mb-1 ${line.type === "error" ? "text-red-400" : ""}`}>
                {line.content.split("\\n").map((text, i) => (
                  <div key={`${index}-${i}`}>{text}</div>
                ))}
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="border-t border-border p-2 bg-black">
            <div className="flex items-center">
              <span className="text-green-400 mr-2 font-mono">$</span>
              <Input
                ref={inputRef}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="border-none focus-visible:ring-0 bg-transparent font-mono text-green-400"
                placeholder={t("terminal.placeholder")}
              />
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitTerminal;