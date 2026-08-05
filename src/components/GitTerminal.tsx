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
    { command: "git branch <name>", description: t("gitCommands.createBranch") },
    { command: "git checkout <branch>", description: t("gitCommands.switchBranch") },
    { command: "git checkout -b <branch>", description: t("gitCommands.createAndSwitch") },
    { command: "git merge <branch>", description: t("gitCommands.merge") },
    { command: "git fetch", description: t("gitCommands.fetch") },
    { command: "git pull", description: t("gitCommands.pull") },
    { command: "git push", description: t("gitCommands.push") },
    { command: "git reset --hard", description: t("gitCommands.reset") },
    { command: "git log", description: t("gitCommands.log", "Show commit history") },
    { command: "git revert <commit>", description: t("gitCommands.revert", "Revert a commit") },
    { command: "git commit --amend", description: t("gitCommands.amend", "Amend last commit") },
    { command: "git merge --abort", description: t("gitCommands.mergeAbort", "Abort merge") },
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
    resetToRef,
    stageChanges,
    workingChanges,
    mergeBranch,
    stagedChanges,
    fetchRemote,
    pullRemote,
    pushToRemote,
    abortMerge,
    hasPendingConflict,
    amendCommit,
    revertCommit,
    createCommit: storeCreateCommit,
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
        case "add": {
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
        }
          
        case "commit": {
          if (parts.includes("--amend")) {
            const mIndex = parts.indexOf("-m");
            let message: string | undefined;
            if (mIndex !== -1 && mIndex + 1 < parts.length) {
              message = parts.slice(mIndex + 1).join(" ");
              if (message.startsWith('"') && message.endsWith('"')) {
                message = message.slice(1, -1);
              }
            }
            const ok = amendCommit(message);
            addToHistory({
              type: ok ? "output" : "error",
              content: ok ? "Amended the last commit." : "Error: could not amend commit.",
            });
            return;
          }
          const mIndex = parts.indexOf("-m");
          if (mIndex !== -1 && mIndex + 1 < parts.length) {
            let message = parts.slice(mIndex + 1).join(" ");
            if (message.startsWith('"') && message.endsWith('"')) {
              message = message.slice(1, -1);
            }
            const ok = storeCreateCommit(message);
            if (ok) {
              addToHistory({
                type: "output",
                content: `[${repository.branches.find((b) => b.isActive)?.name || "HEAD"}] ${message}`,
              });
            } else {
              addToHistory({
                type: "error",
                content: "Error: You must stage changes before committing. Use 'git add' first.",
              });
            }
            return;
          }
          addToHistory({
            type: "error",
            content: 'Error: Commit message required. Use \'git commit -m "your message"\'.',
          });
          return;
        }
          
        case "branch": {
          if (parts.length === 2) {
            // List branches
            const branches = repository.branches.map(b => 
              b.isActive ? `* ${b.name}` : `  ${b.name}`
            );
            addToHistory({ type: "output", content: branches.join("\n") });
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
        }
          
        case "checkout": {
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
        }
          
        case "merge": {
          if (parts.length === 3 && parts[2] === "--abort") {
            if (!hasPendingConflict()) {
              addToHistory({ type: "error", content: "Error: No merge in progress to abort." });
              return;
            }
            abortMerge();
            addToHistory({ type: "output", content: "Merge aborted." });
            return;
          }
          if (parts.length >= 3) {
            const noFf = parts.includes("--no-ff");
            const sourceBranch = parts.find(
              (p) => p !== "merge" && p !== "--no-ff" && !p.startsWith("-")
            );
            if (!sourceBranch) {
              addToHistory({ type: "error", content: "Error: Specify which branch to merge." });
              return;
            }
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

            const result = mergeBranch(sourceBranch, targetBranch, { noFf });
            const mergeMessages: Record<typeof result.status, { type: "output" | "error"; content: string }> = {
              "fast-forward": { type: "output", content: `Updating ${targetBranch} (fast-forward) <- ${sourceBranch}.` },
              merged: { type: "output", content: `Merge made by the 'recursive' strategy: '${sourceBranch}' into '${targetBranch}'.` },
              conflict: { type: "error", content: `CONFLICT: automatic merge of '${sourceBranch}' failed; fix conflicts and then commit the result.` },
              "up-to-date": { type: "output", content: "Already up to date." },
              error: { type: "error", content: result.status === "error" ? `Error: ${result.message}` : "" },
            };
            addToHistory(mergeMessages[result.status]);
            return;
          }
          addToHistory({
            type: "error",
            content: "Error: Specify which branch to merge. Use 'git merge <branch-name>'.",
          });
          return;
        }

        case "revert": {
          if (parts.length >= 3) {
            const ok = revertCommit(parts[2]);
            addToHistory({
              type: ok ? "output" : "error",
              content: ok ? `Reverted commit ${parts[2]}.` : `Error: commit '${parts[2]}' not found.`,
            });
            return;
          }
          addToHistory({ type: "error", content: "Error: Specify a commit to revert." });
          return;
        }
          
        case "reset": {
          const mode = parts.includes("--hard")
            ? "hard"
            : parts.includes("--soft")
              ? "soft"
              : "mixed";
          const refToken = parts.find(
            (p) => !["reset", "--hard", "--soft", "--mixed"].includes(p)
          );
          const ref = refToken ?? "HEAD";
          // Bare `git reset` is `git reset --mixed HEAD`: it unstages the index but
          // keeps the working tree. resetToRef('mixed','HEAD') does exactly that.
          const ok = resetToRef(mode, ref);
          addToHistory({
            type: ok ? "output" : "error",
            content: ok ? `${mode} reset to ${ref}.` : `Error: could not reset to ${ref}.`,
          });
          return;
        }

        case "log": {
          const sorted = [...repository.commits].sort((a, b) => b.timestamp - a.timestamp);
          const lines = sorted.map((commit) => {
            const branchNames = repository.branches
              .filter((b) => b.commitId === commit.id)
              .map((b) => (b.isActive ? `* ${b.name}` : b.name))
              .join(", ");
            const remoteNames = repository.remoteReferences
              .filter((r) => r.commitId === commit.id)
              .map((r) => r.name)
              .join(", ");
            const refs = [branchNames, remoteNames].filter(Boolean).join(" | ");
            return `${commit.id.slice(0, 7)} ${refs ? `(${refs})` : ""} ${commit.message}`;
          });
          addToHistory({ type: "output", content: lines.join("\n") || "No commits yet." });
          return;
        }
          
        case "status": {
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
          break;
        }
        
        case "fetch": {
          fetchRemote();
          addToHistory({ type: "output", content: "Fetched from remote." });
          return;
        }
          
        case "pull": {
          const currentBranch = repository.branches.find((b) => b.isActive)?.name;
          pullRemote(currentBranch);
          addToHistory({
            type: "output",
            content: `Pulled into ${currentBranch || "active branch"}.`,
          });
          return;
        }
          
        case "push": {
          const pushBranch = repository.branches.find((b) => b.isActive)?.name;
          pushToRemote(pushBranch);
          addToHistory({
            type: "output",
            content: `Pushed ${pushBranch || "branch"} to remote.`,
          });
          return;
        }
          
        default: {
          addToHistory({ type: "error", content: `Error: Unknown git command '${gitSubCommand}'` });
          return;
          break;
        }
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
      const help = [
        `${t("terminal.availableCommandsTitle")}:`,
        "",
        `git add [.]                 - ${t("gitCommands.stageAll")}`,
        `git add hello.c             - ${t("gitCommands.stageFile")}`,
        `git commit -m "message"     - ${t("gitCommands.commit")}`,
        `git branch                  - ${t("gitCommands.listBranches")}`,
        `git branch <name>           - ${t("gitCommands.createBranch")}`,
        `git checkout <branch>       - ${t("gitCommands.switchBranch")}`,
        `git checkout -b <branch>    - ${t("gitCommands.createAndSwitch")}`,
        `git merge <branch>          - ${t("gitCommands.merge")}`,
        `git merge --no-ff <branch>  - ${t("gitCommands.mergeNoFf", "Merge with merge commit")}`,
        `git merge --abort           - ${t("gitCommands.mergeAbort", "Abort merge")}`,
        `git fetch                   - ${t("gitCommands.fetch")}`,
        `git pull                    - ${t("gitCommands.pull")}`,
        `git push                    - ${t("gitCommands.push")}`,
        `git reset [--soft|--mixed|--hard] [ref] - ${t("gitCommands.reset")}`,
        `git log                     - ${t("gitCommands.log", "Show commit history")}`,
        `git revert <commit>         - ${t("gitCommands.revert", "Revert a commit")}`,
        `git commit --amend          - ${t("gitCommands.amend", "Amend last commit")}`,
        `git status                  - ${t("gitCommands.status")}`,
        "",
        `clear                       - ${t("gitCommands.clear")}`,
        `help                        - ${t("gitCommands.help")}`
      ].join('\n');
      
      addToHistory({ type: "output", content: help });
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
            <DropdownMenuContent align="end" className="w-[300px] max-h-[520px] overflow-y-auto p-1">
              <DropdownMenuLabel className="px-2 py-1.5">{t("terminal.availableCommands")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="space-y-1">
                {gitCommands.map((cmd, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    className="flex flex-col items-start cursor-pointer rounded-md"
                    onClick={() => insertCommand(cmd.command)}
                  >
                    <span className="font-medium text-sm">{cmd.command}</span>
                    <span className="text-xs text-muted-foreground">{cmd.description}</span>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuLabel className="px-2 py-1.5">{t("git.actions")}</DropdownMenuLabel>
              <div className="space-y-1">
                {otherCommands.map((cmd, index) => (
                  <DropdownMenuItem 
                    key={index} 
                    className="flex flex-col items-start cursor-pointer rounded-md"
                    onClick={() => insertCommand(cmd.command)}
                  >
                    <span className="font-medium text-sm">{cmd.command}</span>
                    <span className="text-xs text-muted-foreground">{cmd.description}</span>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100%-48px)] flex flex-col">
          <ScrollArea className="flex-1 p-4 font-mono text-sm bg-black text-green-400 max-h-[400px]" ref={scrollAreaRef}>
            {history.map((line, index) => (
              <div key={index} className={`mb-1 whitespace-pre-wrap ${line.type === "error" ? "text-red-400" : ""}`}>
                {line.content}
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
                className="border-none focus-visible:ring-0 bg-transparent font-mono text-green-400 min-h-[40px]"
                placeholder={t("terminal.placeholder")}
                aria-label={t("terminal.inputLabel", "Git terminal command input")}
              />
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default GitTerminal;