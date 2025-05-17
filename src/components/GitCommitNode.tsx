import React from "react";
import { Handle, Position } from "@xyflow/react";
import { GitCommit } from "@/types/git";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { GitCommit as GitCommitIcon } from "lucide-react";

interface GitCommitNodeProps {
  data: {
    commit: GitCommit;
    isHead: boolean;
    isSelected: boolean;
    branchLabels: string[];
    isMaster?: boolean;
  };
}

const GitCommitNode: React.FC<GitCommitNodeProps> = ({ data }) => {
  const { commit, isHead, isSelected, branchLabels, isMaster } = data;
  
  // Truncate commit message for display
  const shortMessage = commit.message.length > 30
    ? commit.message.substring(0, 27) + '...'
    : commit.message;
    
  // Format the commit ID (first 7 chars is standard for Git)
  const shortId = commit.id.substring(0, 7);

  // Determine node style based on branch
  const getBgColor = () => {
    if (isHead) return 'bg-amber-500';
    if (isMaster) return 'bg-green-500';
    if (branchLabels.some(label => label.toLowerCase().includes('someone') || label.toLowerCase().includes('else'))) {
      return 'bg-orange-500';
    }
    return 'bg-blue-500';
  };
  
  const getTextColor = () => {
    return 'text-white';
  }
  
  const getBorderColor = () => {
    if (isHead) return 'border-amber-600 border-2';
    if (isMaster) return 'border-green-600';
    if (branchLabels.some(label => label.toLowerCase().includes('someone') || label.toLowerCase().includes('else'))) {
      return 'border-orange-600';
    }
    return 'border-blue-600';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`
              node relative flex items-center justify-center
              ${isSelected ? 'node-active' : ''}
              rounded-full w-14 h-14 border-2
              ${getBgColor()}
              ${getBorderColor()}
              ${isSelected ? 'ring-2 ring-white' : ''}
              cursor-pointer
            `}
          >
            <div className={`flex flex-col items-center justify-center ${getTextColor()}`}>
              <GitCommitIcon size={16} />
            </div>
            
            {/* Branches */}
            <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1">
              {branchLabels.map((label) => (
                <Badge 
                  key={label} 
                  className={`text-xs px-2 py-0.5 font-medium shadow-sm
                    ${label === 'master' ? 'bg-green-600' : 
                    label.toLowerCase().includes('someone') || label.toLowerCase().includes('else') ? 'bg-orange-600' : 'bg-blue-600'}`}
                >
                  {label}
                </Badge>
              ))}
            </div>
            
            {/* Commit message */}
            {shortMessage && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs whitespace-nowrap text-muted-foreground">
                {shortMessage}
              </div>
            )}
            
            {/* HEAD indicator */}
            {isHead && (
              <div className="absolute top-[100%] right px-1 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 text-xs font-semibold">
                HEAD
              </div>
            )}
            
            {/* Connection points */}
            <Handle
              type="target"
              position={Position.Left}
              style={{ opacity: 0 }}
              isConnectable={false}
            />
            <Handle
              type="source"
              position={Position.Right}
              style={{ opacity: 0 }}
              isConnectable={false}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{commit.message}</p>
          <p className="text-xs text-muted-foreground">{new Date(commit.timestamp).toLocaleString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GitCommitNode;
